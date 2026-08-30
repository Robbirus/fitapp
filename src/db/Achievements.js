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
      const res = await db.getFirstAsync(def.sql);
      currentValue = res?.total ?? 0;
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
          const res = await db.getFirstAsync(
            `SELECT COUNT(*) as total FROM diary_entries WHERE meal_type = 'Snack'`
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