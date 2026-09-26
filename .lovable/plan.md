# Plan: que los bots vean privaro.ai sin JavaScript + seguridad, LCP móvil y accesibilidad

## 1. Contenido visible sin JavaScript (prioridad máxima)

Opción elegida: **prerenderizado en el build** (sin migrar la app, sin servicios externos).

- Al terminar el build, un script genera un HTML estático por cada página pública: `/`, `/pricing`, `/docs`, `/docs/api`, `/blog`, cada `/blog/*`, cada `/vs/*`, casos de uso, legales, etc. (la misma lista del sitemap).
- Cada HTML lleva su propio título, descripción, canonical, etiquetas sociales y el **texto real de la página** (titulares, features, tabla de precios, preguntas frecuentes, artículo completo) dentro del contenedor de la app. Al cargar JS, React lo sustituye; el visitante no nota nada.
- El texto sale de las mismas fuentes que ya usa la web (artículos del blog, comparativas, planes, traducciones EN), así que se actualiza solo en cada publicación.
- El panel autenticado (/dashboard, /auth…) queda fuera.
- Verificación: `curl` de cada ruta tras el build mostrando precios, docs y contenido.

Alternativa más completa (no incluida): migrar a TanStack Start para SSR real. Más lenta y con más riesgo; la dejo para más adelante si hace falta.

## 2. Cabeceras de seguridad

Limitación: el alojamiento de Lovable no permite configurar cabeceras HTTP propias.
- **Content-Security-Policy**: la añado como etiqueta `<meta>` en todas las páginas (lista de dominios permitidos: Supabase, Google Analytics/Fonts, Redoc CDN, badges de directorios, API de Privaro).
- **X-Frame-Options / frame-ancestors** y **Permissions-Policy**: no funcionan vía `<meta>`. Opciones: poner Cloudflare (proxy) delante de privaro.ai con una regla de cabeceras — os doy la configuración exacta. Añado además un bloqueo por JS contra incrustación en iframes como medida parcial.
- **SPF**: es DNS; hay que hacerlo en vuestro proveedor de DNS. Os doy el registro exacto (según quién envía correo: Google Workspace, el proveedor de emails de la app…).

## 3. LCP móvil 5.6 s

- Auditoría con Lighthouse móvil local para identificar el elemento LCP.
- El prerender del punto 1 ya ayuda: el titular aparece antes de que cargue JS.
- Revisar: fuente Inter (auto-alojar o reducir pesos), CSS crítico, imágenes del hero, trozos JS de la portada, carga diferida de secciones y badges externos.

## 4. Accesibilidad

- Localizar los campos de formulario sin etiqueta (Lighthouse/axe) y añadir `<label>` o `aria-label` en español/inglés.

## Detalles técnicos

- Nuevo `scripts/prerender.ts` ejecutado como `postbuild` (o plugin de Vite `closeBundle`) que escribe `dist/<ruta>/index.html` a partir de `dist/index.html`, reusando la lista de rutas de `generate-sitemap.ts` y los datos de `src/content/*`.
- Riesgo: confirmar que el hosting sirve `dist/pricing/index.html` para `/pricing`; si no, se genera también `dist/pricing.html`.
- CSP en `index.html`; revisar que Redoc, gtag y badges sigan funcionando en el preview.
