# Decisions — link-to

1. **Static pages + meta refresh, no 301**: GitHub Pages no permite redirects de servidor. Cada entrada es HTML con `meta refresh` + JS + enlace visible. Correcto para scrapers de OG.
2. **Un archivo por link** en `links/<slug>.md` con frontmatter YAML simple (una línea por campo, comillas opcionales). Más cómodo que YAML/JSON puros para añadir links a mano.
3. **Zero-dependencias** en el generador: Node puro, sin `npm install`. Menos superficie de fallo en CI.
4. **Imagen OG a 1200×630** (estándar OG universal: Facebook, X/Twitter, LinkedIn, WhatsApp, Discord, Slack). El build lee las dimensiones reales del archivo y las inyecta en `og:image:width/height`; avisa si no es 1200×630.
5. **`noindex` en las páginas de redirección**: evita duplicar contenido del artículo destino. Los scrapers de OG siguen generando la tarjeta (no dependen de robots).
6. **`canonical` apunta al artículo destino**: Google consolida el page rank hacia el artículo original.
7. **Nunca añadir `CNAME` a este repo**: el dominio `brunogrillo.dev` lo sirve el site principal de la cuenta; este repo se publica bajo `/link-to/`.
8. **Validación estricta en build**: campos obligatorios, slug en kebab-case, imagen existente. Fallar el CI antes de publicar una tarjeta rota.
9. **Deploy solo desde `main`**, vía Actions (`build_type=workflow`), con `workflow_dispatch` para republicar manualmente.