/**
 * Recuperation du contenu du site depuis une Google Sheet.
 *
 * Pourquoi le point de terminaison "gviz" plutot que le CSV publie ?
 * ---------------------------------------------------------------
 * Un export CSV "naif" (decoupe des lignes sur les virgules) casse des
 * qu'une cellule contient elle-meme une virgule ou un retour a la ligne -
 * ce qui arrive presque a coup sur dans un texte redige en francais.
 * Le point de terminaison "gviz" (Google Visualization API) renvoie du
 * JSON structure : chaque cellule reste un objet a part entiere, quel
 * que soit son contenu. Pas de parsing de texte fragile.
 *
 * Si GOOGLE_SHEET_ID n'est pas defini (ou si Google est injoignable),
 * le site se construit quand meme a partir de local-data/contenu.sample.json
 * - le site ne casse jamais au build faute de connexion a la Sheet.
 */
const fs = require("fs");
const path = require("path");

const SHEET_ID = process.env.GOOGLE_SHEET_ID || "";
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || "contenu";
const FALLBACK_PATH = path.join(__dirname, "..", "local-data", "contenu.sample.json");

function parseGvizResponse(text) {
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/);
  if (!match) {
    throw new Error("Format de reponse Google Sheets inattendu (gviz non reconnu).");
  }
  const json = JSON.parse(match[1]);
  if (!json.table || !json.table.cols) {
    throw new Error("La feuille semble vide ou l'onglet demande est introuvable.");
  }
  const cols = json.table.cols.map((c) => (c.label || c.id || "").trim().toLowerCase());
  const rows = (json.table.rows || []).map((r) => {
    const obj = {};
    cols.forEach((col, i) => {
      if (!col) return;
      const cell = r.c && r.c[i];
      obj[col] = cell ? (cell.f !== undefined && cell.f !== null ? cell.f : cell.v) : "";
    });
    return obj;
  });
  return rows;
}

async function fetchFromGoogleSheet() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Google Sheets a repondu avec le statut ${res.status}. Verifiez que la feuille est partagee en "Tout le monde avec le lien peut consulter".`);
    }
    const text = await res.text();
    return parseGvizResponse(text);
  } finally {
    clearTimeout(timeout);
  }
}

function loadFallback() {
  const raw = fs.readFileSync(FALLBACK_PATH, "utf-8");
  return JSON.parse(raw);
}

/**
 * Transforme n'importe quel texte (avec accents, espaces, apostrophes,
 * majuscules...) en un slug sûr pour une URL / un nom de fichier :
 * uniquement des minuscules, chiffres et tirets.
 * Ainsi, ce qui est tapé dans la Google Sheet (colonne "slug", ou le titre
 * si la case slug est vide) ne peut jamais faire échouer le déploiement.
 */
function slugify(texte) {
  return String(texte || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // enlève les accents (é -> e, etc.)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // tout ce qui n'est pas lettre/chiffre -> tiret
    .replace(/^-+|-+$/g, "") // pas de tiret au début/à la fin
    .replace(/-{2,}/g, "-"); // pas de tirets multiples de suite
}

function normalize(rows) {
  return rows
    .map((row) => ({
      ...row,
      type: String(row.type || "").trim().toLowerCase(),
      publication: String(row.publication || "").trim().toLowerCase(),
    }))
    .filter((row) => row.publication === "oui")
    .map((row) => ({
      ...row,
      ordre: Number(row.ordre) || 0,
      slug: slugify(row.slug || row.titre),
    }))
    .sort((a, b) => a.ordre - b.ordre);
}

// Memoization : un seul appel reseau meme si plusieurs fichiers de donnees
// (_data/contenu.js, _data/pages.js, _data/articles.js) le demandent.
let cachedPromise = null;

function getContenu() {
  if (cachedPromise) return cachedPromise;

  cachedPromise = (async () => {
    if (!SHEET_ID) {
      console.log("[contenu] GOOGLE_SHEET_ID non defini -> utilisation du contenu de secours local (local-data/contenu.sample.json).");
      return normalize(loadFallback());
    }
    try {
      const rows = await fetchFromGoogleSheet();
      console.log(`[contenu] ${rows.length} ligne(s) recuperee(s) depuis Google Sheets.`);
      return normalize(rows);
    } catch (err) {
      console.warn(`[contenu] Echec de recuperation Google Sheets (${err.message}). Utilisation du contenu de secours local pour ne pas casser le build.`);
      return normalize(loadFallback());
    }
  })();

  return cachedPromise;
}

module.exports = { getContenu, parseGvizResponse, slugify };
