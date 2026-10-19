#!/usr/bin/env python3
"""
Genera los CSV de importación para ClickUp a partir de 04-historias-de-usuario.md.

DISEÑO (legible y compatible con el plan Free):
  - Cero campos personalizados (Free permite solo 60 usos en total).
  - Versión  -> Carpeta de ClickUp        (v0.1 MVP, v0.2 Asistente, ...)
  - Sprint   -> Lista dentro de la carpeta (S0 · Preparación, S1 · Conexión, ...)
  - MoSCoW   -> Prioridad nativa           (Must=High, Should=Normal, Could/Won't=Low)
  - Épica    -> UNA sola etiqueta corta    (E1 Calendarios)
  - Puntos, MoSCoW y trazabilidad -> primera línea de la descripción
  - Las columnas Folder y List van al final del CSV: úsalas solo si el importador
    de tu cuenta ofrece mapearlas; si no, déjalas sin mapear.

Uso (desde la carpeta calendar-connect-app):
    python3 scripts/generar_csv_clickup.py

Salida:
    clickup-import-backlog.csv   (34 historias)
    clickup-import-prueba.csv    (3 filas para la importación de prueba)
"""
import csv
import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
FUENTE = BASE / "04-historias-de-usuario.md"

# Sprint -> (fecha fin, historias)  [fuente: 01-plan-de-trabajo.md]
SPRINTS = {
    "S0": ("2026-10-23", ["HU-01", "HU-02"]),
    "S1": ("2026-10-30", ["HU-03", "HU-04", "HU-05", "HU-06", "HU-07"]),
    "S2": ("2026-11-06", ["HU-11", "HU-09", "HU-10", "HU-12", "HU-13"]),
    "S3": ("2026-11-13", ["HU-15", "HU-16", "HU-17", "HU-32"]),
    "S4": ("2026-11-20", ["HU-20", "HU-21", "HU-33", "HU-34"]),
    "S5": ("2026-11-27", ["HU-14", "HU-18", "HU-19"]),
    "S6": ("2026-12-04", ["HU-23", "HU-24", "HU-25"]),
    "S7": ("2026-12-11", ["HU-26", "HU-08", "HU-22"]),
    "Fase3": ("", ["HU-27", "HU-28", "HU-29", "HU-30", "HU-31"]),
}
SPRINT_DE = {hu: (s, f) for s, (f, hus) in SPRINTS.items() for hu in hus}

# Sprint -> (carpeta = versión, lista = sprint)
ESTRUCTURA = {
    "S0": ("v0.1 MVP", "S0 · Preparación"),
    "S1": ("v0.1 MVP", "S1 · Conexión"),
    "S2": ("v0.1 MVP", "S2 · Métricas y bot"),
    "S3": ("v0.1 MVP", "S3 · Voz y registro"),
    "S4": ("v0.1 MVP", "S4 · Brief y endurecimiento"),
    "S5": ("v0.2 Asistente", "S5 · Asistente completo"),
    "S6": ("v0.3 Web", "S6 · Web y PWA"),
    "S7": ("v0.4 MCP", "S7 · MCP e ICS"),
    "Fase3": ("Fase 3", "Backlog Fase 3"),
}

# Épica -> etiqueta corta (única etiqueta de cada tarea)
EPICA_TAG = {
    "E0": "E0 Fundaciones", "E1": "E1 Calendarios", "E2": "E2 Métricas", "E3": "E3 Telegram",
    "E4": "E4 Voz", "E5": "E5 Resúmenes", "E6": "E6 Web", "E7": "E7 MCP",
    "E8": "E8 Integraciones", "E9": "E9 Transversal",
}

# MoSCoW -> prioridad nativa (sin 'Urgent' para mantener la vista tranquila)
PRIORIDAD = {"must": "High", "should": "Normal", "could": "Low", "won't": "Low"}


def limpiar(texto: str) -> str:
    """Quita marcas de Markdown que ClickUp mostraría literalmente."""
    return texto.replace("**", "").replace("*", "").replace("`", "")


def parsear(md: str):
    historias, epica_id, epica_nombre = {}, "", ""
    lineas = md.splitlines()
    i = 0
    while i < len(lineas):
        l = lineas[i]
        m_ep = re.match(r"^## (E\d) · (.+)$", l)
        if m_ep:
            epica_id, epica_nombre = m_ep.group(1), m_ep.group(2).strip()
        m_hu = re.match(r"^### (HU-\d+) · (.+?) — (\d+) pts · (\w+)", l)
        if m_hu:
            hu, titulo, pts, prio = m_hu.groups()
            cuerpo = []
            i += 1
            while i < len(lineas) and not lineas[i].startswith(("### ", "## ")):
                cuerpo.append(lineas[i])
                i += 1
            historias[hu] = dict(hu=hu, titulo=titulo.strip(), pts=pts, prio=prio.lower(),
                                 epica_id=epica_id, cuerpo="\n".join(cuerpo).strip())
            continue
        # Tabla de fase 3: | HU-27 | texto | 8 | Could | RF-30 |
        m_t = re.match(r"^\| (HU-\d+) \| (.+?) \| (\d+) \| (.+?) \| (RF-\d+) \|", l)
        if m_t:
            hu, texto, pts, prio, rf = m_t.groups()
            prio = prio.split()[0].lower()  # "Won't (ahora)" -> "won't"
            historias[hu] = dict(hu=hu, titulo=texto.strip(), pts=pts, prio=prio, epica_id="E8",
                                 cuerpo=f"{texto.strip()}.\n- Adaptador SignalSource activable por configuración; "
                                        f"nunca bloquea el resumen si falla.\n- Trazabilidad: {rf}.")
        i += 1
    return historias


def descripcion(h) -> str:
    lineas = [l.strip() for l in limpiar(h["cuerpo"]).splitlines() if l.strip()]
    historia = " ".join(l for l in lineas if not l.startswith("- "))
    criterios = ["• " + l[2:] for l in lineas if l.startswith("- ")]
    cab = (f"Puntos: {h['pts']} · MoSCoW: {h['prio'].capitalize()} · "
           f"Épica: {EPICA_TAG[h['epica_id']]}")
    partes = [cab, "", "HISTORIA", historia]
    if criterios:
        partes += ["", "CRITERIOS DE ACEPTACIÓN"] + criterios
    return "\n".join(partes)


def main():
    historias = parsear(FUENTE.read_text(encoding="utf-8"))
    faltan = [h for h in SPRINT_DE if h not in historias]
    if faltan:
        sys.exit(f"Historias del plan no encontradas en 04: {faltan}")

    columnas = ["Task Name", "Task Description", "Status", "Priority", "Due Date", "Tags", "Folder", "List"]
    filas = []
    for hu in [x for s in SPRINTS.values() for x in s[1]]:
        h = historias[hu]
        sprint, fecha = SPRINT_DE[hu]
        carpeta, lista = ESTRUCTURA[sprint]
        filas.append({
            "Task Name": f"{hu} · {h['titulo']}",
            "Task Description": descripcion(h),
            "Status": "to do",
            "Priority": PRIORIDAD[h["prio"]],
            "Due Date": fecha,
            "Tags": EPICA_TAG[h["epica_id"]],
            "Folder": carpeta,
            "List": lista,
        })

    def escribir(nombre, rows):
        with open(BASE / nombre, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=columnas, quoting=csv.QUOTE_MINIMAL)
            w.writeheader()
            w.writerows(rows)
        print(f"{nombre}: {len(rows)} filas")

    escribir("clickup-import-backlog.csv", filas)
    escribir("clickup-import-prueba.csv", [filas[0], filas[3], filas[-1]])
    print("Puntos totales:", sum(int(historias[h["Task Name"][:5]]["pts"]) for h in filas))


if __name__ == "__main__":
    main()
