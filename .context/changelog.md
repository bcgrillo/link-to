# Changelog — link-to

## v0.1.0 — bootstrap del servicio (integrado en `main`)

- Servicio de redirecciones con tarjetas OG personalizadas: generador estático zero-dependencias (`build/build.mjs`) que produce páginas HTML con `meta refresh` + OG/Twitter tags completos (dimensiones reales de imagen leídas del archivo).
- Primer link: `dormir-tranquilo` → artículo de Medium sobre agentes en piloto automático (imagen OG 1200×630).
- Workflow `.github/workflows/deploy.yml`: build + habilitación automática de Pages (`configure-pages enablement`) + deploy (`deploy-pages`) en cada push a `main`.
- Docs: README de uso + `.context/` (design, decisions, task, todo).
- Nota de integración: el PAT inicial carecía de scope `workflow`; se añadió y el workflow quedó en el repo.

## v0.1.1 — primera publicación en producción

- Repo hecho público (requisito: Pages de repos privados no se sirve bajo el dominio custom).
- Pages activado manualmente una vez (Settings → Pages → Source: GitHub Actions): el `GITHUB_TOKEN` no puede crear el site de Pages (`Resource not accessible by integration`) y `administration` no es un scope válido en `permissions` de workflows (run con 0 jobs). `enablement: true` se mantiene en el workflow para idempotencia en siguientes deploys.
- Deploy verde (run `35072535414`) y sitio verificado en vivo:
  - `https://brunogrillo.dev/link-to/` (index)
  - `https://brunogrillo.dev/link-to/dormir-tranquilo/` (redirect + OG tags)
  - `https://brunogrillo.dev/link-to/assets/dormir-tranquilo/og.png` (1200×630)
- A partir de ahora: cada push a `main` (p. ej. añadir `links/<slug>.md`) publica solo.

## v0.1.2 — metadatos de autor, fechas y tags (pendiente de merge)

- Nuevos campos opcionales en `links/<slug>.md`: `author`/`author_url` (defaults globales "Bruno Grillo" / `https://brunogrillo.dev`), `published`/`modified` (ISO 8601, validado) y `tags` (lista separada por comas).
- Meta tags añadidos a las páginas de redirección: `meta name="author"`, `article:author`, `article:published_time`, `article:modified_time`, `article:tag` (uno por tag) y `meta keywords`.