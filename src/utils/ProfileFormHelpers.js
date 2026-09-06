import {
  loadProfileSettings,
  updateProfileSettings,
  loadLatestWeight,
  updateSettings,
} from "../db/Queries";
import { calculateGoals } from "./NutritionCalculator";
import { getTodayISO } from "./DateHelpers";

export async function loadProfileFormData(db) {
  const p = await loadProfileSettings(db);
  const w = await loadLatestWeight(db);
  return {
    name: p.name,
    height: p.height.toString(),
    age: p.age.toString(),
    gender: p.gender,
    ethnicity: p.ethnicity,
    activityLevel: p.activity_level,
    weightGoal: p.weight_goal,
    weightGoalRate: p.weight_goal_rate,
    dietStyle: p.diet_style || "balanced",
    mealTimes: p.meal_times
      ? JSON.parse(p.meal_times)
      : { breakfast: "08:00", lunch: "12:30", snack: "16:30", dinner: "20:00" },
    waterGoal: p.water_goal ? p.water_goal.toString() : "2.0",
    latestWeight: w?.value || null,
  };
}

export async function saveProfileFormData(db, form) {
  const profileData = {
    name: form.name,
    height: parseFloat(form.height),
    age: parseInt(form.age),
    gender: form.gender,
    ethnicity: form.ethnicity,
    activityLevel: form.activityLevel,
    weightGoal: form.weightGoal,
    weightGoalRate: form.weightGoal === "maintain" ? 0 : form.weightGoalRate,
    dietStyle: form.dietStyle,
    goalStartDate: getTodayISO(),
    goalStartWeight: form.latestWeight,
    mealTimes: JSON.stringify(form.mealTimes),
    waterGoal: parseFloat(form.waterGoal),
  };

  const result = await updateProfileSettings(db, profileData);

  const goals = calculateGoals({ weight: form.latestWeight, ...profileData });
  await updateSettings(db, {
    calorieGoal: goals.calorieGoal,
    proteinGoal: goals.proteinGoal,
    carbsGoal: goals.carbsGoal,
    fatGoal: goals.fatGoal,
    fiberGoal: goals.fiberGoal,
    waterGoal: parseFloat(form.waterGoal),
  });

  return result;
}