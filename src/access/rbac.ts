import type { PayloadRequest, Where } from 'payload'
import type { User } from '../payload-types'

type RoleBearingUser = { roles?: GlobalRole[] | null } | null | undefined
type AuthenticatedUser = User | null | undefined
type GlobalRole = 'super-admin' | 'user'
type ProjectMembershipDoc = {
  isPublic?: boolean | null
  viewers?: unknown[] | null
  editors?: unknown[] | null
  managers?: unknown[] | null
}

const PROJECT_ROLE_FIELDS = {
  viewer: 'viewers',
  editor: 'editors',
  manager: 'managers',
} as const

type ProjectRole = keyof typeof PROJECT_ROLE_FIELDS

function hasRole(user: RoleBearingUser, role: GlobalRole): boolean {
  return Array.isArray(user?.roles) && user.roles.includes(role)
}

function relationIncludesUser(value: unknown, userID: number): boolean {
  if (!Array.isArray(value)) return false

  return value.some((entry) => {
    if (typeof entry === 'number') return entry === userID
    if (typeof entry !== 'object' || entry === null) return false
    if (!('id' in entry)) return false

    return (entry as { id?: unknown }).id === userID
  })
}

function membershipConditions(userID: number, prefix: string, roles: ProjectRole[]): Where[] {
  return roles.map((role) => ({
    [`${prefix}${PROJECT_ROLE_FIELDS[role]}`]: {
      in: [userID],
    },
  }))
}

export function isSuperAdmin(user: RoleBearingUser): boolean {
  return hasRole(user, 'super-admin')
}

export function buildProjectReadAccess(user: AuthenticatedUser, prefix = ''): boolean | Where {
  if (isSuperAdmin(user)) return true

  const publicCondition: Where = {
    [`${prefix}isPublic`]: {
      equals: true,
    },
  }

  if (!user) return publicCondition

  return {
    or: [
      publicCondition,
      ...membershipConditions(user.id, prefix, ['viewer', 'editor', 'manager']),
    ],
  }
}

export function buildProjectEditAccess(user: AuthenticatedUser, prefix = ''): boolean | Where {
  if (isSuperAdmin(user)) return true
  if (!user) return false

  return {
    or: membershipConditions(user.id, prefix, ['editor', 'manager']),
  }
}

export function buildProjectManagerAccess(user: AuthenticatedUser, prefix = ''): boolean | Where {
  if (isSuperAdmin(user)) return true
  if (!user) return false

  return {
    or: membershipConditions(user.id, prefix, ['manager']),
  }
}

export function canManageProjectMembers(user: AuthenticatedUser, project: unknown): boolean {
  if (isSuperAdmin(user)) return true
  if (!user || typeof project !== 'object' || project === null) return false

  return relationIncludesUser((project as ProjectMembershipDoc).managers, user.id)
}

export async function canEditProjectByID(
  req: PayloadRequest,
  projectID: number | null,
): Promise<boolean> {
  if (isSuperAdmin(req.user)) return true
  if (!req.user || projectID === null) return false

  const project = await req.payload.findByID({
    collection: 'projects',
    id: projectID,
    depth: 0,
    overrideAccess: false,
    req,
  })

  return (
    relationIncludesUser(project.editors, req.user.id) ||
    relationIncludesUser(project.managers, req.user.id)
  )
}

export async function canEditCourseByID(
  req: PayloadRequest,
  courseID: number | null,
): Promise<boolean> {
  if (isSuperAdmin(req.user)) return true
  if (!req.user || courseID === null) return false

  const course = await req.payload.findByID({
    collection: 'courses',
    id: courseID,
    depth: 0,
    overrideAccess: false,
    req,
  })

  return canEditProjectByID(req, relationshipID(course.project))
}

export async function canEditCourseChapterByID(
  req: PayloadRequest,
  chapterID: number | null,
): Promise<boolean> {
  if (isSuperAdmin(req.user)) return true
  if (!req.user || chapterID === null) return false

  const chapter = await req.payload.findByID({
    collection: 'course-chapters',
    id: chapterID,
    depth: 0,
    overrideAccess: false,
    req,
  })

  return canEditCourseByID(req, relationshipID(chapter.course))
}

export function relationshipID(value: unknown): number | null {
  if (typeof value === 'number') return value
  if (typeof value !== 'object' || value === null) return null
  if (!('id' in value)) return null

  const id = (value as { id?: unknown }).id
  return typeof id === 'number' ? id : null
}
