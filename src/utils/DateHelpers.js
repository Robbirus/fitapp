export function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

export function getDateNDaysAgoISO(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}
