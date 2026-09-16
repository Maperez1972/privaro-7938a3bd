# Rediseño de la portada de privaro.ai

Tu lectura corregida del análisis es la buena: el contenido no sobra, está mal ordenado. La portada actual tiene 14 bloques y el visitante llega al formulario agotado. El plan reduce la portada a 7 tramos y reubica lo técnico en páginas que ya existen.

Un matiz importante: **no existe una página "/producto"**. Las páginas de producto actuales son `/ai-governance-platform`, `/enterprise-ai-security`, `/pii-detection-api` y `/security`. El contenido que sale de la portada irá ahí, sin crear páginas nuevas.

## Nueva portada (orden propuesto)

1. Portada con la promesa actual + aviso de urgencia regulatoria (EU AI Act, agosto de 2026)
2. El problema explicado en pocos pasos
3. La solución
4. Ahorro de costes / optimización de contexto (se queda: es diferenciador)
5. Casos de uso, ahora cinco (nuevo: integradores de IA sobre ERP/CRM)
6. Cómo funciona
7. Seguridad + certificación blockchain (juntas, condensadas, con enlace a `/security`)
8. Formulario de contacto simplificado
9. Pie de página actual

## Qué sale de la portada y a dónde va

| Bloque | Destino |
|---|---|
| Brecha de riesgo | `/ai-governance-platform` |
| Ficha técnica (whitepaper) | `/enterprise-ai-security` |
| Mockup del panel | `/ai-governance-platform` |
| Tabla comparativa completa | Se sustituye por una tira compacta con enlaces a `/vs/skyflow`, `/vs/nightfall`, `/vs/private-ai` |
| Bloque de urgencia suelto | Se funde en la portada como aviso de fecha |

## Cambios en bloques concretos

- **Portada**: añadir aviso "EU AI Act: obligaciones de alto riesgo desde el 2 de agosto de 2026" junto al distintivo actual. La fila de enlaces se mantiene (valen para búsquedas) cambiando la etiqueta "Explore:" por algo con más intención, tipo "Guías: ".
- **Formulario**: dos caminos en lugar de seis campos. Camino A "Ver mi riesgo" lleva a `/ai-risk-assessment`; camino B "Hablar con ventas" pide solo nombre, email de empresa y compañía. Se conserva el envío actual a la misma función de correo, rellenando los campos que ya no se piden con valores vacíos.
- **Casos de uso**: quinta tarjeta "Integradores y partners de IA sobre ERP/CRM", enlazando a `/partners`. La rejilla pasa a 5 columnas en pantallas grandes.

## Lo que no hago en este plan

- Vídeo demo de 60-90 s y capturas reales del panel: hay que grabarlos, no los puedo producir yo. Dejo el hueco preparado en el bloque de funcionalidades para insertarlos después.
- Citar a Octupus como cliente de referencia: necesito su permiso por escrito antes de nombrarlo en la web.

## Detalles técnicos

- `src/pages/Index.tsx`: nuevo orden y retirada de `RiskGapSection`, `TechBriefSection`, `DashboardMockupSection`, `UrgencySection` y `ComparisonSection`.
- Esos componentes se reutilizan tal cual dentro de `AIGovernancePlatform.tsx` y `EnterpriseAISecurity.tsx` (sin duplicar código).
- Nuevo `ComparisonTeaser.tsx` compacto con enlaces a `/vs/:slug`.
- `BetaSection.tsx`: dos tarjetas de intención; el formulario corto sigue llamando a `send-demo-request`.
- `UseCasesSection.tsx`: quinta entrada con icono `Network` y color propio.
- Todo el texto nuevo se añade en ES y EN en `LanguageContext.tsx`.
