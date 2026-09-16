# Changelog — link-to

## v0.1.0 — bootstrap del servicio (pendiente de integrar a `main`)

- Servicio de redirecciones con tarjetas OG personalizadas: generador estático zero-dependencias (`build/build.mjs`) que produce páginas HTML con `meta refresh` + OG/Twitter tags completos (dimensiones reales de imagen leídas del archivo).
- Primer link de prueba: `dormir-tranquilo` → artículo de Medium sobre agentes en piloto automático.
- Workflow `.github/workflows/deploy.yml`: build + deploy a GitHub Pages (`build_type=workflow`) en cada push a `main`.
- Imagen OG provisional (1448×1086) pendiente de reemplazo por la versión 1200×630.
- Docs: README de uso + `.context/` (design, decisions, task, todo).