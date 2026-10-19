# 02 · Requerimientos funcionales

Prioridad **MoSCoW**: M = Must (MVP), S = Should, C = Could, W = Won't (por ahora). Fase: v0.1 MVP, v0.2, v0.3, v0.4, F3 = fase 3.

## A. Conexión y configuración

| ID    | Requerimiento                                                                                                                                                                              | Prio | Fase |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- | ---- |
| RF-01 | El sistema permite conectar una cuenta Google mediante OAuth 2.0 (flujo de código con refresh token) y renueva el acceso automáticamente.                                                  | M    | v0.1 |
| RF-02 | El sistema lista todos los calendarios visibles de la cuenta (propios y compartidos) y permite habilitarlos/deshabilitarlos y asignarles una categoría: `trabajo`, `estudio` o `personal`. | M    | v0.1 |
| RF-03 | El sistema crea (si no existe) un calendario secundario llamado **"Registro"** y lo marca como único destino de escritura.                                                                 | M    | v0.1 |
| RF-04 | El usuario puede configurar horario laboral por día, zona horaria, umbral de bloque productivo, buffer entre reuniones y hora del resumen matutino.                                        | M    | v0.1 |

## B. Lectura y sincronización

| ID    | Requerimiento                                                                                                                                                                                              | Prio | Fase |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- |
| RF-05 | El sistema sincroniza eventos de los calendarios habilitados de forma incremental (sync tokens de Google) y completa con reintentos ante fallos.                                                           | M    | v0.1 |
| RF-06 | Los eventos se normalizan: fechas en UTC, estado, respuesta del usuario, número de asistentes, enlace de conferencia, transparencia (ocupado/libre), todo-el-día.                                          | M    | v0.1 |
| RF-07 | El sistema detecta el mismo evento presente en varios calendarios (por `iCalUID` o por título + hora normalizados) y lo cuenta **una sola vez** en las métricas.                                           | M    | v0.1 |
| RF-08 | El sistema puede leer calendarios por URL ICS (Outlook publicado, dirección secreta de Workspace) con refresco configurable (por defecto 15 min) y marca el dato como "ICS" con su hora de última lectura. | S    | v0.4 |

## C. Métricas

| ID    | Requerimiento                                                                                                                                                                                            | Prio | Fase |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- |
| RF-09 | **Regla de reunión** (configurable): evento no cancelado, no todo-el-día, no rechazado, marcado como "ocupado" y con (≥ 2 asistentes **o** enlace de conferencia **o** etiqueta/palabra clave definida). | M    | v0.1 |
| RF-10 | El sistema calcula horas de reunión por día, semana y mes, total y por categoría, sin doble conteo de eventos solapados ni duplicados.                                                                   | M    | v0.1 |
| RF-11 | El sistema calcula los bloques libres continuos dentro del horario laboral con duración ≥ umbral, descontando eventos ocupados y el buffer configurado.                                                  | M    | v0.1 |
| RF-12 | El sistema detecta conflictos (eventos ocupados que se solapan) y los reporta.                                                                                                                           | S    | v0.1 |

## D. Bot de Telegram

| ID    | Requerimiento                                                                                                                                                                               | Prio | Fase |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- |
| RF-13 | El bot solo responde al `chat_id` autorizado; cualquier otro recibe silencio y queda en el log.                                                                                             | M    | v0.1 |
| RF-14 | Comandos: `/hoy`, `/semana`, `/mes`, `/libre`, `/brief`, `/config`, `/ayuda`.                                                                                                               | M    | v0.1 |
| RF-15 | El bot acepta **notas de voz**, las transcribe en español y las procesa como texto.                                                                                                         | M    | v0.1 |
| RF-16 | **Registro de actividad ya ocurrida:** "acabo de tener el daily de 9 a 9:30" → el bot busca evento existente (RF-17); si existe, lo vincula/actualiza; si no, lo crea en "Registro".        | M    | v0.1 |
| RF-17 | **Detección de duplicados:** candidatos por solape de horario (±15 min o ≥ 50 % de solape) y similitud de título ≥ 0.6. Si es ambiguo, el bot pregunta con botones (Sí / No / Crear nuevo). | M    | v0.1 |
| RF-18 | Crear eventos futuros en "Registro" por voz o texto ("agéndame revisión con Ana mañana a las 3 pm por una hora").                                                                           | M    | v0.1 |
| RF-19 | Consultas en lenguaje natural ("¿cuántas horas de reunión tengo esta semana?", "¿cuándo tengo 2 horas libres mañana?").                                                                     | S    | v0.2 |
| RF-20 | Modificar o cancelar eventos de "Registro" **solo tras confirmación explícita**.                                                                                                            | S    | v0.2 |
| RF-21 | Recordatorios: "recuérdame 10 minutos antes del daily", "recuérdame mañana revisar el PR".                                                                                                  | S    | v0.2 |
| RF-22 | Toda acción de escritura devuelve un resumen verificable (qué se creó/cambió, dónde, y enlace al evento).                                                                                   | M    | v0.1 |

## E. Resúmenes y preparación

| ID    | Requerimiento                                                                                                                                                           | Prio | Fase                             |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | -------------------------------- |
| RF-23 | **Resumen matutino** a la hora configurada (días hábiles): reuniones del día, horas ocupadas, bloques libres, conflictos, primera reunión y datos obsoletos si los hay. | M    | v0.1                             |
| RF-24 | **Preparación por reunión:** título, hora, asistentes, enlace, extracto de la descripción y, cuando existan integraciones, tareas/PRs relacionados.                     | S    | v0.1 (básico) / F3 (enriquecido) |
| RF-25 | **Cierre del día:** resumen de lo ocurrido, horas reales, pendientes para mañana.                                                                                       | C    | v0.4                             |

## F. Web y móvil

| ID    | Requerimiento                                                                            | Prio | Fase |
| ----- | ---------------------------------------------------------------------------------------- | ---- | ---- |
| RF-26 | Vista web de calendario unificado (día, semana, mes) con color por categoría y filtros.  | S    | v0.3 |
| RF-27 | Panel de métricas (horas de reunión, bloques libres, tendencia semanal).                 | S    | v0.3 |
| RF-28 | La web es una **PWA** instalable en el móvil, con acceso autenticado de un solo usuario. | S    | v0.3 |

## G. MCP e integraciones

| ID    | Requerimiento                                                                                                                                                          | Prio | Fase |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ---- |
| RF-29 | Servidor **MCP** que expone: `list_events`, `get_metrics`, `find_free_blocks`, `find_similar_events`, `create_event`, `get_brief`. Las escrituras exigen confirmación. | S    | v0.4 |
| RF-30 | Señales de **Asana** (tareas con fecha de entrega y asignadas a mí).                                                                                                   | C    | F3   |
| RF-31 | Señales de **GitHub** (PRs pendientes de mi revisión, issues asignados).                                                                                               | C    | F3   |
| RF-32 | Señales de **Slack** (huddles, estado, mensajes marcados).                                                                                                             | C    | F3   |
| RF-33 | Señales de **Jenkins** (builds fallidos de mis jobs).                                                                                                                  | W    | F3   |
| RF-34 | Escritura en Microsoft 365 vía Graph si el administrador permite el consentimiento.                                                                                    | W    | F3   |

## H. Transversales

| ID    | Requerimiento                                                                        | Prio | Fase |
| ----- | ------------------------------------------------------------------------------------ | ---- | ---- |
| RF-35 | Registro de auditoría de toda acción del asistente (quién, qué, cuándo, resultado).  | M    | v0.1 |
| RF-36 | Control de consumo de LLM/transcripción con tope mensual y aviso al 80 %.            | S    | v0.1 |
| RF-37 | Respaldo automático de la base de datos y procedimiento de restauración documentado. | S    | v0.1 |

## Reglas de negocio clave

- **RN-1:** El asistente **nunca escribe** fuera del calendario "Registro".
- **RN-2:** Un evento duplicado en varias fuentes cuenta una sola vez en las métricas.
- **RN-3:** Los eventos solapados no suman horas dobles: se mide **tiempo ocupado real** (unión de intervalos).
- **RN-4:** Si la fuente de datos tiene más de N minutos de antigüedad (ICS), el resumen lo advierte.
- **RN-5:** Ante ambigüedad, el asistente **pregunta**; no adivina.
- **RN-6:** Acciones destructivas (modificar/eliminar) requieren confirmación.
