export const ACHIEVEMENT_DEFINITIONS = [
  // --- 📋 DUPLICATION ---
  { 
    id: "un_jour_sans_fin", 
    title: "Un jour sans fin", 
    description: "Utiliser la fonction 'Dupliquer' pour manger exactement le même repas 5 jours de suite.", 
    category: "nutrition", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "duplication_rapide", 
    title: "Effet Miroir", 
    description: "Dupliquer un aliment 3 fois dans la même journée.", 
    category: "nutrition", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "copier_coller_pro", 
    title: "Boucle Temporelle", 
    description: "Dupliquer un total de 10 aliments au fil de l'eau.", 
    category: "nutrition", 
    target_value: 10, 
    type: "custom" 
  },
  // --- 🕵️ COMPPORTEMENTS & ACTIONS ---
  { 
    id: "le_deni", 
    title: "Le Déni", 
    description: "Supprimer un aliment du journal moins d'une minute après l'avoir ajouté. (Ni vu, ni connu).", 
    category: "nutrition", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "monstre_cookies", 
    title: "Le Monstre des Cookies", 
    description: "Ajouter une collation dans le journal entre 23h et 4h du matin.", 
    category: "nutrition", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "equilibre_parfait", 
    title: "Équilibre parfait (ou presque)", 
    description: "Manger un aliment très calorique, puis faire une séance de sport qui brûle exactement ce même nombre de calories dans la foulée.", 
    category: "sport", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "photosynthese", 
    title: "Photosynthèse", 
    description: "N'enregistrer que des aliments marqués comme 'Bio' sur une journée complète.", 
    category: "nutrition", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "premier_classe", 
    title: "Premier de la classe", 
    description: "N'avoir que des aliments Nutri-Score A dans son journal aujourd'hui.", 
    category: "nutrition", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "alchimiste_fou", 
    title: "L'Alchimiste fou", 
    description: "Créer une recette personnalisée contenant plus de 15 ingrédients différents.", 
    category: "nutrition", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "chameau_repenti", 
    title: "Chameau repenti", 
    description: "Atteindre le double de son objectif d'eau quotidien.", 
    category: "nutrition", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "flash_mcqueen", 
    title: "Flash McQueen", 
    description: "Enregistrer une activité sportive qui dure moins de 5 minutes. (C'est l'intention qui compte).", 
    category: "sport", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "marathonien_dimanche", 
    title: "Marathonien du dimanche", 
    description: "Brûler plus de 1000 kcal en une seule séance de sport.", 
    category: "sport", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "esquive", 
    title: "L'Esquive", 
    description: "Aller dans les paramètres et changer son niveau d'activité de 'Très actif' à 'Sédentaire'.", 
    category: "general", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "jour_jambes_oublie", 
    title: "Jour des jambes oublié", 
    description: "Faire 5 jours de sport d'affilée sans perdre un seul gramme sur la balance.", 
    category: "sport", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "immobile_roc", 
    title: "Immobile comme un roc", 
    description: "Enregistrer exactement le même poids au gramme près 3 pesées de suite.", 
    category: "weight", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "ascenseur_emotionnel", 
    title: "L'Ascenseur Émotionnel", 
    description: "Avoir une variation de poids de +1kg puis -1kg (ou inversement) sur la même semaine.", 
    category: "weight", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "chirurgie_visuelle", 
    title: "Chirurgie visuelle", 
    description: "Modifier son objectif de poids 3 fois dans le même mois.", 
    category: "weight", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "amnesie", 
    title: "Amnésie", 
    description: "Ne rien enregistrer pendant 3 jours consécutifs, puis revenir comme si de rien n'était.", 
    category: "general", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "machine_temps", 
    title: "Machine à voyager dans le temps", 
    description: "Ajouter un repas ou une pesée à une date dans le passé (il y a plus de 7 jours).", 
    category: "general", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "insatisfaction_chronique", 
    title: "Insatisfaction chronique", 
    description: "Modifier les quantités du même aliment 4 fois de suite dans le journal.", 
    category: "nutrition", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "pile_poil", 
    title: "Pile poil !", 
    description: "Atteindre très exactement son objectif de calories quotidien, à la calorie près.", 
    category: "nutrition", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "oiseau_de_nuit", 
    title: "Oiseau de nuit", 
    description: "Ajouter un aliment ou un poids au journal à 3h00 du matin.", 
    category: "general", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "syndrome_page_blanche", 
    title: "Syndrome de la page blanche", 
    description: "Ouvrir l'éditeur de recette, ne rien écrire, et retourner à l'accueil.", 
    category: "nutrition", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "hydratation_tactique", 
    title: "Hydratation Tactique", 
    description: "Boire de l'eau pour combler la faim alors qu'il n'y a plus de calories disponibles.", 
    category: "nutrition", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "fin_du_tuto", 
    title: "Fin du tuto", 
    description: "Modifier les valeurs par défaut de son profil (âge, taille, genre) pour la première fois.", 
    category: "general", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "grand_nettoyage", 
    title: "Grand Nettoyage", 
    description: "Supprimer 10 aliments de son journal en une seule journée.", 
    category: "nutrition", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "tireur_elite", 
    title: "Tireur d'élite", 
    description: "Atteindre son objectif calorique à +/- 1%.", 
    category: "nutrition", 
    target_value: 1, 
    type: "custom" 
  },
  { 
    id: "horloger_macros", 
    title: "L'Horloger des Macros", 
    description: "Atteindre ses 3 objectifs (protéines, glucides, lipides) à +/- 1% le même jour.", 
    category: "nutrition", 
    target_value: 1, 
    type: "custom" 
  }
];

// --- Journal d'événements --------------------------------------------------
// Some successes involve a one-time action (duplicate, delete quickly,
// abandon the recipe editor...) rather than on the current state of the data.
// We track them in `achievement_events` at the time they occur, since
// Queries.js, then we count them here. Never fail the calling action
// if the log fails: this is never critical for the main flow.
export async function logAchievementEvent(db, eventType, payload = null) {
  try {
    await db.runAsync(
      `INSERT INTO achievement_events (event_type, payload, created_at) VALUES (?, ?, ?)`,
      [eventType, payload ? JSON.stringify(payload) : null, new Date().toISOString()],
    );
  } catch (e) {
    console.log("ERROR logging achievement event:", e.message);
  }
}

// Number of calendar days between two ISO dates 'YYYY-MM-DD' (b - a).
function daysBetween(dateA, dateB) {
  const a = new Date(`${dateA}T00:00:00`);
  const b = new Date(`${dateB}T00:00:00`);
  return Math.round((b - a) / 86400000);
}

// Longest series of consecutive days (date[i+1] = date[i] + 1 day) that
// share exactly the same log "signature" (same food + quantities).
// `rows` must be sorted by ascending date, with a `date` and `signature` field.
function longestIdenticalDayStreak(rows) {
  let best = 1;
  let current = 1;
  for (let i = 1; i < rows.length; i++) {
    const sameDayAfter = daysBetween(rows[i - 1].date, rows[i].date) === 1;
    const sameSignature = rows[i - 1].signature === rows[i].signature;
    if (sameDayAfter && sameSignature) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }
  return rows.length > 0 ? best : 0;
}

// Global function to refresh and check successes
export async function refreshAchievements(db) {
  let newlyUnlocked = [];

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    // 1. Make sure that success exists in the overall table of achievements
    await db.runAsync(
      `INSERT OR IGNORE INTO achievements 
        (id, title, description, category, target_value, current_value, is_unlocked) 
       VALUES (?, ?, ?, ?, ?, 0, 0)`,
      [def.id, def.title, def.description, def.category, def.target_value]
    );

    // 2. Check if it is already unlocked to avoid duplicating the calculations unnecessarily
    const existing = await db.getFirstAsync(
      "SELECT is_unlocked, unlocked_at FROM achievements WHERE id = ?",
      [def.id]
    );
    if (existing && existing.is_unlocked === 1) continue;

    let currentValue = 0;

    if (def.type === "sql") {
      // Not currently used by any definition -- kept for compatibility
      // future, but protected: without `def.sql`, we ignore rather than crash.
      if (def.sql) {
        const res = await db.getFirstAsync(def.sql);
        currentValue = res?.total ?? 0;
      }
    } 
    else if (def.type === "custom") {
      switch (def.id) {
        case "tireur_elite": {
          const userSettings = await db.getFirstAsync("SELECT calorie_goal FROM settings WHERE id = 1");
          if (userSettings?.calorie_goal) {
            const goal = userSettings.calorie_goal;
            const hit = await db.getFirstAsync(
              `SELECT COUNT(*) as total FROM (
                 SELECT date, SUM((calories_100g * quantity_g) / 100) as total_cals
                 FROM diary_entries GROUP BY date 
                 HAVING total_cals >= ? AND total_cals <= ?
               )`,
              [goal * 0.99, goal * 1.01]
            );
            currentValue = hit?.total || 0;
          }
          break;
        }

        case "monstre_cookies": {
          // Requires created_at (added by migration) to verify the actual time,
          // not just the type of meal.
          const res = await db.getFirstAsync(
            `SELECT COUNT(*) as total FROM diary_entries
             WHERE meal_type = 'Snack' AND created_at IS NOT NULL
               AND (CAST(strftime('%H', created_at) AS INTEGER) >= 23
                    OR CAST(strftime('%H', created_at) AS INTEGER) < 4)`
          );
          currentValue = res?.total > 0 ? 1 : 0;
          break;
        }

        case "flash_mcqueen": {
          const res = await db.getFirstAsync(
            `SELECT COUNT(*) as total FROM activities WHERE duration < 5`
          );
          currentValue = res?.total || 0;
          break;
        }

        case "marathonien_dimanche": {
          const res = await db.getFirstAsync(
            `SELECT COUNT(*) as total FROM activities WHERE calories_burned > 1000`
          );
          currentValue = res?.total || 0;
          break;
        }

        case "immobile_roc": {
          const weights = await db.getAllAsync(`SELECT value FROM weight_entries ORDER BY id DESC LIMIT 3`);
          if (weights.length === 3 && weights[0].value === weights[1].value && weights[1].value === weights[2].value) {
            currentValue = 1;
          }
          break;
        }

        case "pile_poil": {
          const userSettings = await db.getFirstAsync("SELECT calorie_goal FROM settings WHERE id = 1");
          if (userSettings?.calorie_goal) {
            const goal = userSettings.calorie_goal;
            const hit = await db.getFirstAsync(
              `SELECT COUNT(*) as total FROM (
                 SELECT date, SUM((calories_100g * quantity_g) / 100) as total_cals
                 FROM diary_entries GROUP BY date 
                 HAVING total_cals = ?
               )`,
              [goal]
            );
            currentValue = hit?.total || 0;
          }
          break;
        }

        case "alchimiste_fou": {
          const res = await db.getFirstAsync(
            `SELECT COUNT(*) as total FROM (
               SELECT recipe_id FROM recipe_ingredients GROUP BY recipe_id HAVING COUNT(*) > 15
             )`
          );
          currentValue = res?.total || 0;
          break;
        }

        // --- 📋 DUPLICATION -------------------------------------------------
        case "un_jour_sans_fin": {
          // Simplification assumed: 5 consecutive days are detected, including the
          // newspaper content (food + quantities) is strictly
          // identical, which is the observable result of repeated use of
          // "Duplicate -- we do not check that EVERY day has been produced via
          // the Duplicate button itself (we couldn’t prove it afterwards)
          // for days 2 through 5 without linking each row to the source event).
          const rows = await db.getAllAsync(
            `SELECT date, GROUP_CONCAT(item, '|') as signature FROM (
               SELECT date, name || ':' || quantity_g as item
               FROM diary_entries
               ORDER BY date ASC, name ASC, quantity_g ASC
             ) GROUP BY date ORDER BY date ASC`
          );
          currentValue = longestIdenticalDayStreak(rows) >= 5 ? 1 : 0;
          break;
        }

        case "duplication_rapide": {
          const res = await db.getFirstAsync(
            `SELECT MAX(cnt) as maxCnt FROM (
               SELECT substr(created_at, 1, 10) as d, COUNT(*) as cnt
               FROM achievement_events WHERE event_type = 'duplicate'
               GROUP BY d
             )`
          );
          currentValue = (res?.maxCnt || 0) >= 3 ? 1 : 0;
          break;
        }

        case "copier_coller_pro": {
          const res = await db.getFirstAsync(
            `SELECT COUNT(*) as total FROM achievement_events WHERE event_type = 'duplicate'`
          );
          currentValue = res?.total || 0;
          break;
        }

        // --- 🕵️ COMPORTEMENTS & ACTIONS ------------------------------------
        case "le_deni": {
          const res = await db.getFirstAsync(
            `SELECT COUNT(*) as total FROM achievement_events WHERE event_type = 'quick_delete'`
          );
          currentValue = res?.total > 0 ? 1 : 0;
          break;
        }

        case "equilibre_parfait": {
          // "Very caloric" is arbitrarily set at 300+ kcal actually
          // consumed; "in the stride" at a 3-hour window after the meal.
          const CALORIC_THRESHOLD = 300;
          const WINDOW_MINUTES = 180;
          const foods = await db.getAllAsync(
            `SELECT date, created_at, (calories_100g * quantity_g / 100.0) as cals
             FROM diary_entries WHERE created_at IS NOT NULL AND (calories_100g * quantity_g / 100.0) >= ?`,
            [CALORIC_THRESHOLD],
          );
          let found = false;
          if (foods.length > 0) {
            const acts = await db.getAllAsync(
              `SELECT date, created_at, calories_burned FROM activities WHERE created_at IS NOT NULL`
            );
            for (const food of foods) {
              const match = acts.some((act) => {
                if (act.date !== food.date) return false;
                const diffMin = (new Date(act.created_at) - new Date(food.created_at)) / 60000;
                return diffMin >= 0 && diffMin <= WINDOW_MINUTES
                  && Math.round(act.calories_burned) === Math.round(food.cals);
              });
              if (match) { found = true; break; }
            }
          }
          currentValue = found ? 1 : 0;
          break;
        }

        case "photosynthese": {
          const res = await db.getFirstAsync(
            `SELECT COUNT(*) as total FROM (
               SELECT date FROM diary_entries GROUP BY date
               HAVING COUNT(*) > 0 AND COUNT(*) = SUM(CASE WHEN is_organic = 1 THEN 1 ELSE 0 END)
             )`
          );
          currentValue = res?.total > 0 ? 1 : 0;
          break;
        }

        case "premier_classe": {
          const res = await db.getFirstAsync(
            `SELECT COUNT(*) as total FROM (
               SELECT date FROM diary_entries GROUP BY date
               HAVING COUNT(*) > 0 AND COUNT(*) = SUM(CASE WHEN LOWER(nutriscore_grade) = 'a' THEN 1 ELSE 0 END)
             )`
          );
          currentValue = res?.total > 0 ? 1 : 0;
          break;
        }

        case "chameau_repenti":
        case "hydratation_tactique": {
          // Blocked: there is no water consumption tracking table
          // (only one goal `water_goal`). These two successes require a
          // water log feature that doesn’t yet exist in the app.
          currentValue = 0;
          break;
        }

        case "esquive": {
          const res = await db.getFirstAsync(
            `SELECT COUNT(*) as total FROM achievement_events WHERE event_type = 'esquive'`
          );
          currentValue = res?.total > 0 ? 1 : 0;
          break;
        }

        case "jour_jambes_oublie": {
          const activityDates = await db.getAllAsync(
            `SELECT DISTINCT date FROM activities ORDER BY date ASC`
          );
          const dates = activityDates.map((r) => r.date);
          let streakFound = false;
          for (let i = 0; i + 4 < dates.length && !streakFound; i++) {
            let consecutive = true;
            for (let j = 0; j < 4; j++) {
              if (daysBetween(dates[i + j], dates[i + j + 1]) !== 1) { consecutive = false; break; }
            }
            if (!consecutive) continue;

            const weightBefore = await db.getFirstAsync(
              `SELECT value FROM weight_entries WHERE date <= ? ORDER BY date DESC LIMIT 1`,
              [dates[i]],
            );
            const weightAfter = await db.getFirstAsync(
              `SELECT value FROM weight_entries WHERE date >= ? ORDER BY date ASC LIMIT 1`,
              [dates[i + 4]],
            );
            if (weightBefore && weightAfter && weightAfter.value >= weightBefore.value) {
              streakFound = true;
            }
          }
          currentValue = streakFound ? 1 : 0;
          break;
        }

        case "ascenseur_emotionnel": {
          // We limit ourselves to the last 60 weighings to avoid a cost O(no.3)
          // which would become sensitive on a very long weight history.
          const weights = await db.getAllAsync(
            `SELECT value, date FROM weight_entries ORDER BY date ASC`
          );
          const recent = weights.slice(-60);
          let found = false;
          outer:
          for (let i = 0; i < recent.length; i++) {
            for (let j = i + 1; j < recent.length && daysBetween(recent[i].date, recent[j].date) <= 7; j++) {
              for (let k = j + 1; k < recent.length && daysBetween(recent[i].date, recent[k].date) <= 7; k++) {
                const d1 = recent[j].value - recent[i].value;
                const d2 = recent[k].value - recent[j].value;
                if ((d1 >= 1 && d2 <= -1) || (d1 <= -1 && d2 >= 1)) {
                  found = true;
                  break outer;
                }
              }
            }
          }
          currentValue = found ? 1 : 0;
          break;
        }

        case "chirurgie_visuelle": {
          const monthPrefix = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
          const res = await db.getFirstAsync(
            `SELECT COUNT(*) as total FROM achievement_events
             WHERE event_type = 'weight_goal_change' AND substr(created_at, 1, 7) = ?`,
            [monthPrefix],
          );
          currentValue = (res?.total || 0) >= 3 ? 1 : 0;
          break;
        }

        case "amnesie": {
          const [diaryDates, weightDates, activityDates] = await Promise.all([
            db.getAllAsync(`SELECT DISTINCT date FROM diary_entries`),
            db.getAllAsync(`SELECT DISTINCT date FROM weight_entries`),
            db.getAllAsync(`SELECT DISTINCT date FROM activities`),
          ]);
          const allDates = [...new Set([
            ...diaryDates.map((r) => r.date),
            ...weightDates.map((r) => r.date),
            ...activityDates.map((r) => r.date),
          ])].sort();
          let found = false;
          for (let i = 1; i < allDates.length; i++) {
            // >= 4 days difference = at least 3 full days without any activity,
            // followed by a return (the next day in the list).
            if (daysBetween(allDates[i - 1], allDates[i]) >= 4) { found = true; break; }
          }
          currentValue = found ? 1 : 0;
          break;
        }

        case "machine_temps": {
          const res = await db.getFirstAsync(
            `SELECT COUNT(*) as total FROM (
               SELECT date, created_at FROM diary_entries WHERE created_at IS NOT NULL
               UNION ALL
               SELECT date, created_at FROM weight_entries WHERE created_at IS NOT NULL
             ) WHERE julianday(substr(created_at, 1, 10)) - julianday(date) > 7`
          );
          currentValue = (res?.total || 0) > 0 ? 1 : 0;
          break;
        }

        case "insatisfaction_chronique": {
          const res = await db.getFirstAsync(
            `SELECT COUNT(*) as total FROM diary_entries WHERE edit_count >= 4`
          );
          currentValue = (res?.total || 0) > 0 ? 1 : 0;
          break;
        }

        case "oiseau_de_nuit": {
          const res = await db.getFirstAsync(
            `SELECT COUNT(*) as total FROM (
               SELECT created_at FROM diary_entries WHERE created_at IS NOT NULL
               UNION ALL
               SELECT created_at FROM weight_entries WHERE created_at IS NOT NULL
             ) WHERE CAST(strftime('%H', created_at) AS INTEGER) = 3`
          );
          currentValue = (res?.total || 0) > 0 ? 1 : 0;
          break;
        }

        case "syndrome_page_blanche": {
          const res = await db.getFirstAsync(
            `SELECT COUNT(*) as total FROM achievement_events WHERE event_type = 'recipe_editor_abandoned'`
          );
          currentValue = (res?.total || 0) > 0 ? 1 : 0;
          break;
        }

        case "fin_du_tuto": {
          const profile = await db.getFirstAsync(
            `SELECT height, age, gender FROM profileSettings WHERE id = 1`
          );
          const isStillDefault = profile && profile.height === 180 && profile.age === 20 && profile.gender === 1;
          currentValue = profile && !isStillDefault ? 1 : 0;
          break;
        }

        case "grand_nettoyage": {
          const res = await db.getFirstAsync(
            `SELECT MAX(cnt) as maxCnt FROM (
               SELECT substr(created_at, 1, 10) as d, COUNT(*) as cnt
               FROM achievement_events WHERE event_type = 'delete_entry'
               GROUP BY d
             )`
          );
          currentValue = (res?.maxCnt || 0) >= 10 ? 1 : 0;
          break;
        }

        case "horloger_macros": {
          const goals = await db.getFirstAsync(
            `SELECT protein_goal, carbs_goal, fat_goal FROM settings WHERE id = 1`
          );
          if (goals) {
            const hit = await db.getFirstAsync(
              `SELECT COUNT(*) as total FROM (
                 SELECT date,
                   SUM(protein_100g * quantity_g / 100.0) as p,
                   SUM(carbs_100g * quantity_g / 100.0) as c,
                   SUM(fat_100g * quantity_g / 100.0) as f
                 FROM diary_entries GROUP BY date
                 HAVING p BETWEEN ? AND ? AND c BETWEEN ? AND ? AND f BETWEEN ? AND ?
               )`,
              [
                goals.protein_goal * 0.99, goals.protein_goal * 1.01,
                goals.carbs_goal * 0.99, goals.carbs_goal * 1.01,
                goals.fat_goal * 0.99, goals.fat_goal * 1.01,
              ],
            );
            currentValue = (hit?.total || 0) > 0 ? 1 : 0;
          }
          break;
        }

        default:
          currentValue = 0;
          break;
      }
    }

    // 3. Update the progress in the "achievements" table
    const isUnlocked = currentValue >= def.target_value ? 1 : 0;
    const unlockedAt = isUnlocked === 1 ? new Date().toISOString() : null;

    await db.runAsync(
      `UPDATE achievements 
       SET current_value = ?, 
           is_unlocked = CASE WHEN is_unlocked = 1 THEN 1 ELSE ? END, 
           unlocked_at = COALESCE(unlocked_at, ?) 
       WHERE id = ?`,
      [currentValue, isUnlocked, unlockedAt, def.id]
    );

    if (isUnlocked === 1 && (!existing || existing.is_unlocked === 0)) {
      newlyUnlocked.push(def);
    }
  }

  return newlyUnlocked;
}