/** Narrow slice used by `useRouterState` selectors when full `RouterState` isn’t inferred. */
export type RouterPathnameState = {
  location: { pathname: string };
};

export function selectPathname(state: RouterPathnameState): string {
  return state.location.pathname;
}
