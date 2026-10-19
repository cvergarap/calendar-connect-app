# Calendar Connect App (CCA)

Asistente personal de agenda: unifica tus calendarios (Google personal, Google Workspace de la universidad y Microsoft/Outlook del trabajo), calcula tus horas de reunión y tus bloques de productividad, y te deja registrar y consultar tu día por **voz o texto desde Telegram**.

> **Estado:** fase de ingeniería (pre-desarrollo). Esta carpeta contiene hoy la documentación de alcance, el backlog y la plantilla de configuración. **Todavía no hay código de la aplicación.** El código empieza en el Sprint 0 (ver [Plan de trabajo](01-plan-de-trabajo.md)).
>
> Fecha de creación: 2026-10-16 · Responsable: Cris (cvergara@veritran.com)

## Qué hay en esta carpeta

```
calendar-connect-app/
├─ 00 … 08 *.md                     Documentación del proyecto (ver índice abajo)
├─ clickup-import-backlog.csv       Backlog listo para importar a ClickUp
├─ clickup-import-prueba.csv        3 filas para probar la importación
├─ scripts/generar_csv_clickup.py   Regenera los CSV desde 04-historias-de-usuario.md
├─ .env.example                     Plantilla de variables de entorno (sin secretos)
└─ .gitignore                       Excluye .env, claves, backups y dependencias
```

## Índice de documentos

| #   | Documento                                                            | Para qué sirve                                                                     |
| --- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 00  | [Visión y alcance](00-vision-y-alcance.md)                           | Problema, objetivos, alcance MVP vs. fases, glosario                               |
| 01  | [Plan de trabajo](01-plan-de-trabajo.md)                             | Sprints, hitos, fechas, capacidad, definición de Listo/Hecho                       |
| 02  | [Requerimientos funcionales](02-requerimientos-funcionales.md)       | Qué hace el sistema (RF-xx, priorizado MoSCoW)                                     |
| 03  | [Requerimientos no funcionales](03-requerimientos-no-funcionales.md) | Seguridad, rendimiento, costos, calidad (RNF-xx)                                   |
| 04  | [Historias de usuario](04-historias-de-usuario.md)                   | Backlog con criterios de aceptación (HU-xx) y trazabilidad                         |
| 05  | [Requerimientos pre-desarrollo](05-requerimientos-pre-desarrollo.md) | Claves, cuentas, conexiones y accesos que se necesitan antes de programar (PRE-xx) |
| 06  | [Arquitectura](06-arquitectura.md)                                   | Componentes, modelo de datos, algoritmos, estructura del repo                      |
| 07  | [Decisiones y riesgos](07-decisiones-y-riesgos.md)                   | ADRs, riesgos, preguntas abiertas                                                  |
| 08  | [Gestión en ClickUp](08-gestion-clickup.md)                          | Cargar el backlog (CSV) y conectar el MCP de ClickUp                               |
| —   | [clickup-import-backlog.csv](clickup-import-backlog.csv)             | 34 historias (166 puntos) listas para importar a ClickUp                           |
| —   | [clickup-import-prueba.csv](clickup-import-prueba.csv)               | 3 historias para una importación de prueba                                         |
| —   | [generar_csv_clickup.py](scripts/generar_csv_clickup.py)             | Regenera ambos CSV si cambia el backlog                                            |
| —   | [.env.example](.env.example)                                         | Plantilla de variables de entorno (sin secretos)                                   |

## Resumen en 30 segundos

- **Centro del sistema:** tu Google personal (gratuito). Ya recibe, vía calendarios compartidos, los eventos de Microsoft y de la universidad; con **una sola autorización OAuth** el asistente los lee todos.
- **Escritura segura:** el asistente solo escribe en un calendario propio llamado **"Registro"**. Nunca modifica tus calendarios de trabajo o estudio.
- **Interfaz principal:** bot de **Telegram** (texto y notas de voz), con _long polling_ (no requiere dominio ni URL pública).
- **Cálculos exactos:** horas de reunión y bloques libres los calcula código determinista; el LLM solo interpreta lo que dices y redacta resúmenes.
- **Stack previsto:** TypeScript + Node, PostgreSQL, Docker Compose. MCP y n8n como extensiones.

## Primeros pasos

### 1. Leer la documentación

1. Lee `00` y `07` para alinear alcance y decisiones.
2. Revisa el plan en `01` y el backlog en `04`.

### 2. Completar los prerrequisitos (Sprint 0)

Sin los accesos de `05` no se puede iniciar el Sprint 1. Los pasos clave:

- Crear el proyecto de Google Cloud, la credencial OAuth y el bot de Telegram (PRE-01 a PRE-07).
- Elegir proveedor de LLM y de transcripción de voz (PRE-08, PRE-09).
- Generar las claves locales (PRE-13) con `openssl rand -base64 32` / `openssl rand -hex 32`.
- Confirmar la política de datos antes de enviar títulos de trabajo a un LLM (PRE-15).

Criterio de salida del Sprint 0 (H0): **2026-10-23**.

### 3. Preparar la configuración local

```bash
cp .env.example .env     # en Windows: copy .env.example .env
```

Completa `.env` con tus valores. **Nunca** subas `.env` al repositorio ni compartas sus valores: el `.gitignore` ya lo excluye.

### 4. Cargar el backlog en ClickUp (opcional)

Sigue [08-gestion-clickup.md](08-gestion-clickup.md). En resumen: importa `clickup-import-backlog.csv` (o `clickup-import-prueba.csv` para probar primero) y conecta el MCP de ClickUp si quieres que Claude opere el tablero.

### 5. Regenerar los CSV (si cambió el backlog)

Desde la carpeta `calendar-connect-app`:

```bash
python scripts/generar_csv_clickup.py     # Windows
python3 scripts/generar_csv_clickup.py    # macOS / Linux
```

El script lee `04-historias-de-usuario.md`. Si cambias las fechas o los sprints en `01`, actualiza también el diccionario `SPRINTS` del script. No requiere librerías externas (solo Python 3).

## Desarrollo

Requisitos: Node 20+ (ver `.nvmrc`), pnpm 12 y Docker para la base de datos local.

```bash
pnpm install          # dependencias y hooks de git (husky)
pnpm lint             # ESLint estricto
pnpm typecheck        # TypeScript estricto
pnpm test             # pruebas unitarias del núcleo (Vitest)
pnpm format           # Prettier
docker compose up -d  # PostgreSQL local (requiere .env)
```

Estructura de código: `packages/core` contiene el dominio puro (métricas de reunión, bloques libres, tiempo). Las reglas de dependencia y el resto de la arquitectura están en `06-arquitectura.md` y `CLAUDE.md`.

## Cómo trabajar con esta carpeta

1. Cada cambio de alcance se registra como ADR en `07` y, si afecta fechas, en `01`.
2. Las historias de `04` siguen el orden de los sprints de `01`.
3. Antes de cambiar un requerimiento, revisa sus trazas en `04` (HU → RF/RNF) para no romper la cobertura.

## Convenciones de identificadores

`RF-xx` requerimiento funcional · `RNF-xx` requerimiento no funcional · `HU-xx` historia de usuario · `PRE-xx` prerrequisito · `ADR-xx` decisión de arquitectura · `R-xx` riesgo · `Q-xx` pregunta abierta.
