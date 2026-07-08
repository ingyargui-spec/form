export interface SubmissionData {
  id: string;
  timestamp: string;
  matriculeBac: string;
  nom: string;
  prenom: string;
  wilayaBac: string;
  regionWilayaBac: string;
  anneeBac: string;
  moyenneBac: number;
  serieBac: string;
  situation: string;
  motifReorientation: string;
  choix1: string;
  choix2: string;
  choix3: string;
}

const RESPONSES_FILE_NAME = "Réorientation 2026 - Réponses";
const UNIVERSITIES_FILE_NAME = "Réorientation 2026 - Universités Data";

// Search for a file by name and mimeType in the user's Google Drive
export async function searchGoogleDriveFile(token: string, name: string): Promise<string | null> {
  try {
    const q = `name = '${name}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`;
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,webViewLink)`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Error searching Google Drive:", errText);
      return null;
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
    return null;
  } catch (error) {
    console.error("Failed to search file on Google Drive:", error);
    return null;
  }
}

// Get the web view link of a spreadsheet
export async function getSpreadsheetLink(token: string, spreadsheetId: string): Promise<string | null> {
  try {
    const url = `https://www.googleapis.com/drive/v3/files/${spreadsheetId}?fields=webViewLink`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data.webViewLink;
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

// Create a new Google Spreadsheet with custom headers
export async function createResponsesSpreadsheet(token: string): Promise<string> {
  const url = "https://sheets.googleapis.com/v4/spreadsheets";
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title: RESPONSES_FILE_NAME,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create spreadsheet: ${errText}`);
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;

  // Initialize the Headers
  const headers = [
    [
      "Submission ID",
      "Timestamp",
      "Matricule BAC",
      "Nom",
      "Prénom",
      "Wilaya du BAC",
      "Région Wilaya",
      "Année du BAC",
      "Moyenne du BAC",
      "Série du BAC",
      "Situation (en 2025-2026)",
      "Motif de la Réorientation",
      "Choix 1 (Université/Domaine/Spécialité)",
      "Choix 2 (Université/Domaine/Spécialité)",
      "Choix 3 (Université/Domaine/Spécialité)"
    ]
  ];

  await writeSpreadsheetValues(token, spreadsheetId, "Sheet1!A1:O1", headers);
  return spreadsheetId;
}

// Helper to write values in a spreadsheet
export async function writeSpreadsheetValues(
  token: string,
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to write values to sheet: ${errText}`);
  }
}

// Append rows of data to a spreadsheet
export async function appendSubmissionToSpreadsheet(
  token: string,
  spreadsheetId: string,
  submission: SubmissionData
): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`;
  
  const rowValue = [
    submission.id,
    submission.timestamp,
    submission.matriculeBac,
    submission.nom,
    submission.prenom,
    submission.wilayaBac,
    submission.regionWilayaBac,
    submission.anneeBac,
    submission.moyenneBac,
    submission.serieBac,
    submission.situation,
    submission.motifReorientation,
    submission.choix1,
    submission.choix2,
    submission.choix3
  ];

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: [rowValue],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to append submission to sheet: ${errText}`);
  }
}

// Fetch all submissions from a spreadsheet
export async function fetchAllSubmissions(token: string, spreadsheetId: string): Promise<SubmissionData[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A2:O1000`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Failed to fetch submissions:", errText);
    return [];
  }

  const data = await res.json();
  const rows = data.values || [];

  return rows.map((row: any[], index: number) => ({
    id: row[0] || `S-${index + 1}`,
    timestamp: row[1] || "",
    matriculeBac: row[2] || "",
    nom: row[3] || "",
    prenom: row[4] || "",
    wilayaBac: row[5] || "",
    regionWilayaBac: row[6] || "",
    anneeBac: row[7] || "",
    moyenneBac: row[8] ? Number(row[8]) : 0,
    serieBac: row[9] || "",
    situation: row[10] || "",
    motifReorientation: row[11] || "",
    choix1: row[12] || "",
    choix2: row[13] || "",
    choix3: row[14] || ""
  }));
}

// Create and pre-populate the University data spreadsheet so that users can edit it in Sheets!
export async function createAndPopulateUniversitySpreadsheet(token: string, universityRows: Array<{university: string, domain: string, speciality: string}>): Promise<string> {
  const url = "https://sheets.googleapis.com/v4/spreadsheets";
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title: UNIVERSITIES_FILE_NAME,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create university spreadsheet: ${errText}`);
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;

  // Split rows in chunks because Writing thousands of rows at once is best handled in a single large sheet write
  const chunkHeader = [["Université", "Domaine d'études", "Spécialité"]];
  const chunkData = universityRows.map(r => [r.university, r.domain, r.speciality]);
  const allValues = [...chunkHeader, ...chunkData];

  // We can write to A1:Cxxxx range
  const range = `Sheet1!A1:C${allValues.length}`;
  await writeSpreadsheetValues(token, spreadsheetId, range, allValues);

  return spreadsheetId;
}

// Load dynamic university data from a custom sheet if the user configured one
export async function fetchUniversityDataFromSpreadsheet(token: string, spreadsheetId: string): Promise<Array<{university: string, domain: string, speciality: string}>> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A2:C5000`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Unable to read university sheet data");
  }

  const data = await res.json();
  const rows = data.values || [];

  return rows
    .filter(row => row && row.length >= 3 && row[0] && row[1] && row[2])
    .map(row => ({
      university: row[0].trim(),
      domain: row[1].trim(),
      speciality: row[2].trim()
    }));
}
