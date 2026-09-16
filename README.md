# link-to

Servicio de redirecciones con tarjetas OG personalizadas. Cada artículo del blog tiene su propia entrada: `https://brunogrillo.dev/link-to/<slug>` muestra una tarjeta bonita al compartirla (X/Twitter, LinkedIn, WhatsApp, Slack…) y redirige al artículo destino.

## Cómo añadir un link nuevo

1. **Crea el archivo del link** en `links/<slug>.md` (el nombre del archivo es el slug de la URL final):

   ```markdown
   ---
   title: Título del artículo
   description: Descripción corta para la tarjeta.
   url: https://destino-del-articulo/...
   image: og.png
   published: 2026-09-16
   tags: AI, Agents, Software Development
   ---
   ```

   - `title`, `description` y `url` son obligatorios.
   - `image` (opcional, por defecto `og.png`): nombre del archivo de imagen dentro de `assets/<slug>/`.
   - `image_alt` (opcional): texto alternativo de la imagen.
   - `published` / `modified` (opcional): fecha ISO 8601 (ej. `2026-09-16`) → `article:published_time` / `article:modified_time`.
   - `tags` (opcional): lista separada por comas → `article:tag` + `keywords`.
   - `author` / `author_url` (opcional): por defecto "Bruno Grillo" / `https://brunogrillo.dev` → `meta author` + `article:author`. Ponlos vacíos para omitirlos.

2. **Añade la imagen OG** en `assets/<slug>/og.png` (o `.jpg`). Dimensiones recomendadas: **1200×630 px** (ratio 1.91:1, el estándar OG que usan todas las plataformas).

3. **Sube un commit a `main`**. El GitHub Action genera las páginas y las publica automáticamente en unos segundos.

## Cómo funciona

- `build/build.mjs` genera un HTML estático por cada link en `dist/<slug>/index.html` con: `meta refresh` + JavaScript de redirección, y los metadatos completos de tarjeta (`og:*` y `twitter:*`, incluyendo `og:image` con URL absoluta y dimensiones reales leídas de la imagen).
- No se necesitan dependencias externas; el build corre en Node 20 sin `npm install`.
- La landing `dist/index.html` lista todos los links y `dist/404.html` avisa de links inexistentes.
- El build **falla** si falta algún campo o la imagen, para no publicar nunca una tarjeta rota.

## Estructura

```
├── links/<slug>.md        # definición de cada link (frontmatter)
├── assets/<slug>/og.png   # imagen OG de cada link (1200×630 recomendado)
├── build/build.mjs        # generador estático (zero-dependencias)
└── .github/workflows/deploy.yml
```