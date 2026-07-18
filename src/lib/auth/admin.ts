export function formatDailyVisibilityIncrease(
  visibilityIncrease: number,
  days: number,
): string {
  if (!days || days <= 0) return "0";
  const daily = visibilityIncrease / days;
  return (Math.round(daily * 10) / 10).toString();
}
