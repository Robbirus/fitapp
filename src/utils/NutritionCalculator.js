// Activity multipliers (BMR × this factor = total daily calorie expenditure)
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, // little or no exercise
  light: 1.375, // light sport 1-3x/week
  moderate: 1.55, // moderate sport 3-5x/week
  active: 1.725, // intense sport 6-7x/week
};

// 1 kg of fat = 7700 kcal
const KCAL_PER_KG = 7700;

export function calculateGoals({
  weight,
  height,
  age,
  gender,
  activityLevel,
  weightGoal,
  weightGoalRate,
}) {
  // 1. BMR (basal metabolism) - Mifflin-St Jeor formula
  let bmr;
  if (gender === 1) {
    // Male
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    // Female
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // 2. TDEE (total expenditure by activity)
  const multiplier =
    ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.moderate;
  const tdee = bmr * multiplier;

  // 3. Adjustment according to the weight target
  const signedRate =
    weightGoal === "lose"
      ? -weightGoalRate
      : weightGoal === "gain"
        ? weightGoalRate
        : 0;
  const dailyAdjustment = (signedRate * KCAL_PER_KG) / 7;

  const calorieGoal = Math.round(tdee + dailyAdjustment);

  // 4. Macros
  // Proteins: 1.8g per kg of body weight (good benchmark to preserve muscle, loss or gain)
  const proteinGoal = Math.round(weight * 1.8);

  // Fat: Based on body weight (e.g., 0.8g/kg) rather than a fixed % level
  const fatGoal = Math.round(weight * 0.8);

  // Carbs: the remaining calories (1g of carbs = 4 kcal, like proteins)
  const remainingKcal = calorieGoal - proteinGoal * 4 - fatGoal * 9;
  const carbsGoal = Math.round(remainingKcal / 4);

  return { calorieGoal, proteinGoal, carbsGoal, fatGoal };
}

export function calculateProjectedWeight({
  goalStartDate,
  goalStartWeight,
  weightGoal,
  weightGoalRate,
  targetDate,
}) {
  if (!goalStartDate || !goalStartWeight) return null; // goal undefined

  const start = new Date(goalStartDate);
  const target = new Date(targetDate);
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksElapsed = (target - start) / msPerWeek;

  const sign = weightGoal === "lose" ? -1 : weightGoal === "gain" ? 1 : 0;
  const projected = goalStartWeight + sign * weightGoalRate * weeksElapsed;

  return Math.round(projected * 10) / 10; // rounded to 1 decimal place
}
