# 00 · Visión y alcance

## 1. Problema

Cris trabaja y estudia en paralelo. Sus compromisos viven en calendarios separados (Microsoft del trabajo, Google Workspace de la universidad, Google personal) que se sincronizan entre sí de forma parcial y con retraso. Hoy no puede responder rápido:

- ¿Cuántas horas de reunión tengo hoy, esta semana, este mes?
- ¿Cuánto tiempo continuo de trabajo profundo me queda?
- ¿Qué necesito preparar para mis reuniones de mañana?
- Registrar lo que acaba de pasar ("tuve el daily de 9 a 9:30") sin abrir tres aplicaciones, validando que no esté ya agendado.

## 2. Visión

> Un asistente de agenda que **ve todo tu tiempo en un solo lugar**, te dice cómo está distribuido y te deja **registrarlo hablando**.

## 3. Objetivos medibles

| ID    | Objetivo             | Indicador de éxito                                                                                           |
| ----- | -------------------- | ------------------------------------------------------------------------------------------------------------ |
| OBJ-1 | Vista unificada      | Todos los calendarios elegidos visibles en un solo lugar con datos de menos de 15 min de antigüedad (Google) |
| OBJ-2 | Métricas fiables     | Horas de reunión y bloques libres coinciden con el cálculo manual en el 100 % de los casos de prueba         |
| OBJ-3 | Registro por voz     | Una nota de voz crea o vincula el evento correcto en menos de 10 s, sin duplicados                           |
| OBJ-4 | Planificación diaria | Resumen matutino entregado a la hora configurada (±1 min) los días hábiles                                   |
| OBJ-5 | Costo controlado     | Gasto mensual de LLM + transcripción dentro del presupuesto definido (ver Q-04)                              |
| OBJ-6 | Tiempo a MVP         | MVP usable (v0.1) al final del Sprint 4 (2026-11-20)                                                         |

## 4. Alcance

### Dentro del MVP (v0.1)

- Conexión OAuth a Google personal y lectura de todos los calendarios compartidos que aparecen en esa cuenta.
- Clasificación de calendarios por categoría (trabajo, estudio, personal).
- Calendario propio "Registro" para escritura.
- Métricas: horas de reunión (día/semana/mes) y bloques libres continuos.
- Bot de Telegram con comandos, voz y texto; registro de actividades con detección de duplicados.
- Resumen matutino con preparación básica.

### Fases posteriores

- **v0.2:** consultas en lenguaje natural, modificar/cancelar con confirmación, recordatorios.
- **v0.3:** web unificada y PWA para móvil.
- **v0.4:** servidor MCP, lectura directa de ICS (Outlook/Workspace), cierre del día.
- **Fase 3:** señales de Asana, GitHub, Slack, Jenkins; escritura en Microsoft vía Graph.

### Fuera de alcance (por ahora)

- Aplicación móvil nativa (se cubre con PWA).
- WhatsApp (requiere WhatsApp Business API y aprobación de Meta).
- Multiusuario / multi-tenant: el sistema es **de un solo usuario**.
- Reprogramar reuniones de terceros o responder invitaciones automáticamente.
- Calendarios de otros proveedores (iCloud, Zoho, etc.).

## 5. Usuarios y actores

| Actor                      | Descripción                                                            |
| -------------------------- | ---------------------------------------------------------------------- |
| Cris (usuario único)       | Dueño de los calendarios; interactúa por Telegram, web y MCP           |
| Google Calendar API        | Fuente y destino de eventos                                            |
| Microsoft/Outlook          | Fuente indirecta (vía Google) o directa (ICS / Graph en fases futuras) |
| Telegram Bot API           | Canal de entrada/salida                                                |
| Proveedor LLM              | Interpretación de lenguaje natural y redacción de resúmenes            |
| Proveedor de transcripción | Voz a texto                                                            |

## 6. Supuestos

1. Los calendarios de Microsoft y de la universidad ya están compartidos hacia la cuenta de Google personal y aparecen en su lista de calendarios.
2. Hay un equipo o servidor siempre encendido con Docker para ejecutar el bot (o se acepta que el bot solo responda con el equipo encendido durante el MVP).
3. La política de datos de Veritran permite que títulos de reuniones pasen por un proveedor LLM (por validar, ver Q-01).
4. Zona horaria del usuario: **America/Bogota (UTC-5)**, sin horario de verano.
5. Idioma principal: español.

## 7. Restricciones

- Sin permisos de administrador sobre Microsoft 365 de Veritran ni sobre Google Workspace de la universidad.
- Presupuesto de infraestructura mínimo (preferencia por self-hosted y servicios gratuitos).
- Los tokens de Google en modo "Testing" caducan a los 7 días: hay que pasar la app a "In production" (uso personal, sin verificación) — ver PRE-03.

## 8. Glosario

| Término                          | Significado                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| Hub                              | Cuenta Google personal que concentra todos los calendarios                                     |
| Registro                         | Calendario propio donde el asistente escribe                                                   |
| Reunión                          | Evento que cumple la regla de reunión configurada (ver RF-09)                                  |
| Bloque de productividad continua | Intervalo libre contiguo dentro del horario laboral con duración ≥ umbral (por defecto 90 min) |
| ICS                              | Formato de calendario suscribible por URL; de solo lectura y con refresco lento                |
| Long polling                     | Modo en que el bot consulta a Telegram sin necesitar URL pública                               |
| Brief                            | Resumen matutino del día                                                                       |
| MCP                              | Model Context Protocol: estándar para exponer herramientas a agentes de IA                     |
