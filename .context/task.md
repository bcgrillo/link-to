# Task — Bootstrap del servicio de redirecciones con OG cards

**Objetivo**: crear en el repo `bcgrillo/link-to` un sitio con una entrada por cada artículo del blog (`brunogrillo.dev/link-to/<slug>`) que muestra tarjeta OG personalizada al compartir y redirige al artículo. Publicación automática vía GitHub Actions al añadir/modificar `links/<slug>.md`.

## Estado: integrado en `main` y empujado — deploy en curso

Hecho:
- [x] Link de prueba: `links/dormir-tranquilo.md` → Medium, imagen OG 1200×630 en `assets/dormir-tranquilo/og.png`
- [x] Generador `build/build.mjs` + workflow `deploy.yml` (con `configure-pages@v5 enablement: true` para auto-habilitar Pages)
- [x] README + docs `.context/`
- [x] Build verificado localmente (rutas, HTML, imagen 200 OK)
- [x] Rama `feature/sitio-redirecciones-og` empujada (el workflow requirió añadir scope `workflow` al token)
- [x] Merge (fast-forward) a `main` confirmado por el usuario y empujado → dispara el deploy

Pendiente:
- [ ] Verificar run de Actions y site publicado (repo privado: la API anónima no ve runs; verificación pendiente de acceso a brunogrillo.dev o comprobación manual del usuario)
- [ ] Verificar tarjeta OG con scrapers reales (Facebook Sharing Debugger, LinkedIn Post Inspector, X Card Validator)

## Notas temporales

- El repo `link-to` es privado → la API pública sin auth no ve runs/pages; las comprobaciones vía API anónima dan 404.
- CodePods egress bloquea brunogrillo.dev / bcgrillo.github.io — solicitud #19 pendiente de aprobar para verificación final.
- El token git tiene ya scope `workflow`; la API MCP sigue sin autenticar (401 en /user).
- Si Pages no queda accesible: revisar Settings → Pages (Source: GitHub Actions) y visibilidad del site.