export function calculateWaistHipRatio(waist, hip) {
  if (!waist || !hip) return null;
  return Math.round((waist / hip) * 100) / 100; // rounded to 2 decimal places
}

export function obtainWHRCategory(ratio, gender) {
  if (ratio === null) return null;
  if (gender === 1) {
    // Male
    if (ratio < 0.9) return "Risque faible";
    if (ratio <= 1.0) return "Risque modéré";
    return "Risque élevé";
  } else {
    // Female
    if (ratio < 0.8) return "Risque faible";
    if (ratio <= 0.85) return "Risque modéré";
    return "Risque élevé";
  }
}

export function calculateBodyFatPercentage({
  gender,
  height,
  neck,
  waist,
  hip,
}) {
  if (!height || !neck || !waist) return null;
  if (gender !== 1 && !hip) return null; // hip is required for women's formula

  let bodyFat;
  if (gender === 1) {
    // Male - US Navy formula
    bodyFat =
      495 /
        (1.0324 -
          0.19077 * Math.log10(waist - neck) +
          0.15456 * Math.log10(height)) -
      450;
  } else {
    // Female - US Navy formula
    bodyFat =
      495 /
        (1.29579 -
          0.35004 * Math.log10(waist + hip - neck) +
          0.221 * Math.log10(height)) -
      450;
  }

  return Math.round(bodyFat * 10) / 10; // rounded to 1 decimal place
}

export function obtainBodyFatCategory(bodyFat, gender) {
  if (bodyFat === null) return null;
  if (gender === 1) {
    // Male
    if (bodyFat < 2) return "Très Faible taux de graisse corporelle, Danger !";
    if (bodyFat < 5) return "Graisse essentielles.";
    if (bodyFat <= 13) return "Athlète";
    if (bodyFat <= 17) return "Fitness";
    if (bodyFat <= 24) return "Acceptable";
    return "Obésité";
  } else {
    // Female
    if (bodyFat < 10) return "Très Faible taux de graisse corporelle, Danger !";
    if (bodyFat < 14) return "Graisse essentielles.";
    if (bodyFat <= 20) return "Athlète";
    if (bodyFat <= 24) return "Fitness";
    if (bodyFat <= 31) return "Acceptable";
    return "Obésité";
  }
}
