# 03 · Requerimientos no funcionales

## Seguridad

| ID     | Requerimiento                                                                                                                                                                                                             | Verificación                                            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| RNF-01 | Los refresh tokens, URLs ICS y claves de API se almacenan **cifrados en reposo** (AES-256-GCM) con una clave de aplicación fuera de la base de datos.                                                                     | Revisión de código + prueba de lectura directa de la BD |
| RNF-02 | Ningún secreto se versiona. `.env` está en `.gitignore`; existe `.env.example` y escaneo de secretos en CI.                                                                                                               | CI falla si detecta secreto                             |
| RNF-03 | **Mínimo privilegio en Google:** scopes `calendar.readonly` y `calendar.app.created`. Con ellos la app **no puede** editar ni borrar eventos en calendarios que no creó.                                                  | Revisión de scopes en la pantalla de consentimiento     |
| RNF-04 | El bot solo atiende al `chat_id` autorizado; los demás mensajes se ignoran y se registran.                                                                                                                                | Prueba con segundo usuario                              |
| RNF-05 | **Defensa ante inyección de instrucciones:** el contenido de eventos (títulos, descripciones, invitaciones de terceros) es dato no confiable. Se pasa al LLM delimitado y nunca puede disparar acciones sin confirmación. | Pruebas con eventos maliciosos                          |
| RNF-06 | Las acciones de escritura destructiva requieren confirmación explícita del usuario.                                                                                                                                       | Prueba E2E                                              |
| RNF-07 | La web y la API se exponen solo por canal cifrado (HTTPS) y detrás de autenticación; preferiblemente por red privada (Tailscale) o Cloudflare Tunnel con Access.                                                          | Revisión de despliegue                                  |
| RNF-08 | Dependencias auditadas (`pnpm audit`) y actualizadas con Dependabot/Renovate.                                                                                                                                             | CI                                                      |

## Privacidad

| ID     | Requerimiento                                                                                                                                                                                                  |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RNF-09 | Minimización de datos al LLM: se envían solo los campos necesarios (título, hora, asistentes en conteo). Opción para **ocultar títulos** de categorías sensibles (p. ej., trabajo) y usar etiquetas genéricas. |
| RNF-10 | El audio de las notas de voz se **elimina** inmediatamente después de transcribirlo. Solo se guarda el texto.                                                                                                  |
| RNF-11 | Retención de logs: 30 días; el audit log se conserva 12 meses.                                                                                                                                                 |
| RNF-12 | Cumplir la política de datos de Veritran y de la universidad sobre el uso de datos de calendario con terceros (ver Q-01).                                                                                      |

## Rendimiento y capacidad

| ID     | Requerimiento                                | Meta                                                  |
| ------ | -------------------------------------------- | ----------------------------------------------------- |
| RNF-13 | Respuesta de comandos (`/hoy`, `/libre`)     | p95 < 2 s                                             |
| RNF-14 | Respuesta a texto libre con LLM              | p95 < 6 s                                             |
| RNF-15 | Voz: transcripción + interpretación + acción | p95 < 10 s                                            |
| RNF-16 | Sincronización incremental de Google         | < 60 s por ciclo; ciclo cada 5 min                    |
| RNF-17 | Vista web: carga inicial de la semana        | < 2 s en 4G                                           |
| RNF-18 | Capacidad                                    | 1 usuario, hasta 10 000 eventos en BD sin degradación |

## Confiabilidad y operación

| ID     | Requerimiento                                                                                                                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| RNF-19 | Disponibilidad objetivo 99 % mensual (mejor esfuerzo, self-hosted). Contenedores con `restart: unless-stopped` y healthchecks.                                                                                     |
| RNF-20 | Tolerancia a fallos de proveedores: si el LLM o Google fallan, el bot responde con mensaje claro y reintenta con _backoff_ exponencial; los comandos deterministas (`/hoy`) siguen funcionando con datos en caché. |
| RNF-21 | **Idempotencia:** reenviar o reprocesar el mismo mensaje de Telegram no crea eventos duplicados (clave por `update_id`).                                                                                           |
| RNF-22 | Respaldo diario de PostgreSQL con retención de 14 días y restauración probada.                                                                                                                                     |
| RNF-23 | Observabilidad: logs estructurados (JSON), endpoint `/health` y `/metrics`, alerta por Telegram si falla la sincronización 3 veces seguidas.                                                                       |
| RNF-24 | Cumplimiento de límites (_rate limits_) de Google y Telegram con cola y espera.                                                                                                                                    |

## Mantenibilidad y calidad

| ID     | Requerimiento                                                                                                                                            |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RNF-25 | TypeScript en modo `strict`; ESLint y Prettier obligatorios en CI.                                                                                       |
| RNF-26 | Principios **SOLID, KISS y Clean Code**: núcleo de dominio sin dependencias de infraestructura; conectores detrás de interfaces (puertos y adaptadores). |
| RNF-27 | Cobertura de pruebas ≥ 80 % en el núcleo (métricas, dedupe, parseo de rangos); pruebas de contrato para conectores; E2E del flujo de voz con mocks.      |
| RNF-28 | Migraciones de BD versionadas y reversibles.                                                                                                             |
| RNF-29 | Documentación viva: README por paquete, ADRs en `07`, OpenAPI para la API.                                                                               |
| RNF-30 | Conventional Commits y _trunk-based development_ con ramas cortas y PRs.                                                                                 |

## Usabilidad

| ID     | Requerimiento                                                                                                                                                                           |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RNF-31 | Idioma español; mensajes del bot cortos, con formato consistente y botones para decisiones.                                                                                             |
| RNF-32 | Interpretación robusta de expresiones de tiempo en español ("a las 3 de la tarde", "mañana a primera hora", "de 9 a 9:30", "hace 20 minutos"). Zona horaria America/Bogota por defecto. |
| RNF-33 | Accesibilidad web WCAG 2.1 AA (contraste, teclado, lectores de pantalla).                                                                                                               |
| RNF-34 | Diseño móvil primero (PWA); modo claro/oscuro.                                                                                                                                          |

## Costos

| ID     | Requerimiento                                                                                                                                |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| RNF-35 | Tope mensual de gasto en LLM/transcripción configurable, con aviso al 80 % y corte suave al 100 % (el bot sigue con comandos deterministas). |
| RNF-36 | Infraestructura objetivo: costo fijo ≤ 10 USD/mes (idealmente 0 si corre en equipo propio).                                                  |
| RNF-37 | Caché de resultados y resumen determinista previo para reducir tokens (el LLM redacta, no calcula).                                          |

## Portabilidad

| ID     | Requerimiento                                                                                                  |
| ------ | -------------------------------------------------------------------------------------------------------------- |
| RNF-38 | Todo el sistema se levanta con `docker compose up` en Windows (Docker Desktop/WSL2), Linux o VPS.              |
| RNF-39 | Proveedores de LLM y transcripción intercambiables por configuración (interfaz `LlmProvider`, `SpeechToText`). |
| RNF-40 | Almacenamiento de fechas en UTC; conversión a zona horaria solo en la capa de presentación.                    |
