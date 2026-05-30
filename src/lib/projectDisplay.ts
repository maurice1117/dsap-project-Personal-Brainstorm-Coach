const DEFAULT_COLLAPSED_MVP_LIMIT = 3;

export function getVisibleMvpItems(
  mvpItems: string[],
  expanded: boolean,
  collapsedLimit = DEFAULT_COLLAPSED_MVP_LIMIT
) {
  return expanded ? mvpItems : mvpItems.slice(0, collapsedLimit);
}

export function shouldShowMvpToggle(
  mvpItems: string[],
  collapsedLimit = DEFAULT_COLLAPSED_MVP_LIMIT
) {
  return mvpItems.length > collapsedLimit;
}
