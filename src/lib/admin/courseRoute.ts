const courseRoutePattern =
  /^\/admin\/editorial\/projects\/(\d+)\/groups\/(\d+)\/products\/(\d+)\/courses\/(\d+)(?:\/chapters\/(\d+))?(?:\/pages\/(\d+))?(?:\/content\/(\d+))?\/?$/

export function isCourseRoute(pathname: string) {
  return courseRoutePattern.test(pathname)
}
