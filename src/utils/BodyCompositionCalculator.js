export function calculateWaistHipRatio(waist, hip) {
  if (!waist || !hip) return null;
  return Math.round((waist / hip) * 100) / 100; // rounded to 2 decimal places
}

export function obtainWHRCategory(ratio, gender) {
  if (ratio === null) return null;
  if (gender === 1) {
    // Male
    if (ratio < 0.9) return "Risque faible";
    if (ratio < 1.0) return "Risque modéré";
    return "Risque élevé";
  } else {
    // Female
    if (ratio < 0.8) return "Risque faible";
    if (ratio < 0.85) return "Risque modéré";
    return "Risque élevé";
  }
}

export function getCategoryColors(category) {
  const colorMap = {
    "Risque faible": { bg: "#E3F5E9", text: "#00875A" },
    "Risque modéré": { bg: "#FFF3CD", text: "#B45F06" },
    "Risque élevé": { bg: "#FDE2E1", text: "#C62828" },
    Faible: { bg: "#FDE2E1", text: "#C62828" },
    Normal: { bg: "#E3F5E9", text: "#00875A" },
    Élevé: { bg: "#DCEBFF", text: "#0066FF" },
    Mince: { bg: "#DCEBFF", text: "#0066FF" },
    Sain: { bg: "#E3F5E9", text: "#00875A" },
    Surpoids: { bg: "#FFF3CD", text: "#B45F06" },
    "Risque très élevé": { bg: "#FDE2E1", text: "#C62828" },
  };
  return colorMap[category] || { bg: "#F2EFEB", text: "#5A524C" };
}

export function obtainBodyShape(whrCategory) {
  if (whrCategory === "Risque faible") {
    return {
      shape: "Poire",
      description: "Plus de graisse stockée au niveau des hanches",
    };
  } else {
    return {
      shape: "Pomme",
      description: "Plus de graisse stockée au niveau du ventre",
    };
  }
}

/**
 *
 * @param {number} height
 * @returns Waist to reach
 */
export function calculateWaistBoundary(height) {
  if (!height) return null;
  return height * 0.5;
}

export function calculateWHtRDifferencePercent(whtr) {
  if (whtr === null) return null;
  return (whtr - 0.5) * 100;
}

export function getWHtRRecommendation(whtrCategory) {
  if (whtrCategory === "Mince")
    return "Ton ratio indique une faible masse abdominale. Assure-toi de manger suffisamment pour couvrir tes besoins.";
  if (whtrCategory === "Sain")
    return "Ton ratio est dans la plage saine, associée à un risque cardiométabolique réduit. Continue tes habitudes actuelles.";
  if (whtrCategory === "Surpoids")
    return "Ton ratio indique un excès de graisse abdominale. Une activité physique régulière et une alimentation équilibrée peuvent aider à le réduire.";
  else {
    // "High Risk" ou "Very High Risk"
    return "Ton ratio indique un risque cardiométabolique augmenté. Envisage d'en parler à un professionnel de santé.";
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

export function obtainSMICategory(smi, gender) {
  if (smi === null) return null;
  if (gender === 1) {
    // Male
    if (smi <= 8.5) {
      return "Faible";
    }
    if (smi <= 10.75) {
      return "Normal";
    }
    return "Élevé";
  } else {
    // Female
    if (smi <= 5.75) {
      return "Faible";
    }
    if (smi <= 6.75) {
      return "Normal";
    }
    return "Élevé";
  }
}

export function getRaceConstant(ethnicity) {
  if (ethnicity === "asian") {
    return -1.2;
  } else if (ethnicity === "afro-american") {
    return 1.4;
  } else if (ethnicity === "caucasian") {
    return 0;
  } else {
    return 0;
  }
}

export function obtainSarcopeniaRisk(smiCategory) {
  if (!smiCategory) return null;
  if (smiCategory === "Faible") {
    return "Risque élevé";
  } else {
    return "Risque faible";
  }
}

export function getSMIAverage(gender) {
  if (!gender) return null;
  const threshold = getSMIThreshold(gender);
  if (threshold === null) return null;
  return (threshold.lowThreshold + threshold.highThreshold) / 2;
}

/**
 *
 * @param {*} param0
 * weight must be in KG
 * height must be in METER
 * @returns SMM
 */
export function calculateSkeletalMuscleMass({
  weight,
  height,
  gender,
  age,
  ethnicity,
}) {
  if (!weight || !height || !gender || !age || !ethnicity) return null;
  const sex = gender === 1 ? 1 : 0;
  return (
    0.244 * weight +
    7.8 * (height / 100) +
    6.6 * sex -
    0.098 * age +
    getRaceConstant(ethnicity) -
    3.3
  );
}

/**
 *
 * @param {*} param0
 * @returns SMI
 */
export function calculateSMI({ smm, height }) {
  if (!smm || !height) return null;

  return smm / (height / 100) ** 2;
}

/**
 *
 * @param {int} gender
 * @returns
 */
export function getSMIThreshold(gender) {
  if (!gender) return null;
  const lowThreshold = gender === 1 ? 8.5 : 5.75;
  const highThreshold = gender === 1 ? 10.75 : 6.75;

  return {
    minimum: lowThreshold * 0.6,
    lowThreshold,
    highThreshold,
    maximum: highThreshold * 1.3,
  };
}

/**
 *
 * @param {number} waist in cm
 * @param {number} height in cm
 * @returns WtH Ratio
 */
export function calculateWaistHeightRatio(waist, height) {
  if (!waist || !height) return null;
  return waist / height;
}

/**
 * Universal between men and women
 * @param {number} whtr
 * @returns WHtR Category
 */
export function obtainWHtRCategory(whtr) {
  if (whtr === null) return null;

  if (whtr < 0.4) return "Mince";
  if (whtr < 0.5) return "Sain";
  if (whtr < 0.54) return "Surpoids";
  if (whtr < 0.58) return "Risque élevé";
  return "Risque très élevé";
}

export function getWHtRZones() {
  return {
    min: 0.3,
    max: 0.7,
    zones: [
      { label: "Mince", color: "#42A5F5", end: 0.4 },
      { label: "Sain", color: "#4CAF50", end: 0.5 },
      { label: "Surpoids", color: "#FFA726", end: 0.54 },
      { label: "Élevé", color: "#FB8C00", end: 0.58 },
      { label: "Très élevé", color: "#e53935", end: 0.7 },
    ],
  };
}

export function getWHRZones(gender) {
  const low = gender === 1 ? 0.9 : 0.8;
  const high = gender === 1 ? 1.0 : 0.85;

  return {
    min: 0.5,
    max: 1.2,
    zones: [
      { label: "Faible", color: "#4CAF50", end: low },
      { label: "Modéré", color: "#FFA726", end: high },
      { label: "Élevé", color: "#e53935", end: 1.2 },
    ],
  };
}
