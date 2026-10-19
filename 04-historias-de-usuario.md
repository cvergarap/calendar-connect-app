# 04 · Historias de usuario

Formato: **Como** [rol] **quiero** [acción] **para** [beneficio]. Criterios de aceptación en estilo _Dado / Cuando / Entonces_.
Estimación en **puntos de historia** (escala Fibonacci). Prioridad MoSCoW. El rol es siempre **Cris (usuario único)**, salvo indicación.

## Mapa de épicas

| Épica | Nombre                  | Historias                         | Puntos |
| ----- | ----------------------- | --------------------------------- | ------ |
| E0    | Fundaciones             | HU-01, HU-02, HU-03               | 9      |
| E1    | Conexión de calendarios | HU-04, HU-05, HU-06, HU-07, HU-08 | 23     |
| E2    | Métricas de tiempo      | HU-09, HU-10, HU-11               | 13     |
| E3    | Bot de Telegram         | HU-12, HU-13, HU-14               | 16     |
| E4    | Voz y registro          | HU-15, HU-16, HU-17, HU-18, HU-19 | 28     |
| E5    | Resúmenes y preparación | HU-20, HU-21, HU-22               | 16     |
| E6    | Web y móvil             | HU-23, HU-24, HU-25               | 18     |
| E7    | MCP                     | HU-26                             | 5      |
| E8    | Integraciones (fase 3)  | HU-27 a HU-31                     | 29     |
| E9    | Transversales           | HU-32, HU-33, HU-34               | 9      |

---

## E0 · Fundaciones

### HU-01 · Repositorio base con estándares de calidad — 3 pts · Must

Como desarrollador quiero un monorepo con TypeScript estricto, lint, formato y pruebas para trabajar con calidad desde el primer commit.

- **Dado** un clon limpio, **cuando** ejecuto `pnpm install && pnpm lint && pnpm test`, **entonces** todo pasa en verde.
- **Dado** un commit con formato inválido, **cuando** se ejecuta el hook, **entonces** se rechaza (Conventional Commits).
- Estructura según `06-arquitectura.md §7`. Trazabilidad: RNF-25..30.

### HU-02 · Entorno local con Docker Compose — 3 pts · Must

Como desarrollador quiero levantar API, bot y base de datos con un solo comando para tener un entorno reproducible.

- **Dado** un `.env` completo, **cuando** ejecuto `docker compose up`, **entonces** `api`, `bot` y `db` quedan saludables (`/health` = OK).
- Las migraciones se aplican automáticamente al iniciar. Trazabilidad: RNF-38, RNF-19.

### HU-03 · Pipeline CI/CD — 3 pts · Must

Como desarrollador quiero que cada PR ejecute lint, pruebas, escaneo de secretos y build para no romper la rama principal.

- **Dado** un PR, **cuando** falla lint, test o escaneo de secretos, **entonces** el merge se bloquea.
- Al fusionar a `main` se construye y publica la imagen Docker. Trazabilidad: RNF-02, RNF-08.

## E1 · Conexión de calendarios

### HU-04 · Conectar mi cuenta de Google — 5 pts · Must

Como usuario quiero autorizar mi cuenta Google personal una sola vez para que el asistente lea mis calendarios.

- **Dado** que no hay cuenta conectada, **cuando** abro `/auth/google`, **entonces** veo la pantalla de consentimiento con solo los scopes `calendar.readonly` y `calendar.app.created`.
- **Cuando** apruebo, **entonces** el refresh token se guarda **cifrado** y el bot confirma "Google conectado".
- **Dado** que el token expira, **cuando** el sistema lo necesita, **entonces** lo renueva sin intervención.
- Si revoco el acceso, el sistema avisa por Telegram. Trazabilidad: RF-01, RNF-01, RNF-03.

### HU-05 · Elegir y categorizar mis calendarios — 3 pts · Must

Como usuario quiero ver mis calendarios y marcar cuáles usar y de qué categoría son para separar trabajo, estudio y personal.

- **Dado** la cuenta conectada, **cuando** consulto `/config calendarios`, **entonces** veo todos los calendarios con su nombre y color.
- **Cuando** asigno categoría y activo/desactivo, **entonces** el cambio se persiste y se usa en las métricas.
- Los calendarios nuevos aparecen como "sin categoría" hasta que los clasifique. Trazabilidad: RF-02.

### HU-06 · Calendario "Registro" propio — 2 pts · Must

Como usuario quiero que el asistente cree su propio calendario para que nunca toque mis calendarios de trabajo.

- **Dado** que no existe "Registro", **cuando** termina la conexión, **entonces** se crea y queda como único destino de escritura.
- **Dado** un intento de escribir en otro calendario, **entonces** el sistema lo rechaza (y los scopes tampoco lo permitirían). Trazabilidad: RF-03, RN-1.

### HU-07 · Sincronización incremental de eventos — 8 pts · Must

Como usuario quiero que mis eventos se mantengan actualizados para confiar en las cifras.

- **Dado** calendarios habilitados, **cuando** pasan 5 minutos, **entonces** se sincronizan solo los cambios (sync token).
- **Dado** el mismo evento en dos calendarios (mismo `iCalUID` o título+hora), **entonces** se almacena una vez como evento canónico y se cuenta una sola vez.
- **Dado** un evento cancelado o movido en origen, **entonces** se refleja en la siguiente sincronización.
- **Dado** un error de API, **entonces** reintenta con _backoff_ y avisa tras 3 fallos seguidos. Trazabilidad: RF-05, RF-06, RF-07, RNF-16, RNF-24.

### HU-08 · Lectura directa de ICS (Outlook/Workspace) — 5 pts · Should

Como usuario quiero leer mis calendarios por enlace ICS para ver datos más frescos que los de la suscripción de Google.

- **Dado** una URL ICS, **cuando** la registro, **entonces** se guarda cifrada y se lee cada 15 min.
- Los eventos ICS se marcan con su hora de última lectura; si es obsoleta (> 60 min) el resumen lo advierte.
- Si la URL falla, el sistema cae al calendario equivalente de Google. Trazabilidad: RF-08, RN-4.

## E2 · Métricas de tiempo

### HU-09 · Horas de reunión por día, semana y mes — 5 pts · Must

Como usuario quiero saber cuántas horas de reunión tengo para dimensionar mi carga.

- **Dado** eventos del día, **cuando** pido `/hoy`, **entonces** veo horas de reunión totales y por categoría.
- Eventos todo-el-día, cancelados, rechazados o marcados "libre" **no** cuentan.
- Dos reuniones solapadas cuentan el tiempo **ocupado real** (unión), no la suma.
- **Dado** un caso con resultado calculado a mano, **entonces** el sistema coincide al 100 %. Trazabilidad: RF-09, RF-10, RF-12, RN-2, RN-3.

### HU-10 · Bloques de productividad continua — 5 pts · Must

Como usuario quiero ver cuántas horas continuas libres tengo para proteger trabajo profundo.

- **Dado** mi horario laboral y eventos ocupados, **cuando** pido `/libre`, **entonces** veo los bloques ≥ 90 min (configurable), con inicio, fin y duración.
- Se descuenta el buffer entre reuniones (por defecto 10 min).
- Si no hay ningún bloque, el bot lo dice y sugiere el mayor hueco disponible. Trazabilidad: RF-11.

### HU-11 · Configurar horario y reglas — 3 pts · Must

Como usuario quiero ajustar mi horario laboral, zona horaria y reglas de reunión para que las métricas reflejen mi realidad.

- **Cuando** cambio un parámetro por `/config`, **entonces** se valida, se guarda y se aplica en el siguiente cálculo.
- Valores por defecto: L–V 08:00–18:00, America/Bogota, bloque mínimo 90 min, buffer 10 min, brief 07:00. Trazabilidad: RF-04, RF-09.

## E3 · Bot de Telegram

### HU-12 · Bot autorizado solo para mí — 3 pts · Must

Como usuario quiero que el bot solo me responda a mí para proteger mi agenda.

- **Dado** un mensaje de otro `chat_id`, **entonces** no hay respuesta y se registra el intento.
- **Dado** mi `chat_id`, **cuando** envío `/start`, **entonces** recibo bienvenida y el estado de conexiones. Trazabilidad: RF-13, RNF-04.

### HU-13 · Comandos de consulta — 5 pts · Must

Como usuario quiero comandos rápidos para ver mi agenda sin escribir frases.

- `/hoy`, `/semana`, `/mes`, `/libre`, `/brief`, `/ayuda` responden en menos de 2 s con datos en caché (p95).
- El formato es compacto: hora, título, categoría, duración y total. Trazabilidad: RF-14, RNF-13.

### HU-14 · Preguntas en lenguaje natural — 8 pts · Should

Como usuario quiero preguntar con mis palabras para no recordar comandos.

- "¿Cuántas horas de reunión tengo esta semana?" → respuesta con el número exacto calculado por código.
- "¿Cuándo tengo dos horas libres mañana?" → lista de bloques.
- Si la pregunta es ambigua, el bot pide aclaración con una sola pregunta. Trazabilidad: RF-19, RNF-14, RNF-37.

## E4 · Voz y registro

### HU-15 · Notas de voz a texto — 5 pts · Must

Como usuario quiero enviar una nota de voz para registrar cosas sin teclear.

- **Dado** una nota de voz en español, **cuando** la envío, **entonces** el bot muestra la transcripción antes de actuar.
- El audio se elimina tras la transcripción. Tiempo total p95 < 10 s.
- Si la transcripción tiene baja confianza, el bot pide repetir. Trazabilidad: RF-15, RNF-10, RNF-15.

### HU-16 · Registrar una actividad que ya ocurrió — 8 pts · Must

Como usuario quiero decir "acabo de tener el daily de 9 a 9:30" y que el sistema verifique si ya está agendado, y si no, lo cree.

- **Dado** un evento existente con horario y título similares, **entonces** el bot pregunta si es ese y, al confirmar, lo vincula sin crear duplicado.
- **Dado** que no existe, **entonces** crea el evento en "Registro" con el rango indicado y responde con enlace.
- **Dado** un rango que solapa con otro evento de distinto título, **entonces** avisa del conflicto y pregunta.
- Expresiones relativas ("hace 20 minutos", "de 3 a 4 de la tarde") se interpretan en America/Bogota.
- Reenviar el mismo mensaje no duplica (idempotencia). Trazabilidad: RF-16, RF-17, RF-22, RNF-21, RNF-32.

### HU-17 · Crear eventos futuros — 5 pts · Must

Como usuario quiero decir "agéndame X mañana a las 3" para planificar sin abrir el calendario.

- Si faltan datos (duración, hora), el bot pregunta lo mínimo.
- Antes de crear, verifica conflictos y los informa.
- Responde con resumen verificable (qué, cuándo, dónde, enlace). Trazabilidad: RF-18, RF-22.

### HU-18 · Modificar o cancelar con confirmación — 5 pts · Should

Como usuario quiero corregir un registro erróneo sin riesgo de borrar lo que no debo.

- Solo se pueden modificar/eliminar eventos de "Registro".
- Toda modificación/eliminación muestra el cambio y requiere botón **Confirmar**; expira en 5 min.
- Intentar modificar eventos de otros calendarios devuelve un mensaje explicativo. Trazabilidad: RF-20, RN-6, RNF-06.

### HU-19 · Recordatorios — 5 pts · Should

Como usuario quiero que me recuerde cosas para no olvidar compromisos.

- "Recuérdame 10 minutos antes del daily" → se programa y llega por Telegram en el momento exacto (±1 min).
- Los recordatorios sobreviven a reinicios del sistema. Trazabilidad: RF-21.

## E5 · Resúmenes y preparación

### HU-20 · Resumen matutino — 8 pts · Must

Como usuario quiero recibir cada mañana el panorama de mi día para organizarme.

- A la hora configurada (L–V), el bot envía: reuniones con hora, horas ocupadas, bloques libres, conflictos y primera reunión.
- Si hay datos desactualizados (ICS), lo indica.
- Si no hay reuniones, lo dice y resalta los bloques de foco. Trazabilidad: RF-23, RNF-37.

### HU-21 · Preparación por reunión — 5 pts · Should

Como usuario quiero saber qué necesito para cada reunión para llegar preparado.

- Por reunión: título, hora, asistentes, enlace, extracto de la descripción.
- Con integraciones activas se añaden tareas de Asana y PRs de GitHub relacionados por palabra clave o proyecto. Trazabilidad: RF-24.

### HU-22 · Cierre del día — 3 pts · Could

Como usuario quiero un resumen al final del día para cerrar y planear mañana.

- Muestra horas reales de reunión, eventos registrados y pendientes de mañana. Trazabilidad: RF-25.

## E6 · Web y móvil

### HU-23 · Vista web unificada — 8 pts · Should

Como usuario quiero ver mi calendario consolidado en el navegador.

- Vistas día, semana y mes con color por categoría y filtros por calendario.
- Carga de la semana < 2 s. Cumple WCAG AA. Trazabilidad: RF-26, RNF-17, RNF-33.

### HU-24 · Panel de métricas — 5 pts · Should

Como usuario quiero ver gráficos de horas de reunión y bloques libres para detectar patrones.

- Horas por día/semana, por categoría, y tendencia de 4 semanas. Trazabilidad: RF-27.

### HU-25 · PWA y acceso móvil seguro — 5 pts · Should

Como usuario quiero instalar la web en mi teléfono para consultarla en cualquier lugar.

- Instalable, funciona en móvil, requiere autenticación.
- Se accede por red privada (Tailscale) o túnel con control de acceso. Trazabilidad: RF-28, RNF-07, RNF-34.

## E7 · MCP

### HU-26 · Servidor MCP del calendario — 5 pts · Should

Como usuario quiero que mis agentes de IA consulten y operen mi agenda con las mismas reglas del bot.

- Herramientas: `list_events`, `get_metrics`, `find_free_blocks`, `find_similar_events`, `create_event`, `get_brief`.
- `create_event` exige confirmación y solo escribe en "Registro".
- Autenticación por token; se prueba desde Claude y desde un cliente MCP genérico. Trazabilidad: RF-29.

## E8 · Integraciones (fase 3)

| HU    | Historia                                                     | Pts | Prio          | RF    |
| ----- | ------------------------------------------------------------ | --- | ------------- | ----- |
| HU-27 | Ver mis tareas de Asana con fecha como señales en el resumen | 8   | Could         | RF-30 |
| HU-28 | Ver PRs pendientes de revisión e issues asignados de GitHub  | 5   | Could         | RF-31 |
| HU-29 | Considerar huddles y estado de Slack en mi agenda            | 5   | Could         | RF-32 |
| HU-30 | Avisar de builds fallidos de Jenkins en mis jobs             | 3   | Won't (ahora) | RF-33 |
| HU-31 | Crear eventos directamente en Microsoft 365 vía Graph        | 8   | Won't (ahora) | RF-34 |

Criterio común: cada integración es un **adaptador** que implementa la interfaz `SignalSource`, se activa por configuración y nunca bloquea el resumen si falla.

## E9 · Transversales

### HU-32 · Auditoría y observabilidad — 3 pts · Must

Como usuario quiero saber qué hizo el asistente y si está sano.

- Toda escritura queda en `audit_log` con actor, acción, payload y resultado.
- `/health` y `/metrics` disponibles; alerta por Telegram tras 3 fallos de sincronización. Trazabilidad: RF-35, RNF-23.

### HU-33 · Respaldo y restauración — 3 pts · Should

Como usuario quiero respaldos automáticos para no perder configuración ni historial.

- Respaldo diario con retención de 14 días y guía de restauración probada una vez. Trazabilidad: RF-37, RNF-22.

### HU-34 · Control de costos de IA — 3 pts · Should

Como usuario quiero un tope de gasto para evitar sorpresas.

- Se registra el consumo por llamada; aviso al 80 % y corte suave al 100 % (solo comandos deterministas). Trazabilidad: RF-36, RNF-35.

---

## Matriz de trazabilidad HU → RF

| RF                  | HU    | RF        | HU           |
| ------------------- | ----- | --------- | ------------ |
| RF-01               | HU-04 | RF-20     | HU-18        |
| RF-02               | HU-05 | RF-21     | HU-19        |
| RF-03               | HU-06 | RF-22     | HU-16, HU-17 |
| RF-04               | HU-11 | RF-23     | HU-20        |
| RF-05..07           | HU-07 | RF-24     | HU-21        |
| RF-08               | HU-08 | RF-25     | HU-22        |
| RF-09, RF-10, RF-12 | HU-09 | RF-26     | HU-23        |
| RF-11               | HU-10 | RF-27     | HU-24        |
| RF-13               | HU-12 | RF-28     | HU-25        |
| RF-14               | HU-13 | RF-29     | HU-26        |
| RF-15               | HU-15 | RF-30..34 | HU-27..31    |
| RF-16, RF-17        | HU-16 | RF-35     | HU-32        |
| RF-18               | HU-17 | RF-36     | HU-34        |
| RF-19               | HU-14 | RF-37     | HU-33        |

## Definición de Listo (DoR) y Hecho (DoD)

**DoR:** historia con criterios de aceptación claros, dependencias identificadas, prerrequisitos de `05` cumplidos, estimada ≤ 8 pts.

**DoD:** criterios cumplidos · pruebas unitarias y de integración en verde · lint/CI en verde · sin secretos en el código · documentación actualizada · probada manualmente en Telegram/web según corresponda · entrada en `audit_log` verificada si escribe datos.
