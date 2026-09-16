# Changelog — link-to

## v0.1.0 — bootstrap del servicio (integrado en `main`)

- Servicio de redirecciones con tarjetas OG personalizadas: generador estático zero-dependencias (`build/build.mjs`) que produce páginas HTML con `meta refresh` + OG/Twitter tags completos (dimensiones reales de imagen leídas del archivo).
- Primer link: `dormir-tranquilo` → artículo de Medium sobre agentes en piloto automático (imagen OG 1200×630).
- Workflow `.github/workflows/deploy.yml`: build + habilitación automática de Pages (`configure-pages enablement`) + deploy (`deploy-pages`) en cada push a `main`.
- Docs: README de uso + `.context/` (design, decisions, task, todo).
- Nota de integración: el PAT inicial carecía de scope `workflow`; se añadió y el workflow quedó en el repo.