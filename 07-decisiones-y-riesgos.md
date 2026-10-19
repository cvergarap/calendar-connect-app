# 07 · Decisiones, riesgos y preguntas abiertas

## 1. Registro de decisiones de arquitectura (ADR)

| ID      | Decisión                                                                                                                                                                                      | Estado        | Fecha      | Motivo                                                                                                                      | Consecuencias                                                                        |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| ADR-001 | **Google personal como hub** de lectura                                                                                                                                                       | Aceptada      | 2026-10-16 | Ya recibe los demás calendarios por compartición; una sola autorización OAuth; sin permisos de administrador                | Dependencia de la latencia de las suscripciones; ICS directo como mejora (HU-08)     |
| ADR-002 | El asistente **solo escribe en el calendario "Registro"**                                                                                                                                     | Aceptada      | 2026-10-16 | Evita bucles y duplicados con la sincronización bidireccional; mínimo privilegio con `calendar.app.created`                 | Los eventos de trabajo no se editan desde el asistente                               |
| ADR-003 | **Telegram** con long polling como canal principal                                                                                                                                            | Aceptada      | 2026-10-16 | Gratis, sin aprobación de Meta, soporta voz, sin URL pública                                                                | WhatsApp queda fuera de alcance                                                      |
| ADR-004 | **TypeScript/Node + PostgreSQL + Docker Compose**, monorepo pnpm                                                                                                                              | Aceptada      | 2026-10-16 | Un lenguaje, despliegue reproducible, tipado estricto                                                                       | Python solo para scripts puntuales                                                   |
| ADR-005 | **Métricas deterministas**; el LLM solo interpreta y redacta                                                                                                                                  | Aceptada      | 2026-10-16 | Exactitud, menor costo y auditabilidad                                                                                      | Requiere buena capa de herramientas                                                  |
| ADR-006 | **Planificador interno** (`node-cron`) en el MVP; n8n en fase 3                                                                                                                               | Aceptada      | 2026-10-16 | Menos piezas móviles (KISS)                                                                                                 | n8n se incorpora cuando haya integraciones externas                                  |
| ADR-007 | **MCP como interfaz** sobre el mismo núcleo (v0.4)                                                                                                                                            | Aceptada      | 2026-10-16 | Reutiliza reglas y confirmaciones; cualquier agente puede operar la agenda                                                  | Mantener paridad de herramientas con el bot                                          |
| ADR-008 | Confirmación obligatoria para modificar/eliminar y ante ambigüedad                                                                                                                            | Aceptada      | 2026-10-16 | Seguridad frente a errores del LLM e inyección de instrucciones                                                             | Un paso extra en el flujo                                                            |
| ADR-009 | Proveedor LLM y STT **intercambiables** por configuración                                                                                                                                     | Aceptada      | 2026-10-16 | Evita ataduras y permite bajar costos o ganar privacidad                                                                    | Interfaces `LlmProvider` y `SpeechToText`                                            |
| ADR-012 | **ClickUp** para gestionar el proyecto; backlog cargado por CSV y operado después por su MCP oficial (OAuth). Si en fase 3 el asistente consume ClickUp, usará la API REST con token personal | Aceptada      | 2026-10-16 | El plan gratuito del MCP permite pocas llamadas diarias; la API REST permite 100/min y evita implementar OAuth 2.1 con PKCE | La jerarquía épica → historia se resuelve con etiquetas y campos                     |
| ADR-013 | El backlog en ClickUp usa la **estructura nativa** (versión = carpeta, sprint = lista), **MoSCoW = prioridad**, **una etiqueta por tarea** (épica) y **sin campos personalizados**            | Aceptada      | 2026-10-16 | El plan Free limita a 60 usos de campos personalizados; las etiquetas múltiples sobrecargaban la vista                      | Sin sumas automáticas de puntos (opcional: ClickApp Sprint Points, 100 usos en Free) |
| ADR-010 | Proveedor LLM concreto                                                                                                                                                                        | **Pendiente** | —          | Ver Q-02                                                                                                                    | —                                                                                    |
| ADR-011 | Transcripción: API vs. local                                                                                                                                                                  | **Pendiente** | —          | Ver Q-03                                                                                                                    | —                                                                                    |

Plantilla para nuevas decisiones:

```
ADR-XXX · Título
Estado: Propuesta | Aceptada | Reemplazada
Contexto:
Decisión:
Alternativas consideradas:
Consecuencias:
```

## 2. Registro de riesgos

Escala: Probabilidad (P) y Impacto (I) de 1 a 3; Exposición = P × I.

| ID   | Riesgo                                                                             | P   | I   | Exp. | Mitigación                                                                                                       | Plan B                                             |
| ---- | ---------------------------------------------------------------------------------- | --- | --- | ---- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| R-01 | Veritran bloquea el consentimiento OAuth o la publicación ICS de Outlook           | 2   | 2   | 4    | Usar la sincronización ya existente hacia Google; no depender de Graph                                           | Leer desde la suscripción de Google (con retraso)  |
| R-02 | El refresh token caduca a los 7 días si la app queda en modo _Testing_             | 3   | 2   | 6    | Publicar a "In production" (PRE-03)                                                                              | Reautorizar y alertar por Telegram                 |
| R-03 | Retraso de sincronización (suscripciones ICS) hace que el resumen use datos viejos | 3   | 2   | 6    | Marcar frescura de datos; ICS directo (HU-08); medir el retraso real (PRE-05)                                    | Advertencia en el resumen                          |
| R-04 | Inyección de instrucciones por contenido de eventos                                | 2   | 3   | 6    | RNF-05, RNF-06; confirmaciones; escritura limitada                                                               | Desactivar herramientas de escritura temporalmente |
| R-05 | Costos de IA se disparan                                                           | 2   | 2   | 4    | Tope mensual, caché, cálculo determinista (RNF-35, RNF-37)                                                       | Corte suave a comandos deterministas               |
| R-06 | El host no está encendido a la hora del resumen                                    | 2   | 2   | 4    | VPS pequeño o PC con reinicio automático; alerta de inactividad                                                  | Ejecutar `/brief` manualmente                      |
| R-07 | Interpretación errónea de fechas y horas en español                                | 2   | 3   | 6    | Mostrar transcripción e interpretación antes de escribir; confirmar si confianza baja; pruebas con frases reales | Pedir formato explícito ("de 9:00 a 9:30")         |
| R-08 | Duplicados por bucle de sincronización bidireccional                               | 2   | 2   | 4    | ADR-002; `canonical_key`; marcar eventos propios                                                                 | Limpieza guiada desde el bot                       |
| R-09 | Fuga de secretos (tokens, claves)                                                  | 1   | 3   | 3    | `.gitignore`, escaneo en CI, gestor de contraseñas, rotación                                                     | Revocar y rotar (ver `05 §4`)                      |
| R-10 | Cambios en la API de Google o Telegram                                             | 1   | 2   | 2    | Pruebas de contrato; versiones fijadas                                                                           | Actualización prioritaria                          |
| R-11 | Alcance excesivo (integraciones de F3 antes de tiempo)                             | 2   | 2   | 4    | Priorización MoSCoW y hitos; fase 3 fuera del MVP                                                                | Recorte de historias                               |
| R-12 | Política de datos impide enviar títulos al LLM                                     | 2   | 2   | 4    | `HIDE_TITLES_CATEGORIES`; modelo local en el futuro                                                              | Etiquetas genéricas                                |

## 3. Preguntas abiertas

| ID   | Pregunta                                                                                                                                 | Responsable      | Necesaria antes de | Estado  |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------ | ------- |
| Q-01 | ¿La política de Veritran (y de la universidad) permite enviar datos de calendario a un LLM externo?                                      | Cris             | Sprint 3           | Abierta |
| Q-02 | ¿Qué proveedor y modelo LLM se usará? (criterios: tool calling, español, costo)                                                          | Cris + asistente | Sprint 0           | Abierta |
| Q-03 | ¿Transcripción por API o `faster-whisper` local?                                                                                         | Cris             | Sprint 3           | Abierta |
| Q-04 | ¿Cuál es el presupuesto mensual de IA?                                                                                                   | Cris             | Sprint 2           | Abierta |
| Q-05 | ¿Cómo está hecha hoy la sincronización Microsoft → Google (enlace ICS u otro mecanismo)?                                                 | Cris             | Sprint 1           | Abierta |
| Q-06 | ¿Cuánto tarda hoy un cambio de Outlook en verse en Google? (PRE-05)                                                                      | Cris             | Sprint 1           | Abierta |
| Q-07 | ¿Dónde correrá el sistema (PC propio o VPS)? ¿Está encendido en horario laboral?                                                         | Cris             | Sprint 0           | Abierta |
| Q-08 | ¿Qué cuenta/calendario usa para estudio: Workspace de la universidad compartido a Google personal? ¿Hay restricciones de la universidad? | Cris             | Sprint 1           | Abierta |
| Q-09 | ¿Qué cuenta o calendario se tomará como "personal"?                                                                                      | Cris             | Sprint 1           | Abierta |
| Q-10 | ¿El resumen matutino debe incluir fines de semana o festivos?                                                                            | Cris             | Sprint 4           | Abierta |
| Q-11 | ¿Se desea compartir "Registro" hacia Microsoft para que aparezca en Outlook?                                                             | Cris             | Sprint 3           | Abierta |

## 4. Procedimientos operativos

### Rotación o filtración de secretos

1. Revocar: token del bot (`/revoke` en BotFather), credencial de Google (eliminar y crear otra), clave del LLM (regenerar).
2. Actualizar `.env` y reiniciar los contenedores.
3. Revisar `audit_log` de las últimas 72 h por acciones no reconocidas.
4. Registrar el incidente (fecha, causa, acciones) al final de este documento.

### Pérdida de la clave de cifrado

1. Generar nueva `APP_ENCRYPTION_KEY`.
2. Borrar credenciales cifradas y reautorizar Google (`/auth/google`).
3. Volver a registrar URLs ICS.

### Restauración de respaldo

1. Detener `api` y `bot`.
2. Restaurar el último archivo de `./backups` en PostgreSQL.
3. Iniciar los servicios y verificar `/health` y `/hoy`.

## 5. Bitácora de incidentes y cambios

| Fecha      | Tipo   | Descripción                      | Acción                |
| ---------- | ------ | -------------------------------- | --------------------- |
| 2026-10-16 | Inicio | Documentos de ingeniería creados | Pendiente de Sprint 0 |
