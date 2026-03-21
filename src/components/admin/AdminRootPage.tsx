import { PageConfigProvider } from '@payloadcms/ui'
import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import { getVisibleEntities } from '@payloadcms/ui/shared'
import { getClientConfig } from '@payloadcms/ui/utilities/getClientConfig'
import { notFound, redirect } from 'next/navigation'
import { applyLocaleFiltering, formatAdminURL } from 'payload/shared'
import * as qs from 'qs-esm'
import React from 'react'

import { DefaultTemplate, MinimalTemplate } from '@payloadcms/next/templates'
import type { CollectionPreferences, Payload, SanitizedConfig } from 'payload'
import { getPreferences } from '../../../node_modules/@payloadcms/next/dist/utilities/getPreferences.js'
import { handleAuthRedirect } from '../../../node_modules/@payloadcms/next/dist/utilities/handleAuthRedirect.js'
import { initReq } from '../../../node_modules/@payloadcms/next/dist/utilities/initReq.js'
import { isCustomAdminView } from '../../../node_modules/@payloadcms/next/dist/utilities/isCustomAdminView.js'
import { isPublicAdminRoute } from '../../../node_modules/@payloadcms/next/dist/utilities/isPublicAdminRoute.js'
import { getCustomViewByRoute } from '../../../node_modules/@payloadcms/next/dist/views/Root/getCustomViewByRoute.js'
import { getRouteData } from '../../../node_modules/@payloadcms/next/dist/views/Root/getRouteData.js'

import AdminShellTemplate from './AdminShellTemplate'

type AdminRootPageProps = {
  config: Promise<SanitizedConfig> | SanitizedConfig
  importMap: Payload['importMap']
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

type SupportedLanguageConfig = {
  translations: {
    general: {
      thisLanguage: string
    }
  }
}

function compactSearchParams(searchParams: { [key: string]: string | string[] | undefined }): {
  [key: string]: string | string[]
} {
  return Object.fromEntries(
    Object.entries(searchParams).filter((entry): entry is [string, string | string[]] => {
      return entry[1] !== undefined
    }),
  )
}

export default async function AdminRootPage({
  config: configPromise,
  importMap,
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: AdminRootPageProps) {
  const config = await configPromise
  const {
    admin: {
      routes: { createFirstUser: createFirstUserRouteConfig },
      user: userSlug,
    },
    routes: { admin: adminRoute },
  } = config

  const params = await paramsPromise
  const currentRoute = formatAdminURL({
    adminRoute,
    path: Array.isArray(params.segments) ? `/${params.segments.join('/')}` : null,
  })
  const segments = Array.isArray(params.segments) ? params.segments : []
  const isCollectionRoute = segments[0] === 'collections'
  const isGlobalRoute = segments[0] === 'globals'

  let collectionConfig = undefined
  let globalConfig = undefined

  const searchParams = await searchParamsPromise
  const normalizedSearchParams = compactSearchParams(searchParams ?? {})

  if (isCollectionRoute) {
    if (segments.length === 1) {
      const { viewKey } = getCustomViewByRoute({ config, currentRoute: '/collections' })

      if (!viewKey) {
        redirect(adminRoute)
      }
    }

    if (segments[1]) {
      collectionConfig = config.collections.find(
        ({ slug }: { slug: string }) => slug === segments[1],
      )
    }
  }

  if (isGlobalRoute) {
    if (segments.length === 1) {
      const { viewKey } = getCustomViewByRoute({ config, currentRoute: '/globals' })

      if (!viewKey) {
        redirect(adminRoute)
      }
    }

    if (segments[1]) {
      globalConfig = config.globals.find(({ slug }: { slug: string }) => slug === segments[1])
    }
  }

  if ((isCollectionRoute && !collectionConfig) || (isGlobalRoute && !globalConfig)) {
    return notFound()
  }

  const queryString = qs.stringify(searchParams ?? {}, { addQueryPrefix: true })
  const {
    cookies,
    locale,
    permissions,
    req,
    req: { payload },
  } = await initReq({
    configPromise: config,
    importMap,
    key: 'initPage',
    overrides: {
      fallbackLocale: false,
      req: {
        query: qs.parse(queryString, {
          depth: 10,
          ignoreQueryPrefix: true,
        }),
      },
      urlSuffix: `${currentRoute}${searchParams ? queryString : ''}`,
    },
  })

  if (
    !permissions.canAccessAdmin &&
    !isPublicAdminRoute({ adminRoute, config: payload.config, route: currentRoute }) &&
    !isCustomAdminView({ adminRoute, config: payload.config, route: currentRoute })
  ) {
    redirect(
      handleAuthRedirect({
        config: payload.config,
        route: currentRoute,
        searchParams: normalizedSearchParams,
        user: req.user ?? undefined,
      }),
    )
  }

  let collectionPreferences: CollectionPreferences | undefined = undefined

  if (collectionConfig && req.user && segments.length === 2) {
    if (config.folders && collectionConfig.folders && segments[1] !== config.folders.slug) {
      await getPreferences(
        `collection-${collectionConfig.slug}`,
        req.payload,
        req.user.id,
        config.admin.user,
      ).then((result: { value?: CollectionPreferences } | null) => {
        if (result?.value) {
          collectionPreferences = result.value
        }
      })
    }
  }

  const {
    browseByFolderSlugs,
    DefaultView,
    documentSubViewType,
    routeParams,
    templateClassName,
    templateType,
    viewActions,
    viewType,
  } = getRouteData({
    adminRoute,
    collectionConfig,
    collectionPreferences,
    currentRoute,
    globalConfig,
    payload,
    searchParams: normalizedSearchParams,
    segments,
  })

  req.routeParams = routeParams

  const dbHasUser =
    req.user ||
    (await req.payload.db
      .findOne({
        collection: userSlug,
        req,
      })
      ?.then((doc: unknown) => Boolean(doc)))

  if (!DefaultView?.Component && !DefaultView?.payloadComponent) {
    if (req.user) {
      notFound()
    }

    if (dbHasUser) {
      redirect(adminRoute)
    }
  }

  const usersCollection = config.collections.find(({ slug }: { slug: string }) => slug === userSlug)
  const disableLocalStrategy = usersCollection?.auth?.disableLocalStrategy
  const createFirstUserRoute = formatAdminURL({
    adminRoute,
    path: createFirstUserRouteConfig,
  })

  if (disableLocalStrategy && currentRoute === createFirstUserRoute) {
    redirect(adminRoute)
  }

  if (!dbHasUser && currentRoute !== createFirstUserRoute && !disableLocalStrategy) {
    redirect(createFirstUserRoute)
  }

  if (dbHasUser && currentRoute === createFirstUserRoute) {
    redirect(adminRoute)
  }

  if (!DefaultView?.Component && !DefaultView?.payloadComponent && !dbHasUser) {
    redirect(adminRoute)
  }

  const clientConfig = getClientConfig({
    config,
    i18n: req.i18n,
    importMap,
    user: viewType === 'createFirstUser' ? true : req.user!,
  })

  await applyLocaleFiltering({ clientConfig, config, req })

  if (
    clientConfig.localization &&
    req.locale &&
    !clientConfig.localization.localeCodes.includes(req.locale)
  ) {
    redirect(
      `${currentRoute}${qs.stringify(
        {
          ...searchParams,
          locale: clientConfig.localization.localeCodes.includes(
            clientConfig.localization.defaultLocale,
          )
            ? clientConfig.localization.defaultLocale
            : clientConfig.localization.localeCodes[0],
        },
        { addQueryPrefix: true },
      )}`,
    )
  }

  const visibleEntities = getVisibleEntities({ req })
  const folderID = routeParams.folderID

  const renderedView = RenderServerComponent({
    clientProps: {
      browseByFolderSlugs,
      clientConfig,
      documentSubViewType,
      viewType,
    },
    Component: DefaultView.payloadComponent,
    Fallback: DefaultView.Component as React.ComponentType,
    importMap,
    serverProps: {
      clientConfig,
      collectionConfig,
      docID: routeParams.id,
      folderID,
      globalConfig,
      i18n: req.i18n,
      importMap,
      initPageResult: {
        collectionConfig,
        cookies,
        docID: routeParams.id,
        globalConfig,
        languageOptions: Object.entries(req.payload.config.i18n.supportedLanguages || {}).reduce(
          (
            acc: Array<{ label: string; value: string }>,
            [language, languageConfig]: [string, SupportedLanguageConfig],
          ) => {
            if (Object.keys(req.payload.config.i18n.supportedLanguages).includes(language)) {
              acc.push({
                label: languageConfig.translations.general.thisLanguage,
                value: language,
              })
            }

            return acc
          },
          [],
        ),
        locale,
        permissions,
        req,
        translations: req.i18n.translations,
        visibleEntities: {
          collections: visibleEntities?.collections,
          globals: visibleEntities?.globals,
        },
      },
      params,
      payload: req.payload,
      searchParams,
      viewActions,
    },
  })

  return (
    <PageConfigProvider config={clientConfig}>
      {!templateType ? <>{renderedView}</> : null}
      {templateType === 'minimal' ? (
        <MinimalTemplate className={templateClassName}>{renderedView}</MinimalTemplate>
      ) : null}
      {templateType === 'default' && viewType === 'account' ? (
        <DefaultTemplate
          collectionSlug={collectionConfig?.slug}
          docID={routeParams.id}
          documentSubViewType={documentSubViewType}
          globalSlug={globalConfig?.slug}
          i18n={req.i18n}
          locale={locale}
          params={params}
          payload={req.payload}
          permissions={permissions}
          req={req}
          searchParams={searchParams}
          user={req.user ?? undefined}
          viewActions={viewActions}
          viewType={viewType}
          visibleEntities={{
            collections: visibleEntities?.collections,
            globals: visibleEntities?.globals,
          }}
        >
          {renderedView}
        </DefaultTemplate>
      ) : null}
      {templateType === 'default' && viewType !== 'account' ? (
        <AdminShellTemplate
          collectionSlug={collectionConfig?.slug}
          docID={routeParams.id}
          documentSubViewType={documentSubViewType}
          globalSlug={globalConfig?.slug}
          i18n={req.i18n}
          locale={locale}
          params={params}
          payload={req.payload}
          permissions={permissions}
          req={req}
          searchParams={searchParams}
          user={req.user ?? undefined}
          viewActions={viewActions}
          viewType={viewType}
          visibleEntities={{
            collections: visibleEntities?.collections,
            globals: visibleEntities?.globals,
          }}
        >
          {renderedView}
        </AdminShellTemplate>
      ) : null}
    </PageConfigProvider>
  )
}
