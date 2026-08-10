// --- Diary Entries ---
export async function loadDiaryEntries(db, date) {
  return await db.getAllAsync(
    "SELECT * FROM diary_entries WHERE date = ? ORDER BY id DESC",
    [date],
  );
}

export async function addDiaryEntry(db, entry, date) {
  return await db.runAsync(
    `INSERT INTO diary_entries (name, calories_100g, protein_100g, carbs_100g, fat_100g, quantity_g, date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.name,
      entry.calories100g,
      entry.protein100g,
      entry.carbs100g,
      entry.fat100g,
      entry.quantityG,
      date,
    ],
  );
}

export async function deleteDiaryEntry(db, id) {
  return await db.runAsync("DELETE FROM diary_entries WHERE id = ?", [id]);
}

export async function updateDiaryEntry(db, id, entry) {
  return await db.runAsync(
    `UPDATE diary_entries
     SET name = ?, calories_100g = ?, protein_100g = ?, carbs_100g = ?, fat_100g = ?, quantity_g = ?
     WHERE id = ?`,
    [
      entry.name,
      entry.calories100g,
      entry.protein100g,
      entry.carbs100g,
      entry.fat100g,
      entry.quantityG,
      id,
    ],
  );
}

export async function loadCaloriesPerDay(db, sinceDate) {
  return await db.getAllAsync(
    `SELECT date,
      SUM((calories_100g * quantity_g) / 100) AS total_calories
     FROM diary_entries
     WHERE date >= ?
     GROUP BY date
     ORDER BY date ASC`,
    [sinceDate],
  );
}

// --- Weight ---
export async function loadWeightHistory(db) {
  return await db.getAllAsync("SELECT * FROM weight_entries ORDER BY id DESC");
}

export async function addWeightEntry(db, value, date) {
  return await db.runAsync(
    "INSERT INTO weight_entries (value, date) VALUES (?, ?)",
    [value, date],
  );
}

export async function loadWeightHistorySince(db, sinceDate) {
  return await db.getAllAsync(
    "SELECT * FROM weight_entries WHERE date >= ? ORDER BY date ASC",
    [sinceDate],
  );
}

export async function deleteWeightEntry(db, id) {
  return await db.runAsync("DELETE FROM weight_entries WHERE id = ?", [id]);
}

export async function updateWeightEntry(db, id, value, date) {
  return await db.runAsync(
    "UPDATE weight_entries SET value = ?, date = ? WHERE id = ?",
    [value, date, id],
  );
}

// --- Activities ---
export async function loadActivities(db, date) {
  return await db.getAllAsync(
    "SELECT * FROM activities WHERE date = ? ORDER BY id DESC",
    [date],
  );
}

export async function addActivityEntry(
  db,
  name,
  duration,
  caloriesBurned,
  date,
) {
  return await db.runAsync(
    "INSERT INTO activities (name, duration, calories_burned, date) VALUES (?, ?, ?, ?)",
    [name, duration, caloriesBurned, date],
  );
}

export async function deleteActivityEntry(db, id) {
  return await db.runAsync("DELETE FROM activities WHERE id = ?", [id]);
}

export async function updateActivityEntry(
  db,
  id,
  name,
  duration,
  calories_burned,
  date,
) {
  return await db.runAsync(
    "UPDATE activities SET name = ?, duration = ?, calories_burned = ?, date = ? WHERE id = ?",
    [name, duration, calories_burned, date, id],
  );
}

// --- Settings ---
export async function loadSettings(db) {
  return await db.getFirstAsync("SELECT * FROM settings WHERE id = 1");
}

export async function updateSettings(db, settings) {
  return await db.runAsync(
    "UPDATE settings SET calorie_goal = ?, protein_goal = ?, carbs_goal = ?, fat_goal = ? WHERE id = 1",
    [
      settings.calorieGoal,
      settings.proteinGoal,
      settings.carbsGoal,
      settings.fatGoal,
    ],
  );
}

// --- Profile ---
export async function loadProfileSettings(db) {
  return await db.getFirstAsync("SELECT * FROM profileSettings WHERE id = 1");
}

export async function updateProfileSettings(db, profile) {
  return await db.runAsync(
    `UPDATE profileSettings
     SET name = ?, height = ?, age = ?, gender = ?, activity_level = ?,
         weight_goal = ?, weight_goal_rate = ?, goal_start_date = ?, goal_start_weight = ?
     WHERE id = 1`,
    [
      profile.name,
      profile.height,
      profile.age,
      profile.gender,
      profile.activityLevel,
      profile.weightGoal,
      profile.weightGoalRate,
      profile.goalStartDate,
      profile.goalStartWeight,
    ],
  );
}

export async function loadLatestWeight(db) {
  const row = await db.getFirstAsync(
    "SELECT * FROM weight_entries ORDER BY id DESC LIMIT 1",
  );
  return row ? row.value : null;
}

// --- Body Measurements ---
export async function addBodyMeasurementEntry(db, neck, waist, hip, date) {
  return await db.runAsync(
    "INSERT INTO body_measurements (neck, waist, hip, date) VALUES (?, ?, ?, ?)",
    [neck, waist, hip, date],
  );
}

export async function loadLatestBodyMeasurement(db) {
  return await db.getFirstAsync(
    "SELECT * FROM body_measurements ORDER BY id DESC LIMIT 1",
  );
}

export async function loadBodyMeasurementHistorySince(db, sinceDate) {
  return await db.getAllAsync(
    "SELECT * FROM body_measurements WHERE date >= ? ORDER BY date ASC",
    [sinceDate],
  );
}

export async function deleteBodyMeasurementEntry(db, id) {
  return await db.runAsync("DELETE FROM body_measurements WHERE id = ?", [id]);
}

export async function updateBodyMeasurementEntry(
  db,
  id,
  neck,
  waist,
  hip,
  date,
) {
  return await db.runAsync(
    "UPDATE body_measurements SET neck = ?, waist = ?, hip = ?, date = ? WHERE id = ?",
    [neck, waist, hip, date, id],
  );
}
