import { createContext, useContext, useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";

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
        quantity_g REAL NOT NULL,
        date TEXT NOT NULL
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
        ethnicity TEXT NOT NULL DEFAULT 'caucasian'
      );

      INSERT OR IGNORE INTO profileSettings (id) VALUES (1);

      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        calorie_goal REAL NOT NULL DEFAULT 2000,
        protein_goal REAL NOT NULL DEFAULT 120,
        carbs_goal REAL NOT NULL DEFAULT 250,
        fat_goal REAL NOT NULL DEFAULT 65
      );

      INSERT OR IGNORE INTO settings (id) VALUES (1);

      CREATE TABLE IF NOT EXISTS body_measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        neck REAL NOT NULL,
        waist REAL NOT NULL,
        hip REAL NOT NULL,
        date TEXT NOT NULL
      );
    `);

        setDb(database);

        console.log("Base de donnée initialisé avec succès.");
      } catch (error) {
        console.log("Erreur init base de donnée :", error.message);
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
