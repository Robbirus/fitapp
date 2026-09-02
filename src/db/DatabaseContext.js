import { createContext, useContext, useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import { ensureAchievementsSeeded } from "./Queries";

const DatabaseContext = createContext(null);

export function DatabaseProvider({ children }) {
  const [db, setDb] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const database = await SQLite.openDatabaseAsync("fitapp.db");

        await database.execAsync(`
          CREATE TABLE IF NOT EXISTS diary_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            calories_100g REAL NOT NULL,
            protein_100g REAL DEFAULT 0,
            carbs_100g REAL DEFAULT 0,
            fat_100g REAL DEFAULT 0,
            fiber_100g REAL DEFAULT 0,
            quantity_g REAL NOT NULL,
            date TEXT NOT NULL,
            meal_type TEXT NOT NULL DEFAULT 'Snack',
            score REAL,
            score_type TEXT,
            nutriscore_grade TEXT,
            is_organic INTEGER,
            origin_category TEXT
          );

          CREATE TABLE IF NOT EXISTS weight_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            value REAL NOT NULL,
            date TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            duration INTEGER NOT NULL,
            calories_burned REAL NOT NULL,
            date TEXT NOT NULL
          );
          
          CREATE TABLE IF NOT EXISTS profileSettings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            name TEXT NOT NULL DEFAULT 'John Doe',
            height REAL NOT NULL DEFAULT 180,
            age INTEGER NOT NULL DEFAULT 20,
            gender INTEGER DEFAULT 1,
            activity_level TEXT NOT NULL DEFAULT 'moderate',
            weight_goal TEXT NOT NULL DEFAULT 'maintain',
            weight_goal_rate REAL NOT NULL DEFAULT 0,
            goal_start_date TEXT,
            goal_start_weight REAL,
            ethnicity TEXT NOT NULL DEFAULT 'caucasian',
            meal_times TEXT DEFAULT '{"breakfast":"08:00","lunch":"12:30","snack":"16:30","dinner":"20:00"}',
            water_goal REAL DEFAULT 2.0,
            diet_style TEXT NOT NULL DEFAULT 'balanced'
          );

          INSERT OR IGNORE INTO profileSettings (id) VALUES (1);

          CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            calorie_goal REAL NOT NULL DEFAULT 2000,
            protein_goal REAL NOT NULL DEFAULT 120,
            carbs_goal REAL NOT NULL DEFAULT 250,
            fat_goal REAL NOT NULL DEFAULT 65,
            fiber_goal REAL NOT NULL DEFAULT 25,
            water_goal REAL NOT NULL DEFAULT 2.0
          );

          INSERT OR IGNORE INTO settings (id) VALUES (1);

          CREATE TABLE IF NOT EXISTS body_measurements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            neck REAL NOT NULL,
            waist REAL NOT NULL,
            hip REAL NOT NULL,
            date TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS recipes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL,
            score REAL
          );

          CREATE TABLE IF NOT EXISTS recipe_ingredients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            recipe_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            calories_100g REAL NOT NULL,
            protein_100g REAL DEFAULT 0,
            carbs_100g REAL DEFAULT 0,
            fat_100g REAL DEFAULT 0,
            fiber_100g REAL DEFAULT 0,
            quantity_g REAL NOT NULL,
            score REAL,
            score_type TEXT,
            nutriscore_grade TEXT,
            is_organic INTEGER,
            origin_category TEXT
          );

          CREATE TABLE IF NOT EXISTS achievements (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL, -- 'streak', 'nutrition', 'weight'
            target_value REAL NOT NULL,
            current_value REAL DEFAULT 0,
            is_unlocked INTEGER DEFAULT 0,
            unlocked_at TEXT
          );

          -- Generic user action log, used only to calculate
          -- certain successes that depend on a behavior (one-time action) rather
          -- as well as the current state of the data (e.g. "duplicate a food 3 times").
          CREATE TABLE IF NOT EXISTS achievement_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            payload TEXT,
            created_at TEXT NOT NULL
          );

          CREATE TABLE IF NOT EXISTS water_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount_ml REAL NOT NULL,
            date TEXT NOT NULL,
            created_at TEXT NOT NULL
          );
        `);

        try {
          await database.execAsync(`ALTER TABLE profileSettings ADD COLUMN meal_times TEXT DEFAULT '{"breakfast":"08:00","lunch":"12:30","snack":"16:30","dinner":"20:00"}';`);
        } catch (e) { /* La colonne existe déjà */ }

        try {
          await database.execAsync(`ALTER TABLE profileSettings ADD COLUMN water_goal REAL DEFAULT 2.0;`);
        } catch (e) { /* La colonne existe déjà */ }

        try {
          await database.execAsync(`ALTER TABLE settings ADD COLUMN water_goal REAL DEFAULT 2.0;`);
        } catch (e) { /* La colonne existe déjà */ }

        try {
          await database.execAsync(`ALTER TABLE profileSettings ADD COLUMN diet_style TEXT NOT NULL DEFAULT 'balanced';`);
        } catch (e) { /* La colonne existe déjà */ }

        const reminderColumns = [
          { column: "water_reminder_enabled", type: "INTEGER DEFAULT 0" },
          { column: "water_reminder_start", type: "TEXT DEFAULT '08:00'" },
          { column: "water_reminder_end", type: "TEXT DEFAULT '20:00'" },
          { column: "water_reminder_interval_hours", type: "REAL DEFAULT 2" },
        ];
        for (const { column, type } of reminderColumns) {
          try {
            await database.execAsync(`ALTER TABLE profileSettings ADD COLUMN ${column} ${type};`);
          } catch (e) { /* La colonne existe déjà */ }
        }

        // Food scoring feature -- migrations for pre-existing installs
        const scoreColumns = [
          { table: "diary_entries", column: "score", type: "REAL" },
          { table: "diary_entries", column: "score_type", type: "TEXT" },
          { table: "diary_entries", column: "nutriscore_grade", type: "TEXT" },
          { table: "diary_entries", column: "is_organic", type: "INTEGER" },
          { table: "diary_entries", column: "origin_category", type: "TEXT" },
          { table: "recipe_ingredients", column: "score", type: "REAL" },
          { table: "recipe_ingredients", column: "score_type", type: "TEXT" },
          { table: "recipe_ingredients", column: "nutriscore_grade", type: "TEXT" },
          { table: "recipe_ingredients", column: "is_organic", type: "INTEGER" },
          { table: "recipe_ingredients", column: "origin_category", type: "TEXT" },
          { table: "recipes", column: "score", type: "REAL" },
        ];
        for (const { table, column, type } of scoreColumns) {
          try {
            await database.execAsync(
              `ALTER TABLE ${table} ADD COLUMN ${column} ${type};`,
            );
          } catch (e) { /* Column already exists */ }
        }

        const timestampColumns = [
          { table: "diary_entries", column: "created_at", type: "TEXT" },
          { table: "diary_entries", column: "edit_count", type: "INTEGER DEFAULT 0" },
          { table: "weight_entries", column: "created_at", type: "TEXT" },
          { table: "activities", column: "created_at", type: "TEXT" },
        ];
        for (const { table, column, type } of timestampColumns) {
          try {
            await database.execAsync(
              `ALTER TABLE ${table} ADD COLUMN ${column} ${type};`,
            );
          } catch (e) { /* Column already exists */ }
        }

        try {
          await database.execAsync(`
            UPDATE diary_entries SET created_at = date || 'T12:00:00.000Z' WHERE created_at IS NULL;
            UPDATE weight_entries SET created_at = date || 'T12:00:00.000Z' WHERE created_at IS NULL;
            UPDATE activities SET created_at = date || 'T12:00:00.000Z' WHERE created_at IS NULL;
          `);
        } catch (e) { console.log("Erreur backfill created_at:", e.message); }

        try {
          await ensureAchievementsSeeded(database);
        } catch (e) { console.log("Erreur seed achievements:", e.message); }

        setDb(database);
        console.log("Base de données initialisée avec succès.");
      } catch (error) {
        console.log("Erreur init base de données :", error.message);
      }
    };
    init();
  }, []);

  if (!db) return null;

  return (
    <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>
  );
}

export function useDatabase() {
  return useContext(DatabaseContext);
}