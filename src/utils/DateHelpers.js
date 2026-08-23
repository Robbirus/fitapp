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

export function shiftDateISO(dateISO, deltaDays) {
  const date = new Date(dateISO);
  date.setDate(date.getDate() + deltaDays);
  return date.toISOString().split("T")[0];
}

export function formatFullDateFR(dateISO) {
  const date = new Date(dateISO);
  const formatted = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
