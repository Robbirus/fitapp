// Doit rester aligné avec la valeur par défaut de profileSettings.meal_times (DatabaseContext.js)
export const DEFAULT_MEAL_TIMES = {
  breakfast: "08:00",
  lunch: "12:30",
  snack: "16:30",
  dinner: "20:00",
};

export const MEAL_KEY_TO_TYPE = {
  breakfast: "Petit Dejeuner",
  lunch: "Dejeuner",
  snack: "Snack",
  dinner: "Diner",
};

export const MEAL_PERIOD = [
  { value: "Petit Dejeuner", label: "Petit Dejeuner" },
  { value: "Dejeuner", label: "Dejeuner" },
  { value: "Snack", label: "Snack" },
  { value: "Diner", label: "Diner" },
];

const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
};

export const guessMealFromTimes = (mealTimes) => {
  const times = { ...DEFAULT_MEAL_TIMES, ...mealTimes };
  const order = ["breakfast", "lunch", "snack", "dinner"];
  const sorted = order
    .map((key) => ({ key, minutes: timeToMinutes(times[key]) }))
    .sort((a, b) => a.minutes - b.minutes);

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  let current = sorted[0].key; 
  for (const t of sorted) {
    if (nowMinutes >= t.minutes) current = t.key;
  }

  const last = sorted[sorted.length - 1];
  if (current === last.key && nowMinutes - last.minutes > 180) {
    current = "snack";
  }

  return MEAL_KEY_TO_TYPE[current];
};
