# Task — Bootstrap del servicio de redirecciones con OG cards

**Objetivo**: crear en el repo `bcgrillo/link-to` un sitio con una entrada por cada artículo del blog (`brunogrillo.dev/link-to/<slug>`) que muestra tarjeta OG personalizada al compartir y redirige al artículo. Publicación automática vía GitHub Actions al añadir/modificar `links/<slug>.md`.

## Estado: implementado, pendiente de publicar

Hecho:
- [x] Link de prueba creado: `links/dormir-tranquilo.md` → Medium, con imagen movida a `assets/dormir-tranquilo/og.png`
- [x] Generador `build/build.mjs` (zero-dependencias) + workflow `deploy.yml`
- [x] README + docs `.context/`
- [x] Build ejecutado y verificado localmente (HTML correcto, asset copiado, warns de dimensiones OK)

Pendiente:
- [ ] Push a `feature/sitio-redirecciones-og` (checkpoint commits) — hecho/verificado
- [ ] Habilitar GitHub Pages con `build_type=workflow` vía API
- [ ] **Confirmar con el usuario el merge a `main`** → primera publicación real
- [ ] Usuario reemplaza `assets/dormir-tranquilo/og.png` por la versión 1200×630 (mismo path)
- [ ] Verificar tarjeta OG publicada (scrapers de FB/X/LinkedIn)

## Notas temporales

- Egress de CodePods bloquea `brunogrillo.dev` y `docs.github.com`; para verificar el site publicado se necesitará aprobación de acceso del usuario (o comprobar vía API de GitHub / `bcgrillo.github.io`).
- Credenciales git funcionan vía GIT_ASKPASS inyectado; identidad configurada local (`bcgrillo` + noreply).
- Rate limit API GitHub: 60 req/h — usar con moderación.