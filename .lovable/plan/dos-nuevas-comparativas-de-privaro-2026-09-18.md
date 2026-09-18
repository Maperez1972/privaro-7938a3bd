# Dos nuevas comparativas de Privaro

## Objetivo
Añadir `/vs/microsoft-purview` y `/vs/onetrust` usando exactamente la plantilla visual y el tono de las tres comparativas actuales.

## Cambios
- Incorporar el contenido completo de Microsoft Purview y OneTrust al catálogo central de comparativas, con posicionamiento, tabla, recomendaciones y FAQ basados únicamente en la información facilitada.
- Mantener `€150/mo` para Privaro y usar precios genéricos para los competidores: licencia M365 E5/add-on y contact sales.
- Convertir los listados de “Alternatives”, “Compare” y “Other comparisons” para que incluyan las cinco páginas y se enlacen entre sí.
- Incluir las dos nuevas URLs en el sitemap generado.
- Verificar las cinco rutas, sus enlaces cruzados y el resultado en escritorio y móvil.

## Detalles técnicos
- Reutilizar `ComparisonPage` y `COMPARISONS`; no crear una plantilla nueva ni cambiar la ruta dinámica existente.
- Derivar los enlaces desde el catálogo compartido para evitar listas divergentes entre la home, el footer y cada comparativa.
- Mantener la CTA final existente sin cambios.
