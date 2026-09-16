#!/usr/bin/env node
/**
 * Generador estático del servicio de redirecciones "link-to".
 *
 * Lee:    links/<slug>.md   -> frontmatter con los datos del link
 *         assets/<slug>/    -> imágenes OG (por defecto og.png)
 * Escribe: dist/            -> site estático listo para GitHub Pages
 *
 * Zero-dependencias: sólo usa APIs de Node (>=18), pensado para CI.
 */
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  cpSync,
  existsSync,
  statSync,
} from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SITE = (process.env.SITE_URL ?? 'https://brunogrillo.dev').replace(/\/+$/, '');
const BASE = (process.env.PAGES_BASE_PATH ?? '/link-to').replace(/^\/+|\/+$/g, '');
const OUT_DIR = process.env.OUT_DIR ?? join(ROOT, 'dist');
const LINKS_DIR = process.env.LINKS_DIR ?? join(ROOT, 'links');
const ASSETS_DIR = process.env.ASSETS_DIR ?? join(ROOT, 'assets');
const OG_RECOMMENDED = { width: 1200, height: 630 };
const AUTHOR_NAME = process.env.AUTHOR_NAME ?? 'Bruno Grillo';
const AUTHOR_URL = process.env.AUTHOR_URL ?? 'https://brunogrillo.dev';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})?)?$/;

const escHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const escJs = (s) => JSON.stringify(s).replace(/</g, '\\u003C');
const pathJoin = (...parts) => parts.filter(Boolean).join('/');
const sitePath = (...parts) => '/' + pathJoin(...parts) + '/';

function parseFrontmatter(raw, file) {
  const m = raw.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!m) throw new Error(`${file}: falta el bloque de frontmatter (--- ... ---)`);
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const km = line.match(/^([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
    if (!km) throw new Error(`${file}: línea de frontmatter no válida: "${line.trim()}"`);
    let v = km[2].trim();
    if (v.length >= 2 && ((v[0] === '"' && v.endsWith('"')) || (v[0] === "'" && v.endsWith("'")))) {
      v = v.slice(1, -1);
    }
    data[km[1].toLowerCase()] = v;
  }
  return data;
}

function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9)) { i += 2; continue; }
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}

function imageSize(file) {
  const buf = readFileSync(file);
  const ext = extname(file).toLowerCase();
  if (ext === '.png' && buf.length >= 24 && buf[0] === 0x89 && buf.toString('latin1', 1, 4) === 'PNG') {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (ext === '.jpg' || ext === '.jpeg') return jpegSize(buf);
  return null;
}

function redirectPage({ slug, link, dims, assetUrl }) {
  const title = escHtml(link.title);
  const desc = escHtml(link.description);
  const alt = escHtml(link.image_alt ?? link.title);
  const target = link.url;
  const targetDisp = escHtml(target);
  const targetJs = escJs(target);
  const pageUrl = pathJoin(SITE, BASE, slug) + '/';
  const dimsTags = dims
    ? `\n    <meta property="og:image:width" content="${dims.width}">\n    <meta property="og:image:height" content="${dims.height}">`
    : '';
  const authorTags = [
    link.author ? `\n    <meta name="author" content="${escHtml(link.author)}">` : '',
    link.author_url ? `\n    <meta property="article:author" content="${escHtml(link.author_url)}">` : '',
  ].join('');
  const dateTags = [
    link.published ? `\n    <meta property="article:published_time" content="${escHtml(link.published)}">` : '',
    link.modified ? `\n    <meta property="article:modified_time" content="${escHtml(link.modified)}">` : '',
  ].join('');
  const tags = link.tags ?? [];
  const tagTags = tags.map((t) => `\n    <meta property="article:tag" content="${escHtml(t)}">`).join('');
  const keywordsTag = tags.length ? `\n    <meta name="keywords" content="${escHtml(tags.join(', '))}">` : '';
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, follow">
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <link rel="canonical" href="${targetDisp}">
    <meta http-equiv="refresh" content="0; url=${targetDisp}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="brunogrillo.dev">
    <meta property="og:locale" content="es_ES">${authorTags}${dateTags}${tagTags}${keywordsTag}
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:image" content="${assetUrl}">${dimsTags}
    <meta property="og:image:alt" content="${alt}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${assetUrl}">
    <meta name="twitter:image:alt" content="${alt}">
  </head>
  <body style="margin:0;display:grid;place-items:center;min-height:100vh;font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0">
    <p>Redirigiendo a <a href="${targetDisp}" style="color:#7dd3fc">${targetDisp}</a>…</p>
    <script>location.replace(${targetJs})</script>
  </body>
</html>
`;
}

function indexPage(links) {
  const cards = links
    .map(
      (l) => `      <a class="card" href="${sitePath(BASE, l.slug)}">
        <span class="card-title">${escHtml(l.title)}</span>
        <span class="card-desc">${escHtml(l.description)}</span>
        <span class="card-host">${escHtml(new URL(l.url).host)}</span>
      </a>`,
    )
    .join('\n');
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>brunogrillo.dev · links</title>
    <meta name="description" content="Enlaces cortos con tarjetas OG personalizadas de brunogrillo.dev">
    <style>
      :root { color-scheme: dark; }
      body { margin:0; padding:2rem 1rem; font-family:system-ui,sans-serif; background:#0f172a; color:#e2e8f0; }
      main { max-width:640px; margin:0 auto; display:grid; gap:1rem; }
      h1 { font-size:1.1rem; font-weight:600; color:#94a3b8; margin:0 0 1rem; }
      .card { display:grid; gap:.25rem; padding:1rem 1.25rem; border:1px solid #1e293b; border-radius:.75rem; background:#111c33; text-decoration:none; transition:border-color .15s; }
      .card:hover { border-color:#38bdf8; }
      .card-title { font-weight:600; font-size:1rem; }
      .card-desc { font-size:.875rem; color:#94a3b8; line-height:1.4; }
      .card-host { font-size:.75rem; color:#64748b; margin-top:.25rem; }
    </style>
  </head>
  <body>
    <main>
      <h1>brunogrillo.dev · links</h1>
${cards}
    </main>
  </body>
</html>
`;
}

function notFoundPage(links) {
  const list = links.map((l) => `<li><a href="${sitePath(BASE, l.slug)}">${escHtml(l.title)}</a></li>`).join('');
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Link no encontrado · brunogrillo.dev</title>
    <style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0}main{text-align:center;max-width:480px;padding:2rem}a{color:#7dd3fc}</style>
  </head>
  <body>
    <main>
      <h1>Ese link no existe (todavía)</h1>
      <p>Prueba con uno de los disponibles:</p>
      <ul style="list-style:none;padding:0">${list}</ul>
    </main>
  </body>
</html>
`;
}

function main() {
  const errors = [];
  const warnings = [];
  const links = [];

  if (!existsSync(LINKS_DIR)) {
    console.error(`✗ No existe el directorio de links: ${LINKS_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(LINKS_DIR).filter((f) => f.endsWith('.md')).sort();
  if (files.length === 0) {
    console.error('✗ No hay ningún link definido en links/*.md');
    process.exit(1);
  }

  for (const file of files) {
    const slug = basename(file, '.md');
    try {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
        throw new Error(`slug no válido: "${slug}" (usa minúsculas, números y guiones)`);
      }
      const fm = parseFrontmatter(readFileSync(join(LINKS_DIR, file), 'utf8'), file);
      const required = ['title', 'description', 'url'];
      for (const key of required) {
        if (!fm[key]) throw new Error(`falta el campo obligatorio "${key}" en el frontmatter`);
      }
      if (!/^https?:\/\//.test(fm.url)) throw new Error(`"url" debe empezar por http(s)://`);

      const image = fm.image ?? 'og.png';
      const assetDir = join(ASSETS_DIR, slug);
      const imagePath = join(assetDir, image);
      if (!existsSync(imagePath)) {
        throw new Error(`no existe la imagen OG: ${imagePath}`);
      }
      let dims = imageSize(imagePath);
      if (!dims) {
        warnings.push(`${slug}: no puedo leer las dimensiones de ${image} (formato no soportado), omito og:image:width/height`);
      } else if (dims.width !== OG_RECOMMENDED.width || dims.height !== OG_RECOMMENDED.height) {
        warnings.push(`${slug}: la imagen OG es ${dims.width}×${dims.height}, se recomienda ${OG_RECOMMENDED.width}×${OG_RECOMMENDED.height}`);
      }
      const author = (fm.author ?? AUTHOR_NAME).trim() || null;
      const authorUrl = (fm.author_url ?? AUTHOR_URL).trim() || null;
      if (authorUrl && !/^https?:\/\//.test(authorUrl)) throw new Error(`"author_url" debe empezar por http(s)://`);
      for (const key of ['published', 'modified']) {
        if (fm[key] && !ISO_DATE.test(fm[key].trim())) {
          throw new Error(`"${key}" debe ser una fecha ISO 8601 (ej. 2026-09-16), recibido: "${fm[key]}"`);
        }
      }
      const tags = fm.tags ? fm.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
      links.push({
        slug,
        title: fm.title,
        description: fm.description,
        url: fm.url,
        image,
        image_alt: fm.image_alt,
        author,
        author_url: authorUrl,
        published: fm.published?.trim() || null,
        modified: fm.modified?.trim() || null,
        tags,
        dims,
      });
    } catch (err) {
      errors.push(`${file}: ${err.message}`);
    }
  }

  if (errors.length) {
    for (const e of errors) console.error(`✗ ${e}`);
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, '.nojekyll'), '');

  for (const l of links) {
    const assetDir = join(ASSETS_DIR, l.slug);
    const destAssets = join(OUT_DIR, 'assets', l.slug);
    mkdirSync(dirname(destAssets), { recursive: true });
    cpSync(assetDir, destAssets, { recursive: true });
    const assetUrl = pathJoin(SITE, BASE, 'assets', l.slug, l.image);
    const slugDir = join(OUT_DIR, l.slug);
    mkdirSync(slugDir, { recursive: true });
    writeFileSync(join(slugDir, 'index.html'), redirectPage({ slug: l.slug, link: l, dims: l.dims, assetUrl }));
    const host = new URL(l.url).host;
    const dimStr = l.dims ? `${l.dims.width}×${l.dims.height}` : 'dims ?';
    console.log(`✓ ${l.slug} → ${host} (og: ${l.image}, ${dimStr})`);
  }

  writeFileSync(join(OUT_DIR, 'index.html'), indexPage(links));
  writeFileSync(join(OUT_DIR, '404.html'), notFoundPage(links));
  for (const w of warnings) console.warn(`⚠ ${w}`);
  console.log(`\n${links.length} link(s) generados en ${OUT_DIR}`);
}

main();