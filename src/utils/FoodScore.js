// Risk table for food additives (standardized keys without prefix "en:")
const ADDITIVE_RISK_TABLE = {
  // -- HIGH (High risk / to be avoided) --
  e102: "élevé", // Tartrazine (colorant)
  e110: "élevé", // Jaune orangé S (colorant)
  e124: "élevé", // Rouge ponceau 4R (colorant)
  e129: "élevé", // Rouge allura AC (colorant)
  e150c: "élevé", // Caramel au sulfite d'ammonium (colorant)
  e171: "élevé", // Dioxyde de titane (colorant/opacifiant)
  e211: "élevé", // Benzoate de sodium (conservateur)
  e220: "élevé", // Anhydride sulfureux / Sulfites (conservateur)
  e249: "élevé", // Nitrite de potassium (conservateur)
  e250: "élevé", // Nitrite de sodium (conservateur)
  e251: "élevé", // Nitrate de sodium (conservateur)
  e252: "élevé", // Nitrate de potassium (conservateur)
  e320: "élevé", // BHA (antioxydant)
  e321: "élevé", // BHT (antioxydant)
  e951: "élevé", // Aspartame (édulcorant)
  e954: "élevé", // Saccharine (édulcorant)

  // -- MODERATE (Moderate risk / to be consumed in moderation) ---
  e150d: "modéré", // Caramel au sulfite d'ammonium (colorant)
  e202: "modéré", // Sorbate de potassium (conservateur)
  e338: "modéré", // Acide phosphorique (acidifiant/antioxydant)
  e407: "modéré", // Carraghénanes (épaississant)
  e433: "modéré", // Polysorbate 80 (émulsifiant)
  e450: "modéré", // Diphosphates (émulsifiant)
  e451: "modéré", // Triphosphates (émulsifiant)
  e452: "modéré", // Polyphosphates (émulsifiant)
  e466: "modéré", // Carboxyméthylcellulose (épaississant)
  e621: "modéré", // Glutamate monosodique (exhausteur de goût)
  e950: "modéré", // Acésulfame-K (édulcorant)
  e955: "modéré", // Sucralose (édulcorant)

  // -- LOW (Low risk / generally tolerated) --
  e100: "faible", // Curcumine (colorant naturel)
  e160a: "faible", // Bêta-carotène (colorant)
  e300: "faible", // Acide ascorbique / Vitamine C (antioxydant)
  e322: "faible", // Lécithines (émulsifiant)
  e330: "faible", // Acide citrique (acidifiant)
  e412: "faible", // Gomme de guar (épaississant)
  e415: "faible", // Gomme xanthane (épaississant)
  e440: "faible", // Pectines (gélifiant)
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

// Returns the raw point contributions behind an "off" score (nutrition, additives,
// bio, plus the origin bonus) -- used both for the text breakdown and for building
// donut chart segments. Returns null for other score types, which don't decompose
// the same way (they have negative malus components that don't fit a "parts of a
// whole" representation).
export function getScoreComponents(scoreResult) {
  if (scoreResult.scoreType !== "off") return null;

  const nutrition = convertNutriGradeToPoint(scoreResult.nutriscoreGrade);
  if (nutrition === null) return null;

  const bioPoints = scoreResult.isOrganic ? 100 : 0;
  const originBonus = applyOriginBonus(scoreResult.originCategory);

  // Additive points aren't stored directly (only the final blended score is
  // persisted), so back-solve them from score = nutrition*0.6 + additives*0.3 + bio*0.1 + originBonus.
  const raw =
    (scoreResult.score - originBonus - nutrition * 0.6 - bioPoints * 0.1) / 0.3;
  const additivePoints = Math.min(Math.max(raw, 0), 100);

  return {
    nutritionContribution: nutrition * 0.6,
    additiveContribution: additivePoints * 0.3,
    bioContribution: bioPoints * 0.1,
    originBonus,
  };
}

// Reconstructs a human-readable breakdown of a score, for display in a "why this
// score?" popup. Works from already-persisted fields (score, scoreType,
// nutriscoreGrade, isOrganic, originCategory) so it can be called both right after
// computing a score AND later, when re-opening an already-saved entry.
//
// macros ({ calories100g, protein100g, fiber100g, fat100g }) is only needed (and
// only used) for "estimate" scores, since that formula reads straight from macros.
export function getScoreBreakdown(scoreResult, macros) {
  if (scoreResult.scoreType === "off") {
    const components = getScoreComponents(scoreResult);

    if (!components) {
      return {
        rows: [{ label: "Nutrition", display: "inconnu" }],
        note: "Score calculé à partir des données Open Food Facts (Nutri-Score, additifs, bio, origine).",
      };
    }

    return {
      rows: [
        {
          label: `Nutrition (Nutri-Score ${scoreResult.nutriscoreGrade ? scoreResult.nutriscoreGrade.toUpperCase() : "?"})`,
          display: `${Math.round(components.nutritionContribution)} pts (60%)`,
        },
        {
          label: "Additifs",
          display: `${Math.round(components.additiveContribution)} pts (30%)`,
        },
        {
          label: "Bio",
          display: scoreResult.isOrganic ? `+${Math.round(components.bioContribution)} pts (10%)` : "0 pt",
        },
        {
          label: "Origine",
          display: `${components.originBonus > 0 ? "+" : ""}${components.originBonus} pt${Math.abs(components.originBonus) > 1 ? "s" : ""}`,
        },
      ],
      note: "Score calculé à partir des données Open Food Facts (Nutri-Score, additifs, bio, origine).",
    };
  }

  if (scoreResult.scoreType === "estimate" && macros) {
    const fiberBonus = Math.min(macros.fiber100g / 10, 1) * 20;
    const proteinBonus = Math.min(macros.protein100g / 25, 1) * 15;
    const calorieMalus = Math.min(Math.max(macros.calories100g - 100, 0) / 300, 1) * 25;
    const fatMalus = Math.min(Math.max(macros.fat100g - 10, 0) / 30, 1) * 15;

    return {
      rows: [
        { label: "Base", display: "50 pts" },
        { label: "Bonus fibres", display: `+${Math.round(fiberBonus)} pts` },
        { label: "Bonus protéines", display: `+${Math.round(proteinBonus)} pts` },
        { label: "Malus densité calorique", display: Math.round(calorieMalus) > 0 ? `-${Math.round(calorieMalus)} pts` : "0 pt" },
        { label: "Malus lipides", display: Math.round(fatMalus) > 0 ? `-${Math.round(fatMalus)} pts` : "0 pt" },
      ],
      note: "Estimation basée sur les macronutriments uniquement (pas de données Open Food Facts disponibles pour cet aliment).",
    };
  }

  if (scoreResult.scoreType === "recipe") {
    return {
      rows: [
        { label: "Score composite du plat", display: `${Math.round(scoreResult.score)}/100` },
      ],
      note: "Moyenne des scores de chaque ingrédient, pondérée par sa quantité. Le détail par ingrédient n'est pas conservé une fois le plat ajouté au journal.",
    };
  }

  return { rows: [], note: "Détail du score indisponible." };
}