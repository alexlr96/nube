/**
 * Tablero de autoevaluación de calidad en salud, compartido por el grupo.
 *
 * Este script va pegado dentro de una planilla de Google (Extensiones > Apps Script).
 * Las respuestas se guardan en la hoja "datos" de esa planilla: una fila por campo.
 */

// Escriba entre las comillas la clave que va a pasarles a sus compañeras.
// Mientras diga CAMBIAR, el tablero no deja entrar a nadie.
const CLAVE_GRUPO = 'CAMBIAR';

const HOJA = 'datos';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Autoevaluación de Calidad en Salud')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function hoja_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let h = ss.getSheetByName(HOJA);
  if (!h) {
    h = ss.insertSheet(HOJA);
    h.getRange('B:B').setNumberFormat('@');   // el valor se guarda como texto, sin que Sheets lo convierta
    h.getRange(1, 1, 1, 4).setValues([['campo', 'valor', 'version', 'actualizado']]);
    h.setFrozenRows(1);
  }
  return h;
}

function validar_(clave) {
  if (CLAVE_GRUPO === 'CAMBIAR') throw new Error('SIN_CONFIGURAR');
  if (String(clave || '') !== CLAVE_GRUPO) throw new Error('CLAVE');
}

function comprobarClave(clave) {
  validar_(clave);
  return true;
}

function revActual_() {
  return Number(PropertiesService.getScriptProperties().getProperty('rev') || 0);
}

/** Devuelve los campos que cambiaron después de la versión `desde`, y quién está conectada. */
function leer(clave, desde, yo) {
  validar_(clave);
  desde = Number(desde) || 0;
  const presentes = presencia_(yo);
  const rev = revActual_();
  if (desde > 0 && desde === rev) return { rev: rev, cambios: [], presentes: presentes };
  if (desde > rev) desde = 0;
  const h = hoja_();
  const n = h.getLastRow();
  const cambios = [];
  if (n >= 2) {
    h.getRange(2, 1, n - 1, 3).getValues().forEach(function (f) {
      if (!f[0] || Number(f[2]) <= desde) return;
      let v = null;
      if (f[1] !== '') { try { v = JSON.parse(f[1]); } catch (e) { v = String(f[1]); } }
      cambios.push({ k: String(f[0]), v: v });
    });
  }
  return { rev: rev, cambios: cambios, presentes: presentes };
}

/** Guarda una lista de campos [{k, v}] y devuelve la nueva versión. */
function escribir(clave, lista) {
  validar_(clave);
  const porClave = {};
  (lista || []).forEach(function (it) {
    const k = String(it && it.k || '');
    if (/^(org|resp)\/[A-Za-z0-9_-]{1,40}$/.test(k)) porClave[k] = it.v;
  });
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const props = PropertiesService.getScriptProperties();
    const rev = Number(props.getProperty('rev') || 0) + 1;
    const h = hoja_();
    const n = h.getLastRow();
    const filas = n >= 2 ? h.getRange(2, 1, n - 1, 4).getValues() : [];
    const idx = {};
    filas.forEach(function (f, i) { idx[String(f[0])] = i; });
    const ahora = new Date();
    const nuevas = [];
    let tocadas = false;
    Object.keys(porClave).forEach(function (k) {
      const v = porClave[k];
      const val = (v === null || v === undefined) ? '' : JSON.stringify(v).slice(0, 49000);
      if (k in idx) { filas[idx[k]] = [k, val, rev, ahora]; tocadas = true; }
      else nuevas.push([k, val, rev, ahora]);
    });
    if (tocadas) h.getRange(2, 1, filas.length, 4).setValues(filas);
    if (nuevas.length) {
      const r = h.getRange(n + 1, 1, nuevas.length, 4);
      r.offset(0, 1, nuevas.length, 1).setNumberFormat('@');
      r.setValues(nuevas);
    }
    props.setProperty('rev', String(rev));
    return { rev: rev };
  } finally {
    lock.releaseLock();
  }
}

/** Registra a quien consulta y devuelve a las demás conectadas en los últimos 15 segundos. */
function presencia_(yo) {
  const cache = CacheService.getScriptCache();
  let ids = [];
  try { ids = JSON.parse(cache.get('p_ids') || '[]'); } catch (e) { ids = []; }
  const miId = yo && /^[a-z0-9]{4,40}$/.test(String(yo.id)) ? String(yo.id) : '';
  if (miId) {
    cache.put('p_' + miId, JSON.stringify({
      id: miId,
      nombre: String(yo.nombre || '').slice(0, 40),
      campo: String(yo.campo || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40),
      t: Date.now()
    }), 60);
    if (ids.indexOf(miId) < 0) ids.push(miId);
  }
  const vals = ids.length ? cache.getAll(ids.map(function (i) { return 'p_' + i; })) : {};
  const vivos = ids.filter(function (i) { return vals['p_' + i] || i === miId; }).slice(-40);
  cache.put('p_ids', JSON.stringify(vivos), 21600);
  const out = [];
  vivos.forEach(function (i) {
    if (i === miId || !vals['p_' + i]) return;
    const p = JSON.parse(vals['p_' + i]);
    if (Date.now() - p.t < 15000) out.push({ nombre: p.nombre, campo: p.campo });
  });
  return out;
}
