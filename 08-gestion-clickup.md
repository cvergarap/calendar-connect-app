# 08 · Gestión del proyecto en ClickUp

ClickUp es la herramienta de **gestión** del proyecto (backlog, sprints, seguimiento). No forma parte de la arquitectura del asistente. Este documento explica (A) cómo cargar el backlog y (B) cómo conectar el MCP de ClickUp a Claude para operarlo después.

## Archivos de apoyo

| Archivo                          | Uso                                                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `clickup-import-backlog.csv`     | 34 historias de usuario (166 puntos), listas para importar; incluye columnas `Folder` y `List` opcionales |
| `clickup-import-prueba.csv`      | 3 filas para la importación de prueba                                                                     |
| `scripts/generar_csv_clickup.py` | Regenera los CSV desde `04-historias-de-usuario.md` si el backlog cambia                                  |

Para regenerar: `python3 scripts/generar_csv_clickup.py` (desde la carpeta del proyecto). Si cambias el plan de sprints en `01`, actualiza el diccionario `SPRINTS` del script.

---

# Parte A · Cargar el backlog

## Diseño: la estructura de ClickUp hace el trabajo, no las etiquetas

El plan gratuito permite solo **60 usos de campos personalizados** en total (cada valor escrito en una tarea cuenta, también en la Lista desplegable), así que este backlog **no usa campos personalizados**. Para mantener la vista limpia, cada dato va al lugar nativo que mejor se lee:

| Dato                  | Dónde vive en ClickUp                                                                 |
| --------------------- | ------------------------------------------------------------------------------------- |
| Versión (v0.1, v0.2…) | **Carpeta**                                                                           |
| Sprint (S0…S7)        | **Lista** dentro de la carpeta                                                        |
| MoSCoW                | **Prioridad** nativa (Must = High, Should = Normal, Could/Won't = Low)                |
| Épica                 | **Una sola etiqueta** por tarea (`E1 Calendarios`, `E4 Voz`…), con un color por épica |
| Fin del sprint        | **Fecha límite**                                                                      |
| Puntos, MoSCoW, épica | Primera línea de la **descripción**                                                   |

Resultado: cada tarea muestra nombre, una etiqueta, prioridad y fecha, y nada más.

## A1. Antes de empezar

- Un Workspace de ClickUp donde puedas crear Spaces.
- Los archivos CSV de arriba (UTF-8).
- 20 minutos. **Importa primero el archivo de prueba.**

> Los nombres exactos de los menús cambian con las versiones; si alguno no coincide, busca el equivalente.

## A2. Crear la estructura

Crea un **Space** `Calendar Connect App`. Dentro, esta estructura:

| Carpeta (versión) | Lista (sprint)              | Fecha límite | Historias | Puntos |
| ----------------- | --------------------------- | ------------ | --------- | ------ |
| v0.1 MVP          | S0 · Preparación            | 2026-10-23   | 2         | 6      |
| v0.1 MVP          | S1 · Conexión               | 2026-10-30   | 5         | 21     |
| v0.1 MVP          | S2 · Métricas y bot         | 2026-11-06   | 5         | 21     |
| v0.1 MVP          | S3 · Voz y registro         | 2026-11-13   | 4         | 21     |
| v0.1 MVP          | S4 · Brief y endurecimiento | 2026-11-20   | 4         | 19     |
| v0.2 Asistente    | S5 · Asistente completo     | 2026-11-27   | 3         | 18     |
| v0.3 Web          | S6 · Web y PWA              | 2026-12-04   | 3         | 18     |
| v0.4 MCP          | S7 · MCP e ICS              | 2026-12-11   | 3         | 13     |
| Fase 3            | Backlog Fase 3              | sin fecha    | 5         | 29     |

Notas:

- Cada carpeta nueva trae **una lista por defecto**: renómbrala con el primer sprint de esa carpeta y crea las demás.
- Además crea una lista suelta en el Space llamada `Inbox importación`. Es el destino temporal de la importación.
- Límites del plan gratuito: 40 listas por Space y 100 carpetas por Space. Esta estructura usa 9 listas y 5 carpetas.
- Estados de las listas, si tu plan lo permite: `Por hacer` → `En curso` → `En revisión` → `Hecho`. El CSV trae `to do`; si no coincide, mapéalo a tu primer estado.

## A3. Importación de prueba (3 filas)

1. Menú del Workspace → **Importar / Exportar** → **CSV**.
2. Sube `clickup-import-prueba.csv` y elige como destino la lista `Inbox importación`.
3. Mapea las columnas con la tabla de A4.
4. Ejecuta y revisa las 3 tareas: descripción con formato, prioridad, fecha y una etiqueta.
5. Si algo falla, borra las 3 tareas, corrige y repite.

## A4. Importación completa

Con `clickup-import-backlog.csv`, mismo destino (`Inbox importación`) y este mapeo:

| Columna del CSV    | Campo en ClickUp                                                                                                                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Task Name`        | Nombre de la tarea                                                                                                                                                                                                           |
| `Task Description` | Contenido de la descripción                                                                                                                                                                                                  |
| `Status`           | Estado (`to do` → tu estado inicial)                                                                                                                                                                                         |
| `Priority`         | Prioridad                                                                                                                                                                                                                    |
| `Due Date`         | Fecha límite (formato año-mes-día)                                                                                                                                                                                           |
| `Tags`             | Etiquetas                                                                                                                                                                                                                    |
| `Folder` y `List`  | **Déjalas sin mapear**, salvo que el desplegable ofrezca algo como "Nombre de la lista" o "Carpeta". En ese caso puedes mapearlas y ClickUp colocaría cada tarea en su lista; no pude confirmar que tu importador lo ofrezca |

### Mover las tareas a sus listas

Cada sprint tiene una fecha límite distinta, así que la fecha sirve de selector:

1. Abre `Inbox importación` en vista **Lista** y **agrupa por Fecha límite**.
2. Marca el grupo `23 oct` y usa **Mover / Añadir a lista** para llevarlo a `S0 · Preparación`.
3. Repite con cada grupo según la tabla de A2.
4. Las 5 tareas **sin fecha** van a `Backlog Fase 3`.
5. Cuando `Inbox importación` quede vacía, bórrala.

## A5. Verificación

- [ ] 34 tareas repartidas así: S0 = 2, S1 = 5, S2 = 5, S3 = 4, S4 = 4, S5 = 3, S6 = 3, S7 = 3, Fase 3 = 5.
- [ ] Prioridades: High × 17, Normal × 11, Low × 6.
- [ ] Cada tarea tiene **una** etiqueta de épica y ninguna otra.
- [ ] La primera línea de cada descripción dice `Puntos: N · MoSCoW: X · Épica: …`.
- [ ] Las tareas de Fase 3 no tienen fecha.
- [ ] La suma de puntos (leída en la descripción) coincide con la tabla de A2: 166 en total.

## A6. Legibilidad: ajustes en la interfaz

- **Color por épica:** en el Administrador de etiquetas asigna un color distinto a cada una de las 10 etiquetas. Es lo único que lleva color, así que se distingue de un vistazo.
- **Columnas visibles** en las listas: Nombre, Estado, Prioridad, Fecha límite y Etiquetas. Oculta el resto.
- **Vista por defecto de cada sprint:** Tablero agrupado por Estado.
- **Vista global:** en el Space crea una vista Lista con todas las tareas, agrupada por Carpeta, para ver el avance por versión.
- **Vista de calendario** con las fechas límite para ver los hitos semanales.
- **Puntos con suma automática (opcional):** activa el ClickApp **Sprint Points** (100 usos en el plan gratuito, suficientes para 34 historias). Se asignan tarea por tarea y dan el total por lista.

Si más adelante quieres sprints con ciclo automático, el ClickApp **Sprints** está disponible en el plan gratuito.

## A7. Lo que el CSV no cubre

| Limitación                 | Solución                                                                                                                                                                                                  |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jerarquía épica → historia | Se resuelve con la etiqueta de épica. Si quieres tareas padre, créalas a mano                                                                                                                             |
| Dependencias y relaciones  | Ponerlas manualmente (p. ej., HU-04 bloquea a HU-07)                                                                                                                                                      |
| Checklist de "Hecho"       | Crea una **plantilla de tarea** con el checklist de DoD (criterios cumplidos, pruebas en verde, CI, sin secretos, documentación, prueba manual, auditoría) y aplícala a las historias del sprint en curso |
| Varios responsables        | Proyecto de una sola persona; asigna todo a Cris                                                                                                                                                          |

## A8. Convenciones de trabajo

- **Flujo:** `Por hacer` → `En curso` → `En revisión` → `Hecho`. Máximo 2 tareas en curso a la vez.
- **Ramas y commits:** incluye el ID de ClickUp (p. ej., `CU-86abc123`) en la rama o el mensaje, junto con el ID de la historia: `feat(HU-04): conectar OAuth de Google [CU-86abc123]`.
- **Integración con GitHub:** actívala en ClickUp cuando exista el repositorio (PRE-12) para enlazar ramas, commits y PRs con cada tarea.
- **Cambios de alcance:** toda historia nueva o recortada se registra primero en `04` (y como ADR en `07` si es relevante); luego se regenera el CSV con `scripts/generar_csv_clickup.py` o se edita en ClickUp.

---

# Parte B · Conectar el MCP de ClickUp

Hazlo **después** de cargar el backlog. La carga masiva no debe hacerse por MCP: el plan gratuito permite pocas llamadas al día (ver B6).

## B1. Qué es y qué necesitas

- Servidor MCP oficial: `https://mcp.clickup.com/mcp`.
- Autenticación: **solo OAuth** (inicias sesión en ClickUp y autorizas). No acepta tokens personales ni claves de API.
- Disponible en todos los planes de ClickUp.
- Necesitas: tu usuario de ClickUp con acceso al Workspace, y un cliente de Claude compatible (abajo).

## B2. Conectar según tu cliente

### Opción 1 · Claude (web o aplicación de escritorio, planes de pago)

1. Abre **Configuración** (Settings) desde la barra lateral.
2. Entra a **Conectores** (Connectors) y pulsa **Añadir**.
3. Nombre: `ClickUp` · URL del servidor: `https://mcp.clickup.com/mcp`.
4. Pulsa **Conectar**, inicia sesión en ClickUp y **autoriza** el acceso al Workspace.
5. En la conversación donde lo uses, activa el conector `ClickUp` (los conectores se habilitan por chat).

> En esta sesión no está disponible: tras conectarlo, abre una **sesión nueva** con el conector activado para que yo pueda operar ClickUp.

### Opción 2 · Claude Desktop con plan gratuito

1. Requiere **Node.js** instalado.
2. Abre Configuración → **Desarrollador** → **Editar configuración** (`claude_desktop_config.json`).
3. Agrega:

```json
{
  "mcpServers": {
    "clickup": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.clickup.com/mcp"]
    }
  }
}
```

4. Guarda, **reinicia** la aplicación y completa la autorización OAuth que se abre en el navegador.

### Opción 3 · Claude Code

```bash
claude mcp add --transport http clickup https://mcp.clickup.com/mcp
```

Luego abre una sesión de Claude Code y ejecuta `/mcp` para completar la autenticación.

### Otros clientes

Cursor, VS Code, Windsurf y otros usan la misma URL; la guía oficial detalla cada uno (ver Fuentes).

## B3. Probar la conexión

Pide a Claude, en este orden:

1. "Lista los Spaces de mi Workspace de ClickUp."
2. "Muéstrame las tareas de la lista _S1 · Conexión_ del Space _Calendar Connect App_."
3. "¿Cuántos puntos tiene el Sprint 1?" (debe dar **21**).

Si las tres responden bien, la conexión está lista.

## B4. Qué pedirle a Claude por MCP

- Mover tareas de estado y asignar fechas ("pasa HU-04 a _En curso_").
- Crear tareas nuevas o subtareas (bugs, deuda técnica).
- Comentar avances y registrar tiempo.
- Resúmenes del sprint: avance, puntos hechos, pendientes y riesgos.
- Búsqueda de tareas, documentos y comentarios.
- Generar el _standup_ diario a partir de las tareas movidas.

## B5. Lo que el MCP no hace

- **No elimina** tareas (las herramientas de borrado no están disponibles todavía).
- No busca en otras aplicaciones conectadas desde ClickUp.
- El detalle de herramientas puede cambiar; consulta la página de herramientas soportadas de ClickUp.

## B6. Límites de uso

| Plan             | Llamadas MCP (ventana de 24 h móviles, por Workspace y cliente) |
| ---------------- | --------------------------------------------------------------- |
| Free Forever     | 100                                                             |
| Core / Unlimited | 300                                                             |
| Business         | 1 000                                                           |
| Business Plus    | 2 500                                                           |
| Enterprise       | 5 000                                                           |

- Cada llamada a una herramienta cuenta como una. Al excederlo devuelve `RATE_LIMIT_EXCEEDED` con un `retryAfter`.
- Con el complemento **Everything AI** se aplican los límites por minuto de la API pública de tu plan.
- En Free, evita operaciones masivas por MCP: agrupa lo que pides (por ejemplo, "pasa estas 3 tareas a _Hecho_") y deja la carga y los cambios grandes para el CSV.
- ClickUp indica que los límites pueden cambiar.

## B7. Seguridad

- La autorización OAuth da a Claude acceso a lo que tu usuario puede ver y editar en el Workspace. Si compartes el Workspace con otras personas, considera usar un Space exclusivo para este proyecto y revisa qué datos sensibles contiene antes de conectarlo.
- Revoca el acceso desde la configuración de aplicaciones conectadas de ClickUp si dejas de usarlo o sospechas un uso indebido.
- No pegues tokens de ClickUp en chats ni en el repositorio. El MCP no los necesita.
- Las acciones de escritura (mover, comentar, crear) quedan registradas en la actividad de cada tarea.

## B8. Solución de problemas

| Síntoma                           | Qué revisar                                                       |
| --------------------------------- | ----------------------------------------------------------------- |
| El conector no aparece en el chat | Actívalo en los conectores de ese chat o abre una sesión nueva    |
| Pide autorización en bucle        | Cierra sesión en ClickUp, vuelve a entrar y reconecta             |
| `RATE_LIMIT_EXCEEDED`             | Espera el `retryAfter` o reduce llamadas (ver B6)                 |
| Claude Desktop no lo muestra      | Revisa el JSON, confirma Node.js y reinicia la aplicación         |
| Claude Code no autentica          | Ejecuta `/mcp` dentro de una sesión y sigue el enlace             |
| No ve el Space                    | Tu usuario no tiene acceso al Space, o autorizaste otro Workspace |

---

## Relación con el asistente de calendario

- **Hoy:** ClickUp gestiona el proyecto. Es independiente del código.
- **Fase 3 (opcional):** tareas de ClickUp con fecha como señales en el resumen matutino. Para eso, el código usará la **API REST con token personal** (más simple que implementar OAuth 2.1 con PKCE). Ver ADR-012 en `07`.

## Fuentes

- [ClickUp: Connect an AI assistant to ClickUp's MCP server](https://developer.clickup.com/docs/connect-an-ai-assistant-to-clickups-mcp-server)
- [ClickUp: MCP Server Setup Instructions](https://developer.clickup.com/docs/connect-an-ai-assistant-to-clickups-mcp-server-1)
- [ClickUp API: Rate Limits](https://developer.clickup.com/docs/rate-limits)
- [ClickUp: importación de subtareas por CSV (solicitud de función)](https://feedback.clickup.com/feature-requests/p/import-nested-subtasks-via-csv)
