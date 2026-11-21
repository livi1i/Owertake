export function nextBookPage(page: number, direction: number, count: number) {
  const nextDirection = page === count - 1 ? -1 : page === 0 ? 1 : direction;
  return {
    page: Math.max(0, Math.min(count - 1, page + nextDirection)),
    direction: nextDirection,
  };
}
