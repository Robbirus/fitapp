function getLocalISOString(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseLocalISO(dateISO) {
  const [y, m, d] = dateISO.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function getTodayISO() {
  return getLocalISOString(new Date());
}

export function getDateNDaysAgoISO(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return getLocalISOString(date);
}

/**
 *
 * @param {Date} dateISO
 * @returns the difference between two dates
 */
export function getDaysSince(dateISO) {
  const diffMs = new Date() - parseLocalISO(dateISO);
  return Math.floor(diffMs / 86400000);
}

export function shiftDateISO(dateISO, deltaDays) {
  const date = parseLocalISO(dateISO);
  date.setDate(date.getDate() + deltaDays);
  return getLocalISOString(date);
}

export function formatFullDateFR(dateISO) {
  const date = parseLocalISO(dateISO);
  const formatted = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}