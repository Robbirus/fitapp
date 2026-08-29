// Homemade approximate additive risk table (needs to be expanded) — keys without language prefix
const ADDITIVE_RISK_TABLE = {
  e211: "modéré",
  e171: "élevé",
};

const RISK_RANK = { faible: 1, modéré: 2, élevé: 3 };
const RISK_TO_SCORE = { aucun: 100, faible: 80, modéré: 50, élevé: 20 };

const EU_COUNTRIES_LOWER = [
  "austria", "belgium", "bulgaria", "croatia", "cyprus", "czechia",
  "denmark", "estonia", "finland", "germany", "greece", "hungary",
  "ireland", "italy", "latvia", "lithuania", "luxembourg", "malta",
  "netherlands", "poland", "romania", "slovakia", "slovenia", "spain",
  "sweden",
];

// OpenFoodFacts tags are prefixed with a language code, e.g. "en:france", "en:e171"
function normalizeTag(tag) {
  const parts = tag.split(":");
  return (parts.length > 1 ? parts[1] : parts[0]).toLowerCase();
}

export function classifyOrigin(product) {
  const raw =
    (product.origins_tags && product.origins_tags.length > 0 && product.origins_tags) ||
    (product.manufacturing_places_tags && product.manufacturing_places_tags.length > 0 && product.manufacturing_places_tags) ||
    (product.countries_tags && product.countries_tags.length > 0 && product.countries_tags) ||
    null;

  if (!raw) return null; // no origin data available -> neutral bonus

  const normalized = raw.map(normalizeTag);

  if (normalized.includes("france")) return "fr";
  if (normalized.some((tag) => EU_COUNTRIES_LOWER.includes(tag))) return "eu";
  return "non_eu";
}

export function applyOriginBonus(category) {
  if (category === "fr") return 5;
  if (category === "eu") return 3;
  if (category === "non_eu") return -2;
  return 0; // unknown
}

export function convertNutriGradeToPoint(grade) {
  if (!grade) return null;
  const table = { a: 100, b: 80, c: 55, d: 30, e: 10 };
  const points = table[grade.toLowerCase()];
  return points === undefined ? null : points;
}

export function getAdditiveScore(additivesTags) {
  if (!additivesTags || additivesTags.length === 0) return RISK_TO_SCORE.aucun;

  let worstRank = 0;
  for (const tag of additivesTags) {
    const code = normalizeTag(tag);
    const risk = ADDITIVE_RISK_TABLE[code];
    if (risk && RISK_RANK[risk] > worstRank) {
      worstRank = RISK_RANK[risk];
    }
  }

  if (worstRank === 0) return RISK_TO_SCORE.aucun; // no additive recognized in our table
  const worstLabel = Object.keys(RISK_RANK).find((k) => RISK_RANK[k] === worstRank);
  return RISK_TO_SCORE[worstLabel];
}

export function computeScoreFromOFF(product) {
  const nutrition = convertNutriGradeToPoint(product.nutriscore_grade);
  if (nutrition === null) return null; // no nutriscore -> caller should fall back to macros

  const additifs = getAdditiveScore(product.additives_tags);
  const labels = product.labels_tags || [];
  const isOrganic = labels.some((tag) => normalizeTag(tag).includes("organic"));
  const bio = isOrganic ? 100 : 0;
  const origin = classifyOrigin(product);

  const base = nutrition * 0.6 + additifs * 0.3 + bio * 0.1;
  const final = Math.min(Math.max(base + applyOriginBonus(origin), 0), 100);

  return {
    score: final,
    scoreType: "off",
    nutriscoreGrade: product.nutriscore_grade,
    isOrganic,
    originCategory: origin,
  };
}

// Fallback estimation (recent foods / manual entry, macros only)
export function computeScoreFromMacros(macros) {
  const base =
    50 +
    Math.min(macros.fiber100g / 10, 1) * 20 +
    Math.min(macros.protein100g / 25, 1) * 15 -
    Math.min(Math.max(macros.calories100g - 100, 0) / 300, 1) * 25 -
    Math.min(Math.max(macros.fat100g - 10, 0) / 30, 1) * 15;

  const final = Math.min(Math.max(base, 0), 100);

  return {
    score: final,
    scoreType: "estimate",
    nutriscoreGrade: null,
    isOrganic: null,
    originCategory: null,
  };
}

export function getScoreBand(score) {
  if (score >= 75) return { label: "Excellent", color: "#184B44" };
  if (score >= 50) return { label: "Bon", color: "#A8E6CF" };
  if (score >= 25) return { label: "Médiocre", color: "#FF9900" };
  return { label: "Mauvais", color: "#EE4B2B" };
}

// Weighted average of ingredient scores, weighted by quantity (grams).
// items: [{ score: number|null, quantityG: number }, ...]
// Ingredients without a usable score are excluded from both the sum and the
// weight total, so they don't silently dilute the result toward 0.
export function computeWeightedScore(items) {
  const scored = items.filter(
    (item) => typeof item.score === "number" && !isNaN(item.score),
  );
  if (scored.length === 0) return null;

  const totalWeight = scored.reduce(
    (sum, item) => sum + (item.quantityG || 0),
    0,
  );
  if (totalWeight <= 0) return null;

  const weightedSum = scored.reduce(
    (sum, item) => sum + item.score * (item.quantityG || 0),
    0,
  );
  return weightedSum / totalWeight;
}