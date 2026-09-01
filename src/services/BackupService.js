import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const DB_NAME = 'fitapp.db';

/**
 * Exporte la base de données actuelle
 */
export async function exportDatabase() {
  try {
    const dbUri = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
    
    const fileInfo = await FileSystem.getInfoAsync(dbUri);
    if (!fileInfo.exists) {
      alert("Aucune base de données trouvée à exporter.");
      return;
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(dbUri, {
        dialogTitle: "Sauvegarder la base de données Fitapp",
        mimeType: "application/x-sqlite3",
      });
    } else {
      alert("Le partage de fichiers n'est pas supporté sur cet appareil.");
    }
  } catch (error) {
    console.error("Erreur lors de l'export :", error);
    alert("Erreur lors de l'export : " + error.message);
  }
}

/**
 * Importe et remplace la base de données par un fichier .db sélectionné
 */
export async function importDatabase() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return;
    }

    const selectedFile = result.assets[0];
    
    const sqliteDir = `${FileSystem.documentDirectory}SQLite/`;
    const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
    }

    const targetUri = `${sqliteDir}${DB_NAME}`;

    const targetInfo = await FileSystem.getInfoAsync(targetUri);
    if (targetInfo.exists) {
      await FileSystem.deleteAsync(targetUri);
    }

    await FileSystem.copyAsync({
      from: selectedFile.uri,
      to: targetUri,
    });

    alert("Base de données importée avec succès ! Redémarrez l'application pour appliquer les changements.");
    
  } catch (error) {
    console.error("Erreur lors de l'import :", error);
    alert("Erreur lors de l'importation : " + error.message);
  }
}