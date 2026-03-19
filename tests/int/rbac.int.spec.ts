import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'

import { beforeAll, describe, expect, it } from 'vitest'

import { seedProjectTypes } from '../../scripts/seed/projectTypes'
import { seedProjects } from '../../scripts/seed/projects'

type DemoUserKey = 'viewer' | 'editor' | 'manager'

const DEMO_PROJECT_TITLE = 'RBAC Demo Project'
const DEMO_EMAILS: Record<DemoUserKey, string> = {
  viewer: 'viewer@mail.com',
  editor: 'editor@mail.com',
  manager: 'manager@mail.com',
}

let payload: Payload
let projectID: number
let viewerUserID: number
let editorUserID: number
let managerUserID: number

async function getDemoUser(email: string) {
  const result = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: email,
      },
    },
    depth: 0,
    limit: 1,
  })

  const user = result.docs[0]

  if (!user) {
    throw new Error(`Missing demo user: ${email}`)
  }

  return user
}

async function getDemoProject() {
  const result = await payload.find({
    collection: 'projects',
    where: {
      title: {
        equals: DEMO_PROJECT_TITLE,
      },
    },
    depth: 0,
    limit: 1,
  })

  const project = result.docs[0]

  if (!project) {
    throw new Error(`Missing demo project: ${DEMO_PROJECT_TITLE}`)
  }

  return project
}

async function expectForbidden(action: () => Promise<unknown>) {
  await expect(action()).rejects.toMatchObject({
    status: 403,
  })
}

describe('RBAC', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    await seedProjectTypes(payload)
    await seedProjects(payload)

    const project = await getDemoProject()
    const viewer = await getDemoUser(DEMO_EMAILS.viewer)
    const editor = await getDemoUser(DEMO_EMAILS.editor)
    const manager = await getDemoUser(DEMO_EMAILS.manager)

    projectID = project.id
    viewerUserID = viewer.id
    editorUserID = editor.id
    managerUserID = manager.id
  })

  it('viewer can read the demo project but cannot update it', async () => {
    const viewer = await getDemoUser(DEMO_EMAILS.viewer)

    const project = await payload.findByID({
      collection: 'projects',
      id: projectID,
      depth: 0,
      overrideAccess: false,
      user: viewer,
    })

    expect(project.id).toBe(projectID)

    await expectForbidden(() =>
      payload.update({
        collection: 'projects',
        id: projectID,
        data: {
          lifecycle: 'active',
        },
        depth: 0,
        overrideAccess: false,
        user: viewer,
      }),
    )
  })

  it('editor can update the demo project', async () => {
    const editor = await getDemoUser(DEMO_EMAILS.editor)

    const updated = await payload.update({
      collection: 'projects',
      id: projectID,
      data: {
        lifecycle: 'active',
      },
      depth: 0,
      overrideAccess: false,
      user: editor,
    })

    expect(updated.id).toBe(projectID)
    expect(updated.lifecycle).toBe('active')
  })

  it('manager can edit project memberships but cannot assign managers', async () => {
    const manager = await getDemoUser(DEMO_EMAILS.manager)

    const updatedEditors = await payload.update({
      collection: 'projects',
      id: projectID,
      data: {
        editors: [editorUserID, viewerUserID],
      },
      depth: 0,
      overrideAccess: false,
      user: manager,
    })

    expect(updatedEditors.editors).toEqual(expect.arrayContaining([editorUserID, viewerUserID]))

    await payload.update({
      collection: 'projects',
      id: projectID,
      data: {
        editors: [editorUserID],
      },
      depth: 0,
      overrideAccess: false,
      user: manager,
    })

    const attemptedManagerUpdate = await payload.update({
      collection: 'projects',
      id: projectID,
      data: {
        managers: [managerUserID, editorUserID],
      },
      depth: 0,
      overrideAccess: false,
      user: manager,
    })

    expect(attemptedManagerUpdate.managers).toEqual([managerUserID])
  })
})
