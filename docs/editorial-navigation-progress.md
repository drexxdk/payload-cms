# Editorial Navigation Implementation Progress

## Goal

Implement a hierarchy-first admin experience for Payload where users move through the delivery tree instead of starting from flat collection lists.

Primary tree:

1. Home
2. Project
3. Project Group
4. Product
5. Course
6. Chapter
7. Page
8. Content

## Approved UX Rules

1. The breadcrumb root is always Home with a home icon.
2. Child screens should not repeat parent context that breadcrumbs already provide.
3. Each level only exposes actions for its direct children.
4. Child titles in lists should be real links, not modal-only entry points.
5. Editorial locations need canonical shareable URLs.
6. Unsupported editorial URLs should 404 with a clear path back to Home.
7. Tabs or surface switchers only appear when a user has more than one surface.
8. Administration is a separate surface for elevated maintenance work, not a different primary content workflow.

## Implementation Plan

### Step 1. Editorial route shell and deep-linkable overview routes

Status: completed

Includes:

1. Add `/admin/editorial` namespace.
2. Add canonical route helpers and shared data loaders.
3. Add overview routes for project, group, product, course, chapter, page, and content.
4. Add Home-rooted breadcrumbs.
5. Add editorial 404.
6. Add dashboard entry point into the editorial workspace.

### Step 2. Contextual direct-child actions

Status: completed

Includes:

1. Add clear direct-child actions at each editorial level.
2. Keep actions strict to the current level of the tree.
3. Avoid exposing deeper descendants too early.
4. Carry editorial context in direct-child action URLs so the next form-wrapper step can preserve hierarchy.

### Step 3. Contextual create and edit form integration

Status: completed

Includes:

1. Wrap course, chapter, page, and content forms in the editorial shell.
2. Preserve breadcrumbs while editing and creating.
3. Lock or hide parent relationships when context already determines them.

### Step 4. Administration surface

Status: completed

Includes:

1. Add separate maintenance surface for admin and super-admin.
2. Only show a surface switcher for users who actually have multiple surfaces.

### Step 5. Cleanup and verification

Status: completed

Includes:

1. Validate TypeScript.
2. Verify editorial routes in browser.
3. Remove or de-emphasize flat editorial shortcuts.

## Current Progress

Completed so far:

1. Added shared editorial loaders and canonical route helpers in `src/lib/editorial.ts`.
2. Added reusable editorial page chrome in `src/components/admin/editorial/EditorialChrome.tsx`.
3. Added editorial routes for Home, project, group, product, course, chapter, page, and content.
4. Added editorial not-found handling.
5. Added dashboard entry to the editorial workspace.
6. Verified the new routes with `yarn tsc --noEmit`.
7. Verified live rendering for `/admin/editorial`, `/admin/editorial/projects/1`, and `/admin/editorial/projects/1/groups/1/products/1`.
8. Added strict direct-child action buttons:
	- Project -> Create project group
	- Project group -> Manage products
	- Product -> Manage courses
	- Course -> Create chapter
	- Chapter -> Create page
	- Page -> Manage content items
9. Added editorial context parameters to those action URLs so contextual form integration can build on them.
10. Re-validated TypeScript and browser rendering after the action layer was added.
11. Added an editorial context banner on raw Payload create and edit routes when the user arrives from the editorial tree.
12. Locked contextual parent relationship fields for project groups, chapters, pages, and reusable content items.
13. Updated secondary Edit actions so raw document forms keep their editorial breadcrumb context.
14. Added a super-admin-only surface switcher between Editorial and Administration in the shared admin shell.
15. Reframed the existing dashboard as the explicit administration maintenance surface.
16. Removed flat project, course, and product creation shortcuts from the administration quick-actions panel.
17. Re-validated the cleanup pass with `yarn tsc --noEmit` and a browser check on `/admin`.
18. Added focused Playwright coverage for the administration surface switcher and the contextual editorial create-form chrome.
19. Added broader Playwright regression coverage for editorial home, a canonical deep chapter route, and editorial not-found handling.
20. Cleared editorial route lint warnings and verified both repository lint and production build pass.
21. Fixed the surface switcher contrast so it now follows Payload theme tokens and remains readable in dark mode.
22. Fixed duplicate editorial action keys by giving same-screen maintenance actions distinct intent URLs instead of reusing identical hrefs.

## Latest Notes

1. The current editorial routes are overview/navigation surfaces with strict direct-child actions.
2. Raw create and edit screens now keep an editorial breadcrumb bar and a return link when opened from the tree.
3. Contextual parent relationships now lock themselves instead of forcing users to re-select lineage that the editorial path already determines.
4. Secondary Edit actions still use raw Payload document routes, but those routes now retain editorial context.
5. Super-admin users now get a surface switcher; users with only the shared editorial workflow do not.
6. The administration surface currently uses the existing dashboard and raw maintenance routes under `/admin`.
7. The administration surface now points normal content creation back into the editorial tree instead of advertising flat create routes.
8. The admin e2e spec now checks the surface switcher, maintenance-only dashboard actions, editorial context banner, and locked parent field behavior.
9. The admin e2e spec now also covers editorial home, seeded deep-route breadcrumbs, direct-child chapter pages, and editorial not-found handling.
10. The next pass is repository-level verification with lint and production build checks.
11. Repository lint and production build both pass after removing unused editorial route imports.
12. The surface switcher now uses theme-aware styling instead of fixed light colors, so it stays readable in both dark and light modes.
13. Same-screen maintenance actions now carry distinct editorial intent params, so React keys and URLs stay stable even when multiple actions land on the same raw document screen.

## Update Log

### 2026-03-20

1. Created the editorial navigation progress file.
2. Recorded the approved UX rules and initial implementation phases.
3. Logged completion of the first route-shell slice.
4. Completed the strict direct-child action layer on the editorial routes.
5. Re-validated the implementation with `yarn tsc --noEmit` and browser checks.
6. Completed the contextual create/edit integration slice with a raw-route editorial context banner and locked parent relationship fields.
7. Started the separate administration surface slice and updated the tracker before implementation work.
8. Completed the administration surface slice with a super-admin-only surface switcher and an explicit maintenance dashboard.
9. Started the cleanup pass to reduce flat creation shortcuts on the administration surface.
10. Completed the cleanup and verification pass after removing flat creation shortcuts from the administration dashboard.
11. Started a focused test coverage pass for the surface switcher and contextual editorial form chrome.
12. Completed the targeted admin e2e coverage and verified the spec passes locally.
13. Started a broader editorial route regression pass to cover the canonical tree itself.
14. Completed the broader editorial route regression pass with 8 passing admin e2e tests.
15. Started a repository verification pass for lint and production build health.
16. Completed the repository verification pass with clean lint and a successful production build.
17. Started a surface switcher theme-alignment pass after identifying low-contrast text in the current styling.
18. Completed the surface switcher theme-alignment pass with improved contrast and theme-aware styling.
19. Started a duplicate-key bugfix pass after hitting a React warning on the project group editorial route.
20. Completed the duplicate-key bugfix by separating shared raw-route actions with explicit editorial intent query params.