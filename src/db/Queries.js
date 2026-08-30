import { computeWeightedScore } from "../utils/FoodScore";
import { refreshAchievements, ACHIEVEMENT_DEFINITIONS } from "./Achievements";

// --- Diary Entries ---
export async function loadDiaryEntries(db, date) {
  return await db.getAllAsync(
    "SELECT * FROM diary_entries WHERE date = ? ORDER BY id DESC",
    [date],
  );
}

export async function loadRecentFoods(db, limit = 15) {
  // score/score_type/etc. are plain (non-aggregated) columns here, so SQLite's
  // "bare column" behavior returns them from the same row as MAX(id) -- the
  // most recent entry for that food name.
  return await db.getAllAsync(
    `SELECT name, calories_100g, protein_100g, carbs_100g, fat_100g, fiber_100g,
       score, score_type, nutriscore_grade, is_organic, origin_category,
       MAX(id) as last_id
     FROM diary_entries
     GROUP BY name
     ORDER BY last_id DESC
     LIMIT ?`,
    [limit],
  );
}

export async function addDiaryEntry(db, entry, date, mealType) {
  const result = await db.runAsync(
    `INSERT INTO diary_entries
      (name, calories_100g, protein_100g, carbs_100g, fat_100g, fiber_100g, quantity_g, date, meal_type,
       score, score_type, nutriscore_grade, is_organic, origin_category)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.name,
      entry.calories100g,
      entry.protein100g,
      entry.carbs100g,
      entry.fat100g,
      entry.fiber100g,
      entry.quantityG,
      date,
      mealType,
      entry.score ?? null,
      entry.scoreType ?? null,
      entry.nutriscoreGrade ?? null,
      entry.isOrganic === undefined || entry.isOrganic === null
        ? null
        : entry.isOrganic
          ? 1
          : 0,
      entry.originCategory ?? null,
    ],
  );
  // Recomputing achievement progress should never block or break the
  // add-to-journal flow, even if it fails for some reason.
  try {
    result.newlyUnlockedAchievements = await refreshAchievements(db);
  } catch (e) {
    console.log("ERROR refreshing achievements:", e.message);
  }
  return result;
}

export async function deleteDiaryEntry(db, id) {
  return await db.runAsync("DELETE FROM diary_entries WHERE id = ?", [id]);
}

export async function updateDiaryEntry(db, id, entry) {
  // Score/scoreType/etc. are intentionally NOT touched here: editing quantities or
  // macros on an existing entry shouldn't wipe out the Nutri-Score/additives/origin
  // data that was captured when the item was first scanned or logged.
  return await db.runAsync(
    `UPDATE diary_entries
     SET name = ?, calories_100g = ?, protein_100g = ?, carbs_100g = ?, fat_100g = ?, fiber_100g = ?, quantity_g = ?
     WHERE id = ?`,
    [
      entry.name,
      entry.calories100g,
      entry.protein100g,
      entry.carbs100g,
      entry.fat100g,
      entry.fiber100g,
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

export async function loadLatestWeightWithDate(db) {
  const row = await db.getFirstAsync(
    "SELECT * FROM weight_entries ORDER BY id DESC LIMIT 1",
  );
  return row ? { value: row.value, date: row.date } : null;
}

export async function addWeightEntry(db, value, date) {
  const result = await db.runAsync(
    "INSERT INTO weight_entries (value, date) VALUES (?, ?)",
    [value, date],
  );
  try {
    result.newlyUnlockedAchievements = await refreshAchievements(db);
  } catch (e) {
    console.log("ERROR refreshing achievements:", e.message);
  }
  return result;
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
  // BUG FIX: `water_goal ?? 2.0` used to silently reset the water goal to the
  // hardcoded default of 2.0L every time this was called without a waterGoal
  // (e.g. from the Dashboard's quick goal editor, which doesn't have a water field).
  // COALESCE keeps the existing stored value whenever the caller doesn't supply one.
  return await db.runAsync(
    `UPDATE settings 
     SET calorie_goal = ?, protein_goal = ?, carbs_goal = ?, fat_goal = ?, fiber_goal = ?,
         water_goal = COALESCE(?, water_goal)
     WHERE id = 1`,
    [
      settings.calorieGoal,
      settings.proteinGoal,
      settings.carbsGoal,
      settings.fatGoal,
      settings.fiberGoal,
      settings.waterGoal ?? null,
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
         weight_goal = ?, weight_goal_rate = ?, goal_start_date = ?, goal_start_weight = ?, ethnicity = ?,
         meal_times = ?, water_goal = ?, diet_style = ?
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
      profile.ethnicity,
      profile.mealTimes,
      profile.waterGoal,
      profile.dietStyle,
    ],
  );
}

export async function loadLatestWeight(db) {
  const row = await db.getFirstAsync(
    "SELECT * FROM weight_entries ORDER BY id DESC LIMIT 1",
  );
  return row ? { value: row.value, date: row.date } : null;
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

/**
 *
 * @param {*} db
 * @param {int} id
 * @param {float} neck
 * @param {float} waist
 * @param {float} hip
 * @param {Date} date
 * @returns
 */
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

// --- Recipes ---

// Vue liste : nom + total kcal de la recette telle qu'enregistrée (quantités par défaut)
export async function loadRecipes(db) {
  return await db.getAllAsync(
    `SELECT r.id, r.name, r.created_at, r.score,
       COALESCE(SUM((ri.calories_100g * ri.quantity_g) / 100), 0) AS total_calories,
       COALESCE(SUM((ri.protein_100g * ri.quantity_g) / 100), 0) AS total_protein,
       COALESCE(SUM((ri.carbs_100g * ri.quantity_g) / 100), 0) AS total_carbs,
       COALESCE(SUM((ri.fat_100g * ri.quantity_g) / 100), 0) AS total_fat,
       COALESCE(SUM((ri.fiber_100g * ri.quantity_g) / 100), 0) AS total_fiber,
       COALESCE(SUM(ri.quantity_g), 0) AS total_weight_g,
       COUNT(ri.id) AS ingredient_count
     FROM recipes r
     LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
     GROUP BY r.id
     ORDER BY r.id DESC`,
  );
}

export async function loadRecipeWithIngredients(db, recipeId) {
  const recipe = await db.getFirstAsync(
    "SELECT * FROM recipes WHERE id = ?",
    [recipeId],
  );
  if (!recipe) return null;
  const ingredients = await db.getAllAsync(
    "SELECT * FROM recipe_ingredients WHERE recipe_id = ? ORDER BY id ASC",
    [recipeId],
  );
  return { ...recipe, ingredients };
}

async function insertRecipeIngredients(db, recipeId, ingredients) {
  for (const ing of ingredients) {
    await db.runAsync(
      `INSERT INTO recipe_ingredients
        (recipe_id, name, calories_100g, protein_100g, carbs_100g, fat_100g, fiber_100g, quantity_g,
         score, score_type, nutriscore_grade, is_organic, origin_category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recipeId,
        ing.name,
        ing.calories100g,
        ing.protein100g || 0,
        ing.carbs100g || 0,
        ing.fat100g || 0,
        ing.fiber100g || 0,
        ing.quantityG,
        ing.score ?? null,
        ing.scoreType ?? null,
        ing.nutriscoreGrade ?? null,
        ing.isOrganic === undefined || ing.isOrganic === null
          ? null
          : ing.isOrganic
            ? 1
            : 0,
        ing.originCategory ?? null,
      ],
    );
  }
}

// Recomputes and persists the recipe's overall score (weighted average of its
// ingredients' scores, weighted by quantity). Called after every insert/update
// so the recipe list can display it without recalculating on every render.
async function refreshRecipeScore(db, recipeId, ingredients) {
  const score = computeWeightedScore(
    ingredients.map((ing) => ({ score: ing.score, quantityG: ing.quantityG })),
  );
  await db.runAsync("UPDATE recipes SET score = ? WHERE id = ?", [
    score,
    recipeId,
  ]);
}

// ingredients: [{ name, calories100g, protein100g, carbs100g, fat100g, fiber100g, quantityG,
//                 score, scoreType, nutriscoreGrade, isOrganic, originCategory }, ...]
export async function createRecipe(db, name, ingredients) {
  let recipeId;
  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      "INSERT INTO recipes (name, created_at) VALUES (?, ?)",
      [name, new Date().toISOString()],
    );
    recipeId = result.lastInsertRowId;
    await insertRecipeIngredients(db, recipeId, ingredients);
    await refreshRecipeScore(db, recipeId, ingredients);
  });
  try {
    await refreshAchievements(db);
  } catch (e) {
    console.log("ERROR refreshing achievements:", e.message);
  }
  return recipeId;
}

export async function updateRecipe(db, recipeId, name, ingredients) {
  await db.withTransactionAsync(async () => {
    await db.runAsync("UPDATE recipes SET name = ? WHERE id = ?", [
      name,
      recipeId,
    ]);
    await db.runAsync("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [
      recipeId,
    ]);
    await insertRecipeIngredients(db, recipeId, ingredients);
    await refreshRecipeScore(db, recipeId, ingredients);
  });
}

export async function deleteRecipe(db, recipeId) {
  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM recipe_ingredients WHERE recipe_id = ?", [
      recipeId,
    ]);
    await db.runAsync("DELETE FROM recipes WHERE id = ?", [recipeId]);
  });
}

export async function ensureAchievementsSeeded(db) {
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    await db.runAsync(
      `INSERT OR IGNORE INTO achievements
        (id, title, description, category, target_value, current_value, is_unlocked)
       VALUES (?, ?, ?, ?, ?, 0, 0)`,
      [def.id, def.title, def.description, def.category, def.target_value],
    );
  }
}

export async function loadAchievements(db) {
  await ensureAchievementsSeeded(db);
  return await db.getAllAsync(
    "SELECT * FROM achievements ORDER BY category ASC, target_value ASC",
  );
}

// Bumps one achievement's progress forward (never backward) and unlocks it the
// first time it reaches its target. Returns true the moment it becomes unlocked.
async function bumpAchievement(db, id, newValue) {
  const row = await db.getFirstAsync(
    "SELECT * FROM achievements WHERE id = ?",
    [id],
  );
  if (!row) return false;

  const value = Math.max(row.current_value, newValue);
  const wasUnlocked = row.is_unlocked === 1;
  const isUnlocked = wasUnlocked || value >= row.target_value;

  await db.runAsync(
    `UPDATE achievements SET current_value = ?, is_unlocked = ?, unlocked_at = ? WHERE id = ?`,
    [
      value,
      isUnlocked ? 1 : 0,
      isUnlocked ? (row.unlocked_at || new Date().toISOString()) : row.unlocked_at,
      id,
    ],
  );
  return isUnlocked && !wasUnlocked;
}