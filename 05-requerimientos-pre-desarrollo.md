# 05 · Requerimientos pre-desarrollo

Todo lo que debe existir **antes de escribir código** (Sprint 0). Ningún secreto se escribe en este documento: los valores van en `.env` (nunca versionado) o en un gestor de contraseñas. La plantilla es `.env.example`.

## 1. Checklist maestro

| ID     | Prerrequisito                                                                                   | Obligatorio   | Bloquea                           | Variable(s) de entorno                                            | Estado |
| ------ | ----------------------------------------------------------------------------------------------- | ------------- | --------------------------------- | ----------------------------------------------------------------- | ------ |
| PRE-01 | Proyecto en Google Cloud (cuenta Google **personal**)                                           | Sí            | HU-04                             | `GOOGLE_PROJECT_ID` (informativo)                                 | ☐      |
| PRE-02 | Google Calendar API habilitada                                                                  | Sí            | HU-04                             | —                                                                 | ☐      |
| PRE-03 | Pantalla de consentimiento OAuth configurada y **publicada en "In production"**                 | Sí            | HU-04                             | —                                                                 | ☐      |
| PRE-04 | Credencial OAuth Client ID (tipo Web) con URIs de redirección                                   | Sí            | HU-04                             | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | ☐      |
| PRE-05 | Calendarios de Microsoft y universidad visibles en Google personal                              | Sí            | HU-05, HU-07                      | —                                                                 | ☐      |
| PRE-06 | Bot de Telegram creado (token)                                                                  | Sí            | HU-12                             | `TELEGRAM_BOT_TOKEN`                                              | ☐      |
| PRE-07 | `chat_id` propio de Telegram                                                                    | Sí            | HU-12                             | `TELEGRAM_ALLOWED_CHAT_ID`                                        | ☐      |
| PRE-08 | Clave de API del proveedor LLM                                                                  | Sí            | HU-14, HU-16                      | `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`                        | ☐      |
| PRE-09 | Proveedor de transcripción de voz                                                               | Sí            | HU-15                             | `STT_PROVIDER`, `STT_API_KEY`                                     | ☐      |
| PRE-10 | URLs ICS secretas (Outlook y/o Workspace)                                                       | No (v0.4)     | HU-08                             | `ICS_*_URL` (opcional)                                            | ☐      |
| PRE-11 | Host con Docker siempre encendido                                                               | Sí            | Disponibilidad                    | —                                                                 | ☐      |
| PRE-12 | Repositorio Git (GitHub) + secretos de CI                                                       | Sí            | HU-03                             | —                                                                 | ☐      |
| PRE-13 | Claves locales: cifrado, sesión web, base de datos                                              | Sí            | HU-02, HU-04                      | `APP_ENCRYPTION_KEY`, `SESSION_SECRET`, `POSTGRES_PASSWORD`       | ☐      |
| PRE-14 | Acceso móvil seguro (Tailscale o Cloudflare Tunnel)                                             | No (Sprint 6) | HU-25                             | `PUBLIC_BASE_URL`                                                 | ☐      |
| PRE-15 | Validar política de datos (Veritran y universidad)                                              | Sí            | Uso de títulos de trabajo con LLM | `HIDE_TITLES_CATEGORIES`                                          | ☐      |
| PRE-16 | Reemplazar el calendario **público** por enlace secreto o compartido solo contigo               | Recomendado   | Privacidad                        | —                                                                 | ☐      |
| PRE-17 | Workspace de ClickUp, Space y lista `Backlog CCA`; backlog importado y MCP conectado (ver `08`) | No (gestión)  | Seguimiento del proyecto          | —                                                                 | ☐      |
| PRE-18 | Token personal de ClickUp para la API REST                                                      | No (fase 3)   | HU-27                             | `CLICKUP_API_TOKEN`                                               | ☐      |

## 2. Instrucciones paso a paso

### PRE-01 a PRE-04 · Google Cloud y OAuth

1. Entra a la consola de Google Cloud con tu **cuenta Google personal** y crea un proyecto (p. ej., `calendar-connect-app`).
2. **APIs y servicios → Biblioteca →** habilita **Google Calendar API**.
3. **APIs y servicios → Pantalla de consentimiento OAuth:** tipo **Externo**, nombre de la app, tu correo como contacto. Agrega los scopes:
   - `https://www.googleapis.com/auth/calendar.readonly`
   - `https://www.googleapis.com/auth/calendar.app.created`
4. Agrega tu correo como **usuario de prueba**. Luego **publica la app a "In production"**. Para uso personal no necesitas verificación (verás una advertencia de "app no verificada" que puedes aceptar). Esto evita que el refresh token caduque a los 7 días, como ocurre en modo _Testing_.
5. **Credenciales → Crear credenciales → ID de cliente OAuth →** tipo **Aplicación web**. URIs de redirección autorizadas:
   - `http://localhost:3000/auth/google/callback` (desarrollo)
   - la URL privada final cuando exista (Tailscale/Cloudflare).
6. Guarda `Client ID` y `Client secret` en el gestor de contraseñas y en `.env`.

> Verifica los nombres exactos de los scopes en la consola antes de configurarlos; Google puede ajustarlos.

### PRE-05 · Calendarios visibles en Google personal

- En Google Calendar (cuenta personal) confirma que aparecen, en "Otros calendarios", el de Microsoft/Outlook y el de la universidad.
- Anota el **nombre** de cada uno y su categoría (`trabajo`, `estudio`, `personal`) para HU-05.
- Verifica el retraso real: crea un evento de prueba en Outlook y mide cuánto tarda en aparecer. Este dato define si HU-08 (ICS directo) sube de prioridad.

### PRE-06 y PRE-07 · Telegram

1. En Telegram abre **@BotFather** → `/newbot` → nombre y usuario terminado en `bot`. Copia el **token**.
2. Obtén tu `chat_id`: envía un mensaje a tu bot y abre `https://api.telegram.org/bot<TOKEN>/getUpdates` (o usa un bot como @userinfobot). El número en `message.chat.id` es tu `chat_id`.
3. Opcional: `/setprivacy`, `/setdescription`, `/setcommands` para registrar los comandos.
4. Modo de operación: **long polling** (no requiere dominio ni webhook).

### PRE-08 · Proveedor LLM

- Decisión pendiente (Q-02). Recomendación: un modelo con **tool calling** fiable y buen español; configurable por variable de entorno (RNF-39).
- Crea la clave en la consola del proveedor, asigna un **límite de gasto mensual** (alineado con RNF-35) y guárdala en `.env`.

### PRE-09 · Transcripción de voz

- Decisión pendiente (Q-03). Opciones: (a) API de transcripción (rápido, costo bajo por minuto, el audio sale de tu equipo) o (b) `faster-whisper` en un contenedor propio (sin costo por uso, privado, requiere CPU/RAM; modelo `small` o `medium` para español).
- Para el MVP se recomienda (a) por velocidad, con eliminación inmediata del audio (RNF-10), y migrar a (b) si la privacidad lo exige.

### PRE-10 · URLs ICS (opcional)

- **Outlook web:** Configuración → Calendario → Calendarios compartidos → _Publicar un calendario_ → formato ICS. Puede estar **bloqueado por el administrador**; si es así, se mantiene la ruta vía Google.
- **Google Workspace (universidad):** Configuración del calendario → _Dirección secreta en formato iCal_. También puede estar deshabilitada por el administrador.
- Trata cada URL como una **contraseña**: quien la tiene ve el calendario. Se guarda cifrada.

### PRE-11 · Host y software

| Elemento | Requisito                                                                       |
| -------- | ------------------------------------------------------------------------------- |
| Host     | PC propio encendido en horario laboral (MVP) o VPS pequeño (1 vCPU, 1–2 GB RAM) |
| Docker   | Docker Desktop (WSL2) en Windows, o Docker Engine + Compose v2 en Linux         |
| Node.js  | LTS actual (≥ 20) y **pnpm**                                                    |
| Git      | Instalado y configurado con tu identidad                                        |
| Editor   | VS Code (u otro) con ESLint y Prettier                                          |
| Puertos  | 3000 (API/web), 5432 (solo interno), sin exposición pública                     |

### PRE-12 · Repositorio y CI

- Crea el repositorio privado `calendar-connect-app` en GitHub.
- Activa protección de rama en `main`, Dependabot y escaneo de secretos.
- Secretos de GitHub Actions (solo los necesarios para publicar imágenes): `REGISTRY_TOKEN`, y los que se definan al desplegar. **No** subas claves de Google, Telegram ni LLM a CI en el MVP; las pruebas usan _mocks_.

### PRE-13 · Claves locales

Genera valores aleatorios fuertes (no reutilices contraseñas):

```bash
# Clave de cifrado de 32 bytes en base64
openssl rand -base64 32
# Secreto de sesión
openssl rand -hex 32
# Contraseña de PostgreSQL
openssl rand -base64 24
```

- Respalda `APP_ENCRYPTION_KEY` en tu gestor de contraseñas: **si se pierde, los tokens cifrados no se pueden recuperar** y habrá que reautorizar.
- Rotación: cada 12 meses o ante sospecha de filtración (procedimiento en `07`).

### PRE-14 · Acceso móvil seguro (Sprint 6)

- **Opción A (recomendada):** Tailscale — la PWA solo es accesible desde tus dispositivos.
- **Opción B:** Cloudflare Tunnel + Cloudflare Access (login por correo) con dominio propio.
- Google exige HTTPS en las URIs de redirección que no sean `localhost`; agrega la URL final en PRE-04.

### PRE-15 · Política de datos

- Consulta si tu política en Veritran permite enviar títulos y asistentes de reuniones a un proveedor externo de IA.
- Mientras no tengas respuesta, activa `HIDE_TITLES_CATEGORIES=trabajo`: al LLM solo llegan hora, duración y una etiqueta genérica ("Reunión de trabajo"). Las métricas siguen siendo exactas.

### PRE-16 · Calendario público

- Un calendario público expone títulos, horarios y enlaces de reunión a cualquiera que tenga la URL. Cámbialo a **compartido solo con tu cuenta personal** o usa la **dirección secreta**. No afecta al asistente.

## 3. Mapa de conexiones

| Origen        | Destino                        | Protocolo                | Autenticación                     | Notas                                  |
| ------------- | ------------------------------ | ------------------------ | --------------------------------- | -------------------------------------- |
| App           | Google Calendar API            | HTTPS                    | OAuth 2.0 (refresh token cifrado) | Lectura + escritura solo en "Registro" |
| App           | Telegram Bot API               | HTTPS (long polling)     | Token del bot                     | Allowlist por `chat_id`                |
| App           | Proveedor LLM                  | HTTPS                    | API key                           | Datos minimizados (RNF-09)             |
| App           | Proveedor STT                  | HTTPS o local            | API key o ninguna                 | Audio borrado tras transcribir         |
| App           | Outlook / Workspace (opcional) | HTTPS (ICS)              | URL secreta                       | Solo lectura                           |
| Navegador/PWA | App                            | HTTPS                    | Sesión de usuario único           | Por red privada                        |
| Cliente MCP   | App                            | HTTP/stdio               | Token Bearer                      | Fase v0.4                              |
| App           | PostgreSQL                     | TCP (red interna Docker) | Usuario/contraseña                | Sin exposición pública                 |

## 4. Gestión de secretos

1. **Fuente de verdad:** gestor de contraseñas (Bitwarden, 1Password, etc.).
2. **Ejecución:** archivo `.env` local con permisos restringidos, o _Docker secrets_ en el servidor.
3. **Nunca:** en el repositorio, en capturas de pantalla, en chats, en logs, en mensajes de commit.
4. **Rotación:** token de Telegram (BotFather `/revoke`), credenciales de Google (nueva credencial + reautorización), clave de LLM (regenerar), `APP_ENCRYPTION_KEY` (re-cifrar con script de migración).
5. **Si algo se filtra:** revocar de inmediato, rotar, revisar `audit_log` y registrar el incidente en `07`.

## 5. Datos de configuración que debes decidir antes del Sprint 1

| Parámetro                                  | Valor propuesto                        | Tu decisión |
| ------------------------------------------ | -------------------------------------- | ----------- |
| Zona horaria                               | America/Bogota                         | ☐           |
| Horario laboral                            | L–V 08:00–18:00                        | ☐           |
| Bloque mínimo de foco                      | 90 min                                 | ☐           |
| Buffer entre reuniones                     | 10 min                                 | ☐           |
| Hora del resumen matutino                  | 07:00 L–V                              | ☐           |
| Regla de reunión                           | ≥ 2 asistentes o enlace de conferencia | ☐           |
| ¿Cuentan "tentativo" como ocupado?         | Sí                                     | ☐           |
| Categoría de cada calendario               | trabajo / estudio / personal           | ☐           |
| Presupuesto mensual IA                     | por definir (Q-04)                     | ☐           |
| Categorías con títulos ocultos para el LLM | trabajo (hasta aclarar política)       | ☐           |

## 6. Criterio de salida del Sprint 0 (H0)

- [ ] PRE-01 a PRE-09, PRE-11, PRE-12, PRE-13 y PRE-15 completados.
- [ ] Prueba manual: llamada de lectura a Google Calendar con las credenciales y mensaje de prueba enviado por el bot a tu `chat_id`.
- [ ] `.env` completo y `.env.example` versionado sin valores reales.
- [ ] Decisiones de §5 registradas.
