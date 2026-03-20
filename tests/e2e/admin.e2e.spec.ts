import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

const chapterCreateContextURL =
  'http://localhost:3000/admin/collections/course-chapters/create?returnTo=%2Fadmin%2Feditorial%2Fprojects%2F1%2Fgroups%2F1%2Fproducts%2F1%2Fcourses%2F1&editorialProjectId=1&editorialGroupId=1&editorialProductId=1&editorialCourseId=1'
const editorialHomeURL = 'http://localhost:3000/admin/editorial'
const chapterEditorialURL =
  'http://localhost:3000/admin/editorial/projects/1/groups/1/products/1/courses/1/chapters/1'
const invalidEditorialURL =
  'http://localhost:3000/admin/editorial/projects/1/groups/999999/products/1'

test.describe('Admin Panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }, testInfo) => {
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL('http://localhost:3000/admin')
    const dashboardArtifact = page.locator('span[title="Dashboard"]').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users')
    await expect(page).toHaveURL('http://localhost:3000/admin/collections/users')
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users/create')
    await expect(page).toHaveURL(/\/admin\/collections\/users\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('input[name="email"]')
    await expect(editViewArtifact).toBeVisible()
  })

  test('shows the administration surface switcher and maintenance-only actions', async () => {
    await page.goto('http://localhost:3000/admin')

    await expect(page.getByRole('navigation', { name: 'Surface switcher' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Administration' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(page.getByRole('heading', { name: 'Maintenance actions' })).toBeVisible()
    await expect(
      page.getByText('Normal content creation should start in the editorial workspace.'),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Create project' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Create course' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Create product' })).toHaveCount(0)
  })

  test('shows editorial context and locked parent field on contextual create routes', async () => {
    await page.goto(chapterCreateContextURL)

    await expect(page.getByRole('navigation', { name: 'Surface switcher' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Editorial', exact: true })).not.toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(page.getByRole('link', { name: 'Administration', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(page.getByRole('navigation', { name: 'Editorial context' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Return to editorial page' })).toBeVisible()
    await expect(page.getByText('This course is locked by the editorial path.')).toBeVisible()
  })

  test('shows editorial home as the canonical content entry point', async () => {
    await page.goto(editorialHomeURL)

    await expect(page).toHaveURL(editorialHomeURL)
    await expect(page.getByRole('link', { name: 'Editorial', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible()
    await expect(page.getByRole('link', { name: /RBAC Demo Project/i })).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Maintenance routes are separate' }),
    ).toBeVisible()
  })

  test('shows canonical editorial chapter routes with breadcrumb lineage and direct page children', async () => {
    await page.goto(chapterEditorialURL)

    await expect(page).toHaveURL(chapterEditorialURL)
    await expect(page.getByRole('link', { name: 'Editorial', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'RBAC Demo Project' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'RBAC Demo Group' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Intro to Shapes' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'RBAC Demo Course' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Welcome and Roles' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Create page' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pages' })).toBeVisible()
    await expect(page.getByRole('link', { name: /What teachers should see first/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Access walkthrough/i })).toBeVisible()
  })

  test('shows editorial not-found for invalid canonical tree locations', async () => {
    await page.goto(invalidEditorialURL)

    await expect(page).toHaveURL(invalidEditorialURL)
    await expect(page.getByText('This editorial location does not exist.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Go to Home' })).toBeVisible()
  })
})
