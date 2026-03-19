# Dashboard Improvements

## Purpose

The admin dashboard should give editors and administrators a fast overview of the content model, relation health, and the most common next actions.

The current direction is:

- show the structure of the platform before deep navigation is needed
- surface missing relationships and incomplete content early
- keep styling aligned with Payload admin patterns and theme tokens
- support both light and dark theme consistently

## Current Status

Status: active foundation in place, with broader admin UX polish now completed

Implemented:

- custom admin dashboard view is live
- hero/overview section is live
- core metric cards are live for Projects, Project Groups, Courses, Products, Users, and Media
- relation map section is live and explains the main data model flows
- quick actions section is live with both create flows and review flows for common admin work
- relation health section is live with counts for missing links, incomplete structures, and project membership gaps
- dashboard data is fetched server-side with Payload Local API counts
- access-aware queries use `req` with `overrideAccess: false`
- dark theme styling has been corrected for the Quick actions area
- custom dashboard text is localized through Payload admin i18n
- collection groups, labels, field labels, descriptions, and option labels are localized for `en`, `da`, `de`, and `fr`
- Projects now use Payload native drafts / publish status alongside the separate business `lifecycle` field
- admin nav/sidebar flicker was fixed with a provider-based bootstrap approach
- Users documents now show read-only project association overviews instead of the default join-management UI
- association overview cards now show project title, publish status, lifecycle, and pagination without create/manage actions
- self-account and self-user views no longer expose the confusing association management surface
- seed data now includes enough associated projects to test pagination and mixed user-role associations

Recently fixed:

- Quick actions no longer render as a light panel in dark theme
- dashboard surfaces now use the correct low-elevation theme tokens for dark mode
- project membership gap signals were added for viewers, editors, and managers
- quick actions now include review flows for missing access coverage and orphaned products
- relation health cards deep-link into filtered admin lists where Payload supports those filters safely
- dashboard and broader admin UI now follow the same language model as native Payload admin screens
- `/admin/account` no longer renders project association management sections
- Users edit screens now render a clearer read-only association overview instead of the default join widget
- local seed fixtures were expanded and the database was reset / reseeded to support overview and pagination testing

Known state of the implementation:

- the dashboard is useful as an overview page today
- it is currently focused on counts and structural relationships, not workflow analytics
- most relation health links open filtered admin lists directly
- project list deep links for `groups` and `courses` remain unfiltered because Payload's admin filter UI crashes on those join-field filters in this project
- the surrounding admin UX is now significantly more coherent than before, especially for localization and user/project relationship visibility

## Current Implementation

Main file:

- `src/components/admin/AdminDashboard.tsx`

What it currently renders:

- Admin overview hero
- Core metrics grid
- Relation map
- Quick actions
- Relation health grid

Current metrics:

- Projects
- Project Groups
- Courses
- Products
- Users
- Media

Current relation health checks:

- Projects without groups
- Projects without courses
- Empty project groups
- Products without courses
- Products without groups
- Projects without viewers
- Projects without editors
- Projects without managers
- Users without project memberships

## Tracked TODO List

This section is the active backlog for remaining dashboard work.

Status labels:

- `next` = highest-value item to do soon
- `later` = useful but not urgent yet
- `watch` = only do if it becomes a real problem in use

### Next

- [ ] Review dashboard spacing and readability at smaller admin viewport widths if the layout changes further.
- [ ] Add draft / published insight where it gives clear editorial value on the dashboard.
- [ ] Add a recent updates section across key collections.

### Done Recently

- [x] Link relation health cards to filtered admin views instead of only base collection pages.
- [x] Add workflow-oriented quick actions based on actual repeated admin tasks.
- [x] Show whether projects are missing managers, editors, or viewers.
- [x] Review current narrow-width dashboard layout for overflow or stacking issues.
- [x] Localize the custom dashboard and wider custom admin surface to match Payload admin i18n.
- [x] Replace confusing user project join widgets with a read-only overview that lists associated projects clearly.
- [x] Add pagination test data by expanding seed fixtures for project memberships.
- [x] Reset and reseed the local database to validate the updated admin UX against fresh data.
- [x] Keep the signed-in super-admin self-view behavior as-is: hidden on `/admin/account` and not expanded into a special self-management surface.
- [x] Simplify the Users list to identity and role columns only.

### Later

- [ ] Show draft versus published status where that adds real editorial value.
- [ ] Surface recently updated content across key collections.
- [ ] Identify content waiting for editorial attention.
- [ ] Add project-level signals that help spot setup gaps faster.
- [ ] Add more visibility into role and permission distribution.
- [ ] Surface collections or records that commonly break expected setup flows.
- [ ] Confirm hover and focus states are equally clear in both light and dark themes.
- [ ] Review whether any custom dashboard sections should be replaced with more Payload-native admin components.
- [ ] Add code comments only where the dashboard logic would otherwise be hard to follow.
- [ ] Consider showing a small amount of extra project metadata in the user association overview, such as project type, if it improves scanning without turning the view back into a management surface.

### Watch

- [ ] Highlight empty or orphaned media records if that becomes a real issue in day-to-day use.
- [ ] Evaluate whether grouped quick actions would reduce scanning time once there are more dashboard actions.
- [ ] Revisit Payload join-field customizations if a future Payload update offers a cleaner native read-only association presentation.

## Suggested Working Order

If dashboard work continues, the recommended implementation order is:

1. Add operational insight items such as drafts and recent updates.
2. Add role and permission distribution visibility.
3. Continue narrow-width polish only as new admin sections become denser.
4. Revisit optional overview metadata only if editors need more context on user relationship cards.

## Validation Notes

Dashboard changes should continue to be validated with:

- `yarn tsc --noEmit`
- browser verification in both light and dark theme
- manual check that Local API dashboard queries continue to use `req` and `overrideAccess: false`
- browser verification of admin language switching for at least one non-English language
- seed data review when testing pagination or relationship overview changes

## Related Files

- `src/components/admin/AdminDashboard.tsx`
- `src/app/(payload)/custom.css`
- `src/payload.config.ts`
