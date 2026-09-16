# Design — link-to

Servicio de redirecciones con tarjetas OG personalizadas, publicado en GitHub Pages.

## Arquitectura

- **Repo estático + CI**: no hay servidor. Cada link vive en un archivo `links/<slug>.md` con frontmatter (`title`, `description`, `url` obligatorios; opcionales: `image`, `image_alt`, `published`/`modified` (ISO 8601), `tags` (lista separada por comas), `author`/`author_url` con defaults globales "Bruno Grillo" / `https://brunogrillo.dev`). La imagen OG vive en `assets/<slug>/` (por defecto `og.png`).
- **Generador** (`build/build.mjs`, Node ≥18, zero-dependencias): lee los `links/*.md`, valida (slug, campos obligatorios, formato de fechas, existencia de imagen), lee las dimensiones reales de la imagen (PNG IHDR / JPEG SOF) y genera en `dist/`:
  - `dist/<slug>/index.html` — página de redirección: `meta refresh` + `location.replace()` + enlace visible de fallback; en el `<head>`: `og:*`, `twitter:*`, autor (`meta author` + `article:author`), fechas (`article:published_time`/`modified_time`), tags (`article:tag` + `keywords`), con `og:image` absoluto y dimensiones, `canonical` apuntando al destino, `noindex`.
  - `dist/index.html` — landing con listado de links.
  - `dist/404.html` — lista links disponibles.
  - `dist/.nojekyll` y `dist/assets/` (copia de assets).
- **Despliegue**: `.github/workflows/deploy.yml` (push a `main` + manual). Node 20, `node build/build.mjs`, artefacto subido con `actions/upload-pages-artifact@v3` y publicado con `actions/deploy-pages@v4`. Pages habilitado con `build_type=workflow`.
- **URLs**: site servido en `https://brunogrillo.dev/link-to/…` (proyecto Pages de la cuenta, bajo el dominio del site personal). `og:image` usa URL absoluta: `https://brunogrillo.dev/link-to/assets/<slug>/<image>`.
- **Reglas de dominio**: el repo NO debe contener `CNAME` (reclamaría el dominio apex y rompería el site principal).

## Datos clave

- Dimensiones OG recomendadas: **1200×630** (ratio 1.91:1). El build avisa si la imagen no coincide.
- El build falla (exit ≠ 0) si falta algún campo o la imagen → nunca se publica una tarjeta rota.
- El cuerpo del `.md` después del frontmatter se ignora (espacio para notas).