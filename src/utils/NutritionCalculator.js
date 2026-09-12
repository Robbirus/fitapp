// Activity multipliers (BMR × this factor = total daily calorie expenditure)
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, // little or no exercise
  light: 1.375, // light sport 1-3x/week
  moderate: 1.55, // moderate sport 3-5x/week
  active: 1.725, // intense sport 6-7x/week
};

// 1 kg of fat = 7700 kcal
const KCAL_PER_KG = 7700;

// Body recomposition: fixed 10% deficit in the TDEE (independent of rhythm)
// kg/week chosen in the Objectives tab + high protein intake to preserve
// the muscle during the deficit. 2.1 g/kg = middle of the recommended range 2.0-2.2 g/kg.
const RECOMP_DEFICIT_RATIO = 0.9;
const RECOMP_PROTEIN_PER_KG = 2.1;

export function calculateGoals({
  weight,
  height,
  age,
  gender,
  activityLevel,
  weightGoal,
  weightGoalRate,
  dietStyle = "balanced",
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
  // La recomposition corporelle impose son propre déficit fixe de 10% du TDEE,
  // indépendamment de l'objectif "Perdre/Maintenir/Prendre" choisi ailleurs dans le
  // profil : on cherche à rester quasi stable sur la balance pendant qu'on recompose.
  let calorieGoal;
  if (dietStyle === "recomp") {
    calorieGoal = Math.round(tdee * RECOMP_DEFICIT_RATIO);
  } else {
    const signedRate =
      weightGoal === "lose"
        ? -weightGoalRate
        : weightGoal === "gain"
          ? weightGoalRate
          : 0;
    const dailyAdjustment = (signedRate * KCAL_PER_KG) / 7;
    calorieGoal = Math.round(tdee + dailyAdjustment);
  }

  // 4. Macros - the distribution depends on the diet style chosen in the profile
  // The calculation is always done in 2 steps: we set 2 macros according to the style,
  // then the 3rd fills in the remaining calories (1g carbohydrates/proteins = 4 kcal, 1g fats = 9 kcal
  let proteinGoal, fatGoal, carbsGoal;

  switch (dietStyle) {
    case "recomp":
      // Body composition: high protein (2.0-2.2 g/kg) to preserve/
      // build muscle despite the deficit, lipids such as a balanced diet,
      // carbohydrates in adjustment.
      proteinGoal = Math.round(weight * RECOMP_PROTEIN_PER_KG);
      fatGoal = Math.round(weight * 0.8);
      carbsGoal = Math.max(
        0,
        Math.round((calorieGoal - proteinGoal * 4 - fatGoal * 9) / 4),
      );
      break;

    case "keto":
      // Ketogenic: very low carbohydrates (fixed, independent of weight), moderate proteins
      // (not too high so as not to break the ketosis via gluconeogenesis), lipids in filling
      carbsGoal = 25;
      proteinGoal = Math.round(weight * 1.6);
      fatGoal = Math.max(
        0,
        Math.round((calorieGoal - proteinGoal * 4 - carbsGoal * 4) / 9),
      );
      break;

    case "high_protein":
      // Rich in protein: the protein intake is significantly increased, lipids remain unchanged,
      // carbohydrates in filling
      proteinGoal = Math.round(weight * 2.2);
      fatGoal = Math.round(weight * 0.8);
      carbsGoal = Math.max(
        0,
        Math.round((calorieGoal - proteinGoal * 4 - fatGoal * 9) / 4),
      );
      break;

    case "low_carb":
      // Low in carbohydrates: carbohydrates capped at ~20% of total calories,
      // proteins identical to the balanced diet, lipids in filling
      proteinGoal = Math.round(weight * 1.8);
      carbsGoal = Math.round((calorieGoal * 0.2) / 4);
      fatGoal = Math.max(
        0,
        Math.round((calorieGoal - proteinGoal * 4 - carbsGoal * 4) / 9),
      );
      break;

    case "balanced":
    default:
      // Balanced: proteins and lipids based on weight, carbohydrates in feed
      proteinGoal = Math.round(weight * 1.8);
      fatGoal = Math.round(weight * 0.8);
      carbsGoal = Math.max(
        0,
        Math.round((calorieGoal - proteinGoal * 4 - fatGoal * 9) / 4),
      );
  }

  let fiberGoal = 30;
  if (age && gender) {
    if (gender === 1) {
      // Male
      fiberGoal = age >= 50 ? 30 : 38;
    } else {
      // Female
      fiberGoal = age >= 50 ? 21 : 25;
    }
  }

  return { calorieGoal, proteinGoal, carbsGoal, fatGoal, fiberGoal };
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

export function estimateGoalDate({
  goalStartDate,
  goalStartWeight,
  weightGoal,
  weightGoalRate,
  targetWeight,
}) {
  if (!goalStartDate || !goalStartWeight || !targetWeight || !weightGoalRate) {
    return null;
  }
  if (weightGoal === "maintain") return null; // pas de trajectoire à projeter

  const sign = weightGoal === "lose" ? -1 : 1;
  const weeksNeeded = (targetWeight - goalStartWeight) / (sign * weightGoalRate);

  if (!Number.isFinite(weeksNeeded) || weeksNeeded <= 0) return null;

  const start = new Date(goalStartDate);
  const target = new Date(start.getTime() + weeksNeeded * 7 * 24 * 60 * 60 * 1000);
  return target.toISOString().slice(0, 10); // YYYY-MM-DD
}