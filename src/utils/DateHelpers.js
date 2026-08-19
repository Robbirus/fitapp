export function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

export function getDateNDaysAgoISO(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

/**
 *
 * @param {Date} dateISO
 * @returns the difference between two dates
 */
export function getDaysSince(dateISO) {
  const diffMs = new Date() - new Date(dateISO);
  return Math.floor(diffMs / 86400000);
}
