import { inject } from "@angular/core";
import { Route, Router, RouterStateSnapshot } from "@angular/router";

/**
 * Keeps an old URL prefix working after a route rename: `from` and everything
 * below it redirects to the same location under `to`, keeping the rest of the
 * path, the query params and the fragment.
 */
export function legacyPathRedirect(from: string, to: string): Route {
  const legacySegment = new RegExp(`/${from}(?=[/?#;]|$)`);
  return {
    matcher: (segments) =>
      segments[0]?.path === from ? { consumed: segments } : null,
    canActivate: [
      (_route: unknown, state: RouterStateSnapshot) =>
        inject(Router).parseUrl(state.url.replace(legacySegment, `/${to}`)),
    ],
    children: [],
  };
}
