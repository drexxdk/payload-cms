import { getTranslation } from '@payloadcms/translations'
import type { AdminViewServerProps, Where } from 'payload'
import type { ReactNode } from 'react'

type TranslationLabel = Parameters<typeof getTranslation>[0]

type Metric = {
  href: string
  label: ReactNode
  total: number
}

type HealthItem = {
  description: ReactNode
  href: string
  key: string
  label: ReactNode
  total: number
}

type QuickAction = {
  description: ReactNode
  href: string
  label: ReactNode
}

type RelationItem = {
  detail: ReactNode
  key: string
  title: ReactNode
}

type DashboardCollection =
  | 'courses'
  | 'media'
  | 'product-types'
  | 'products'
  | 'project-groups'
  | 'project-types'
  | 'projects'
  | 'users'

const dashboardCopy = {
  adminOverview: {
    da: 'Admin-overblik',
    de: 'Admin-Ueberblick',
    en: 'Admin overview',
    fr: "Vue d'ensemble admin",
  },
  heroDescription: {
    da: 'Dette dashboard fokuserer foerst paa strukturen: hvilket indhold der findes, hvordan de vigtigste samlinger haenger sammen, og hvor der stadig mangler data.',
    de: 'Dieses Dashboard fokussiert zuerst auf die Struktur: welche Inhalte vorhanden sind, wie die wichtigsten Sammlungen zusammenhaengen und wo noch Daten fehlen.',
    en: 'This dashboard focuses on structure first: what content exists, how the main collections relate, and where data is still missing.',
    fr: "Ce tableau de bord privilegie d'abord la structure : quels contenus existent, comment les collections principales sont reliees et ou il manque encore des donnees.",
  },
  heroTitle: {
    da: 'Se hele indholdsmodellen paa et oejekast.',
    de: 'Sieh das gesamte Inhaltsmodell auf einen Blick.',
    en: 'See the whole content model at a glance.',
    fr: "Voir l'ensemble du modele de contenu en un coup d'oeil.",
  },
  quickActionsDescription: {
    da: 'Gaa direkte til de mest almindelige oprettelses- og gennemgangsflows uden foerst at aabne hele samlingslister.',
    de: 'Wechsle direkt zwischen den haeufigsten Erstellungs- und Pruefablaufen, ohne zuerst komplette Listen zu oeffnen.',
    en: 'Move between the most common create and review flows without opening full collection lists first.',
    fr: "Passe entre les flux de creation et de revue les plus frequents sans ouvrir d'abord les listes completes.",
  },
  quickActionsTitle: {
    da: 'Hurtige handlinger',
    de: 'Schnellaktionen',
    en: 'Quick actions',
    fr: 'Actions rapides',
  },
  relationHealthDescription: {
    da: 'Disse antal fremhaever manglende koblinger og ufuldstaendige strukturer, der boer have opmaerksomhed.',
    de: 'Diese Zaehler markieren fehlende Verknuepfungen und unvollstaendige Strukturen, die Aufmerksamkeit brauchen.',
    en: 'These counts highlight missing links and incomplete structures that deserve attention.',
    fr: 'Ces comptes mettent en evidence les liens manquants et les structures incompletes qui meritent une attention particuliere.',
  },
  relationHealthTitle: {
    da: 'Relationssundhed',
    de: 'Beziehungszustand',
    en: 'Relation health',
    fr: 'Etat des relations',
  },
  relationMapDescription: {
    da: 'Et kompakt overblik over, hvordan de vigtigste samlinger passer sammen.',
    de: 'Eine kompakte Ansicht, wie die wichtigsten Sammlungen zusammenpassen.',
    en: 'A compact view of how the main collections fit together.',
    fr: "Une vue compacte de la facon dont les collections principales s'articulent.",
  },
  relationMapTitle: {
    da: 'Relationskort',
    de: 'Beziehungsuebersicht',
    en: 'Relation map',
    fr: 'Carte des relations',
  },
  sectionMetricsDescription: {
    da: 'Hurtige totaler for de samlinger, der betyder mest i det daglige administrationsarbejde.',
    de: 'Schnelle Summen fuer die Sammlungen, die in der taeglichen Admin-Arbeit am wichtigsten sind.',
    en: 'Fast totals for the collections that matter most in day-to-day admin work.',
    fr: "Totaux rapides pour les collections les plus importantes dans le travail d'administration quotidien.",
  },
  sectionMetricsTitle: {
    da: 'Kernemaalinger',
    de: 'Kernmetriken',
    en: 'Core metrics',
    fr: 'Metriques principales',
  },
} as const satisfies Record<string, TranslationLabel>

function translate(
  i18n: AdminViewServerProps['initPageResult']['req']['i18n'],
  label: TranslationLabel,
) {
  return getTranslation(label, i18n)
}

async function countDocuments(
  props: AdminViewServerProps,
  collection: DashboardCollection,
  where?: Where,
) {
  const result = await props.initPageResult.req.payload.count({
    collection,
    overrideAccess: false,
    req: props.initPageResult.req,
    where,
  })

  return result.totalDocs
}

function dashboardLink(path: string) {
  return `/admin${path}`
}

function appendQueryValue(params: URLSearchParams, key: string, value: unknown) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      appendQueryValue(params, `${key}[${index}]`, entry)
    })

    return
  }

  if (value && typeof value === 'object') {
    for (const [entryKey, entryValue] of Object.entries(value)) {
      appendQueryValue(params, `${key}[${entryKey}]`, entryValue)
    }

    return
  }

  params.set(key, String(value))
}

function normalizeWhere(where: Where): Where {
  if ('or' in where) {
    return where
  }

  if ('and' in where) {
    return { or: [where] }
  }

  return {
    or: [
      {
        and: [where],
      },
    ],
  }
}

function metricDefinitions(): Array<{ collection: DashboardCollection; label: TranslationLabel }> {
  return [
    {
      collection: 'projects',
      label: { da: 'Projekter', de: 'Projekte', en: 'Projects', fr: 'Projets' },
    },
    {
      collection: 'project-groups',
      label: {
        da: 'Projektgrupper',
        de: 'Projektgruppen',
        en: 'Project Groups',
        fr: 'Groupes de projet',
      },
    },
    { collection: 'courses', label: { da: 'Kurser', de: 'Kurse', en: 'Courses', fr: 'Cours' } },
    {
      collection: 'products',
      label: { da: 'Produkter', de: 'Produkte', en: 'Products', fr: 'Produits' },
    },
    {
      collection: 'users',
      label: { da: 'Brugere', de: 'Benutzer', en: 'Users', fr: 'Utilisateurs' },
    },
    { collection: 'media', label: { da: 'Medier', de: 'Medien', en: 'Media', fr: 'Medias' } },
  ]
}

function relationDefinitions(
  i18n: AdminViewServerProps['initPageResult']['req']['i18n'],
): RelationItem[] {
  return [
    {
      key: 'project-types-projects-groups-products',
      title: translate(i18n, {
        da: 'Projekttyper -> Projekter -> Projektgrupper -> Produkter',
        de: 'Projekttypen -> Projekte -> Projektgruppen -> Produkte',
        en: 'Project Types -> Projects -> Project Groups -> Products',
        fr: 'Types de projet -> Projets -> Groupes de projet -> Produits',
      }),
      detail: translate(i18n, {
        da: 'Projekttyper klassificerer projekter paa oeverste niveau. Projekter indeholder grupper. Grupper samler beslægtede produkter.',
        de: 'Projekttypen klassifizieren uebergeordnete Projekte. Projekte enthalten Gruppen. Gruppen buendeln verwandte Produkte.',
        en: 'Project types classify top-level projects. Projects contain groups. Groups bundle related products.',
        fr: 'Les types de projet classent les projets de premier niveau. Les projets contiennent des groupes. Les groupes rassemblent des produits lies.',
      }),
    },
    {
      key: 'projects-courses-products',
      title: translate(i18n, {
        da: 'Projekter -> Kurser -> Produkter',
        de: 'Projekte -> Kurse -> Produkte',
        en: 'Projects -> Courses -> Products',
        fr: 'Projets -> Cours -> Produits',
      }),
      detail: translate(i18n, {
        da: 'Kurser hoerer til projekter og knytter produkter ind i leverbare laeringsstrukturer.',
        de: 'Kurse gehoeren zu Projekten und binden Produkte in auslieferbare Lernstrukturen ein.',
        en: 'Courses belong to projects and link products into deliverable learning structures.',
        fr: 'Les cours appartiennent aux projets et relient les produits a des structures de formation exploitables.',
      }),
    },
    {
      key: 'users-project-memberships',
      title: translate(i18n, {
        da: 'Brugere -> Se/Rediger/Administrer -> Projekter',
        de: 'Benutzer -> Anzeigen/Bearbeiten/Verwalten -> Projekte',
        en: 'Users -> View/Edit/Manage -> Projects',
        fr: 'Utilisateurs -> Voir/Modifier/Gerer -> Projets',
      }),
      detail: translate(i18n, {
        da: 'Adgang er global paa brugerniveau, men de reelle arbejdsrettigheder knyttes via projektmedlemskaber.',
        de: 'Zugriff ist auf Benutzerebene global, aber die eigentlichen Arbeitsrechte werden ueber Projektmitgliedschaften vergeben.',
        en: 'Access is global at the user level but real working permissions are attached through project memberships.',
        fr: "L'acces est global au niveau utilisateur, mais les droits de travail reels sont rattaches via les appartenances aux projets.",
      }),
    },
    {
      key: 'media-assets',
      title: translate(i18n, {
        da: 'Medier -> Delte aktiver til nuvaerende og fremtidige indholdstyper',
        de: 'Medien -> Gemeinsame Assets fuer aktuelle und kuenftige Inhaltstypen',
        en: 'Media -> Shared assets for current and future content types',
        fr: 'Medias -> Ressources partagees pour les types de contenu actuels et futurs',
      }),
      detail: translate(i18n, {
        da: 'Medier er placeret som et voksende aktivbibliotek til billeder, video, GeoGebra, ThingLink, downloads og fremtidige interaktive medier.',
        de: 'Medien sind als wachsendes Asset-Zentrum fuer Bilder, Video, GeoGebra, ThingLink, Downloads und kuenftige interaktive Medien positioniert.',
        en: 'Media is positioned as a growing asset hub for images, video, GeoGebra, ThingLink, downloads, and future interactive media.',
        fr: 'La mediatheque est pensee comme un hub de ressources evolutif pour les images, la video, GeoGebra, ThingLink, les telechargements et les futurs medias interactifs.',
      }),
    },
  ]
}

function collectionListLink(collection: DashboardCollection, where?: Where) {
  if (!where) {
    return dashboardLink(`/collections/${collection}`)
  }

  const params = new URLSearchParams({
    depth: '1',
    limit: '10',
    page: '1',
  })

  appendQueryValue(params, 'where', normalizeWhere(where))

  return dashboardLink(`/collections/${collection}?${params.toString()}`)
}

function MetricCard({ href, label, total }: Metric) {
  return (
    <a
      className="rounded-3xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-(--theme-success-500) hover:bg-(--theme-elevation-50) hover:shadow-md"
      href={href}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-(--theme-text) opacity-65">
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold text-(--theme-text)">{total}</div>
    </a>
  )
}

function HealthCard({ description, href, label, total }: HealthItem) {
  return (
    <a
      className="rounded-3xl border border-(--theme-elevation-150) bg-(--theme-elevation-50) p-5 transition hover:border-(--theme-warning-500) hover:bg-(--theme-elevation-100)"
      href={href}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-(--theme-text)">{label}</div>
          <p className="mt-2 text-sm leading-6 text-(--theme-text) opacity-72">{description}</p>
        </div>
        <div className="rounded-full border border-(--theme-elevation-200) bg-(--theme-elevation-0) px-3 py-1 text-sm font-semibold text-(--theme-text) shadow-sm">
          {total}
        </div>
      </div>
    </a>
  )
}

function QuickActionCard({ description, href, label }: QuickAction) {
  return (
    <a
      className="rounded-2xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) px-4 py-3 transition hover:border-(--theme-success-500) hover:bg-(--theme-elevation-100)"
      href={href}
    >
      <div className="text-sm font-semibold text-(--theme-text)">{label}</div>
      <p className="mt-1 text-sm leading-6 text-(--theme-text) opacity-72">{description}</p>
    </a>
  )
}

function RelationLine({ detail, title }: { detail: ReactNode; title: ReactNode }) {
  return (
    <div className="rounded-2xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) p-4">
      <div className="text-sm font-semibold text-(--theme-text)">{title}</div>
      <p className="mt-1 text-sm leading-6 text-(--theme-text) opacity-72">{detail}</p>
    </div>
  )
}

export default async function AdminDashboard(props: AdminViewServerProps) {
  const i18n = props.initPageResult.req.i18n
  const [
    projects,
    projectGroups,
    courses,
    products,
    users,
    media,
    projectsWithoutGroups,
    projectsWithoutCourses,
    emptyProjectGroups,
    productsWithoutCourses,
    productsWithoutGroups,
    projectsWithoutViewers,
    projectsWithoutEditors,
    projectsWithoutManagers,
    usersWithoutMemberships,
  ] = await Promise.all([
    countDocuments(props, 'projects'),
    countDocuments(props, 'project-groups'),
    countDocuments(props, 'courses'),
    countDocuments(props, 'products'),
    countDocuments(props, 'users'),
    countDocuments(props, 'media'),
    countDocuments(props, 'projects', { groups: { exists: false } }),
    countDocuments(props, 'projects', { courses: { exists: false } }),
    countDocuments(props, 'project-groups', { products: { exists: false } }),
    countDocuments(props, 'products', { courses: { exists: false } }),
    countDocuments(props, 'products', { projectGroups: { exists: false } }),
    countDocuments(props, 'projects', { viewers: { exists: false } }),
    countDocuments(props, 'projects', { editors: { exists: false } }),
    countDocuments(props, 'projects', { managers: { exists: false } }),
    countDocuments(props, 'users', {
      and: [
        { viewableProjects: { exists: false } },
        { editableProjects: { exists: false } },
        { managedProjects: { exists: false } },
      ],
    }),
  ])

  const metricTotals: Record<DashboardCollection, number> = {
    courses,
    media,
    'product-types': 0,
    products,
    'project-groups': projectGroups,
    'project-types': 0,
    projects,
    users,
  }

  const metrics: Metric[] = metricDefinitions().map(({ collection, label }) => ({
    label: translate(i18n, label),
    total: metricTotals[collection],
    href: collectionListLink(collection),
  }))

  const healthItems: HealthItem[] = [
    {
      key: 'projects-without-groups',
      label: translate(i18n, {
        da: 'Projekter uden grupper',
        de: 'Projekte ohne Gruppen',
        en: 'Projects without groups',
        fr: 'Projets sans groupes',
      }),
      total: projectsWithoutGroups,
      description: translate(i18n, {
        da: 'Projekter, der endnu ikke indeholder nogen projektgrupper.',
        de: 'Projekte, die noch keine Projektgruppen enthalten.',
        en: 'Projects that do not yet contain any project groups.',
        fr: 'Projets qui ne contiennent encore aucun groupe de projet.',
      }),
      href: collectionListLink('projects'),
    },
    {
      key: 'projects-without-courses',
      label: translate(i18n, {
        da: 'Projekter uden kurser',
        de: 'Projekte ohne Kurse',
        en: 'Projects without courses',
        fr: 'Projets sans cours',
      }),
      total: projectsWithoutCourses,
      description: translate(i18n, {
        da: 'Projekter, der endnu ikke indeholder nogen kurser.',
        de: 'Projekte, die noch keine Kurse enthalten.',
        en: 'Projects that do not yet contain any courses.',
        fr: 'Projets qui ne contiennent encore aucun cours.',
      }),
      href: collectionListLink('projects'),
    },
    {
      key: 'empty-project-groups',
      label: translate(i18n, {
        da: 'Tomme projektgrupper',
        de: 'Leere Projektgruppen',
        en: 'Empty project groups',
        fr: 'Groupes de projet vides',
      }),
      total: emptyProjectGroups,
      description: translate(i18n, {
        da: 'Projektgrupper, der endnu ikke indeholder nogen produkter.',
        de: 'Projektgruppen, die noch keine Produkte enthalten.',
        en: 'Project groups that do not yet contain any products.',
        fr: 'Groupes de projet qui ne contiennent encore aucun produit.',
      }),
      href: collectionListLink('project-groups', { products: { exists: false } }),
    },
    {
      key: 'products-without-courses',
      label: translate(i18n, {
        da: 'Produkter uden kurser',
        de: 'Produkte ohne Kurse',
        en: 'Products without courses',
        fr: 'Produits sans cours',
      }),
      total: productsWithoutCourses,
      description: translate(i18n, {
        da: 'Produkter, der endnu ikke er knyttet til noget kursus.',
        de: 'Produkte, die noch keinem Kurs zugeordnet sind.',
        en: 'Products that are not linked into any course yet.',
        fr: 'Produits qui ne sont encore relies a aucun cours.',
      }),
      href: collectionListLink('products', { courses: { exists: false } }),
    },
    {
      key: 'products-without-groups',
      label: translate(i18n, {
        da: 'Produkter uden grupper',
        de: 'Produkte ohne Gruppen',
        en: 'Products without groups',
        fr: 'Produits sans groupes',
      }),
      total: productsWithoutGroups,
      description: translate(i18n, {
        da: 'Produkter, der endnu ikke indgaar i nogen projektgruppe.',
        de: 'Produkte, die noch in keiner Projektgruppe enthalten sind.',
        en: 'Products that are not included in any project group yet.',
        fr: 'Produits qui ne sont encore inclus dans aucun groupe de projet.',
      }),
      href: collectionListLink('products', { projectGroups: { exists: false } }),
    },
    {
      key: 'projects-without-viewers',
      label: translate(i18n, {
        da: 'Projekter uden seere',
        de: 'Projekte ohne Leser',
        en: 'Projects without viewers',
        fr: 'Projets sans lecteurs',
      }),
      total: projectsWithoutViewers,
      description: translate(i18n, {
        da: 'Projekter, der endnu ikke har nogen viewer-medlemskaber tildelt.',
        de: 'Projekte, denen noch keine Leser-Mitgliedschaften zugewiesen sind.',
        en: 'Projects that do not yet have any viewer memberships assigned.',
        fr: "Projets qui n'ont encore aucune appartenance lecteur attribuee.",
      }),
      href: collectionListLink('projects', { viewers: { exists: false } }),
    },
    {
      key: 'projects-without-editors',
      label: translate(i18n, {
        da: 'Projekter uden redaktoerer',
        de: 'Projekte ohne Bearbeiter',
        en: 'Projects without editors',
        fr: 'Projets sans editeurs',
      }),
      total: projectsWithoutEditors,
      description: translate(i18n, {
        da: 'Projekter, der endnu ikke har nogen editor-medlemskaber tildelt.',
        de: 'Projekte, denen noch keine Bearbeiter-Mitgliedschaften zugewiesen sind.',
        en: 'Projects that do not yet have any editor memberships assigned.',
        fr: "Projets qui n'ont encore aucune appartenance editeur attribuee.",
      }),
      href: collectionListLink('projects', { editors: { exists: false } }),
    },
    {
      key: 'projects-without-managers',
      label: translate(i18n, {
        da: 'Projekter uden ledere',
        de: 'Projekte ohne Manager',
        en: 'Projects without managers',
        fr: 'Projets sans responsables',
      }),
      total: projectsWithoutManagers,
      description: translate(i18n, {
        da: 'Projekter, der endnu ikke har nogen manager-medlemskaber tildelt.',
        de: 'Projekte, denen noch keine Manager-Mitgliedschaften zugewiesen sind.',
        en: 'Projects that do not yet have any manager memberships assigned.',
        fr: "Projets qui n'ont encore aucune appartenance responsable attribuee.",
      }),
      href: collectionListLink('projects', { managers: { exists: false } }),
    },
    {
      key: 'users-without-project-memberships',
      label: translate(i18n, {
        da: 'Brugere uden projektmedlemskaber',
        de: 'Benutzer ohne Projektmitgliedschaften',
        en: 'Users without project memberships',
        fr: 'Utilisateurs sans appartenance a un projet',
      }),
      total: usersWithoutMemberships,
      description: translate(i18n, {
        da: 'Autentificerede brugere, som ikke er tildelt som viewer, editor eller manager nogen steder.',
        de: 'Authentifizierte Benutzer, die nirgendwo als Leser, Bearbeiter oder Manager zugewiesen sind.',
        en: 'Authenticated users who are not assigned as viewer, editor, or manager anywhere.',
        fr: 'Utilisateurs authentifies qui ne sont attribues nulle part comme lecteur, editeur ou responsable.',
      }),
      href: collectionListLink('users', {
        and: [
          { viewableProjects: { exists: false } },
          { editableProjects: { exists: false } },
          { managedProjects: { exists: false } },
        ],
      }),
    },
  ]

  const quickActions: QuickAction[] = [
    {
      label: translate(i18n, {
        da: 'Opret projekt',
        de: 'Projekt erstellen',
        en: 'Create project',
        fr: 'Creer un projet',
      }),
      description: translate(i18n, {
        da: 'Start et nyt arbejdsomraade paa oeverste niveau foer du tilfoejer adgang, grupper og kurser.',
        de: 'Starte einen neuen obersten Arbeitsbereich, bevor Zugriff, Gruppen und Kurse hinzugefuegt werden.',
        en: 'Start a new top-level workspace before adding access, groups, and courses.',
        fr: "Demarrer un nouvel espace de travail principal avant d'ajouter les acces, groupes et cours.",
      }),
      href: dashboardLink('/collections/projects/create'),
    },
    {
      label: translate(i18n, {
        da: 'Opret kursus',
        de: 'Kurs erstellen',
        en: 'Create course',
        fr: 'Creer un cours',
      }),
      description: translate(i18n, {
        da: 'Tilfoej en leverbar laeringsstruktur i et eksisterende projekt.',
        de: 'Eine auslieferbare Lernstruktur innerhalb eines bestehenden Projekts anlegen.',
        en: 'Add a deliverable learning structure inside an existing project.',
        fr: "Ajouter une structure d'apprentissage exploitable dans un projet existant.",
      }),
      href: dashboardLink('/collections/courses/create'),
    },
    {
      label: translate(i18n, {
        da: 'Opret produkt',
        de: 'Produkt erstellen',
        en: 'Create product',
        fr: 'Creer un produit',
      }),
      description: translate(i18n, {
        da: 'Tilfoej genbrugeligt katalogindhold, der kan grupperes og kobles ind i kurser.',
        de: 'Wiederverwendbare Kataloginhalte anlegen, die gruppiert und in Kurse eingebunden werden koennen.',
        en: 'Add reusable catalog content that can be grouped and linked into courses.',
        fr: 'Ajouter un contenu catalogue reutilisable pouvant etre groupe et relie a des cours.',
      }),
      href: dashboardLink('/collections/products/create'),
    },
    {
      label: translate(i18n, {
        da: 'Konfigurer projektadgang',
        de: 'Projektzugriff konfigurieren',
        en: 'Configure project access',
        fr: "Configurer l'acces au projet",
      }),
      description: translate(i18n, {
        da: 'Aabn projekter, der stadig mangler ledere, saa adgangsopsaetningen kan faerdiggoeres.',
        de: 'Oeffne Projekte, denen noch Manager fehlen, damit die Zugriffseinrichtung abgeschlossen werden kann.',
        en: 'Open projects that are still missing managers so access setup can be completed.',
        fr: "Ouvrir les projets qui n'ont pas encore de responsables afin de terminer la configuration des acces.",
      }),
      href: collectionListLink('projects', { managers: { exists: false } }),
    },
    {
      label: translate(i18n, {
        da: 'Gennemgaa brugere uden medlemskaber',
        de: 'Benutzer ohne Mitgliedschaften pruefen',
        en: 'Review users without memberships',
        fr: 'Verifier les utilisateurs sans appartenance',
      }),
      description: translate(i18n, {
        da: 'Find autentificerede brugere, der endnu ikke er knyttet til projektansvar.',
        de: 'Finde authentifizierte Benutzer, die noch keinen Projektverantwortungen zugeordnet sind.',
        en: 'Find authenticated users who are not attached to any project responsibilities yet.',
        fr: 'Trouver les utilisateurs authentifies qui ne sont encore rattaches a aucune responsabilite de projet.',
      }),
      href: collectionListLink('users', {
        and: [
          { viewableProjects: { exists: false } },
          { editableProjects: { exists: false } },
          { managedProjects: { exists: false } },
        ],
      }),
    },
    {
      label: translate(i18n, {
        da: 'Gennemgaa foraeldreloese produkter',
        de: 'Verwaiste Produkte pruefen',
        en: 'Review orphaned products',
        fr: 'Verifier les produits orphelins',
      }),
      description: translate(i18n, {
        da: 'Aabn produkter, der endnu ikke er grupperet i nogen projektstruktur.',
        de: 'Oeffne Produkte, die noch keiner Projektstruktur zugeordnet sind.',
        en: 'Open products that are not yet grouped into any project structure.',
        fr: 'Ouvrir les produits qui ne sont encore groupes dans aucune structure de projet.',
      }),
      href: collectionListLink('products', { projectGroups: { exists: false } }),
    },
  ]

  const relationItems = relationDefinitions(i18n)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-6 text-(--theme-text)">
      <section
        className="overflow-hidden rounded-4xl border border-(--theme-elevation-150) p-8 shadow-sm"
        style={{
          background:
            'linear-gradient(135deg, var(--theme-elevation-0) 0%, color-mix(in srgb, var(--theme-success-500) 10%, var(--theme-elevation-50)) 55%, color-mix(in srgb, var(--theme-warning-500) 8%, var(--theme-elevation-100)) 100%)',
        }}
      >
        <div className="max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-(--theme-success-500)">
            {translate(i18n, dashboardCopy.adminOverview)}
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-(--theme-text)">
            {translate(i18n, dashboardCopy.heroTitle)}
          </h1>
          <p className="mt-4 text-base leading-7 text-(--theme-text) opacity-78">
            {translate(i18n, dashboardCopy.heroDescription)}
          </p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-(--theme-text)">
              {translate(i18n, dashboardCopy.sectionMetricsTitle)}
            </h2>
            <p className="mt-1 text-sm text-(--theme-text) opacity-72">
              {translate(i18n, dashboardCopy.sectionMetricsDescription)}
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.href} {...metric} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <div className="rounded-4xl border border-(--theme-elevation-150) bg-(--theme-elevation-0) p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-(--theme-text)">
              {translate(i18n, dashboardCopy.relationMapTitle)}
            </h2>
            <p className="mt-1 text-sm text-(--theme-text) opacity-72">
              {translate(i18n, dashboardCopy.relationMapDescription)}
            </p>
          </div>
          <div className="grid gap-4">
            {relationItems.map((item) => (
              <RelationLine key={item.key} detail={item.detail} title={item.title} />
            ))}
          </div>
        </div>

        <div className="rounded-4xl border border-(--theme-elevation-150) bg-(--theme-elevation-50) p-6 text-(--theme-text) shadow-sm">
          <h2 className="text-xl font-semibold text-(--theme-text)">
            {translate(i18n, dashboardCopy.quickActionsTitle)}
          </h2>
          <p className="mt-1 text-sm leading-6 text-(--theme-text) opacity-72">
            {translate(i18n, dashboardCopy.quickActionsDescription)}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {quickActions.map((action) => (
              <QuickActionCard key={action.href} {...action} />
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-(--theme-text)">
            {translate(i18n, dashboardCopy.relationHealthTitle)}
          </h2>
          <p className="mt-1 text-sm text-(--theme-text) opacity-72">
            {translate(i18n, dashboardCopy.relationHealthDescription)}
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {healthItems.map(({ key, ...item }) => (
            <HealthCard key={key} {...item} />
          ))}
        </div>
      </section>
    </div>
  )
}
