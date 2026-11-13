"""Genera TODAS las páginas interiores a partir de los datos. Es el único comando que hay que correr.

Uso:
  python3 herramientas/generar_paginas.py            # escribe productos/*.html, proyectos/*.html, trabaja-con-nosotros.html y sitemap
  python3 herramientas/generar_paginas.py --revisar  # no escribe nada; avisa qué páginas cambiarían (útil antes de subir)
  python3 herramientas/generar_paginas.py --revisar --diff   # además muestra las líneas que cambiarían

Datos (lo único que se edita a mano):
  datos/sitio.json          dominio, contactos, menú, Umami... (lo usan todas las páginas)
  datos/productos/<slug>.json, datos/proyectos/<slug>.json, datos/paginas/<slug>.json
Plantillas: herramientas/plantillas/base.html (cabecera, pie, <head>) + producto.html / proyecto.html / pagina.html.
Cada texto visible va en los 3 idiomas: {"es": ..., "en": ..., "zh": ...}. Ver herramientas/LEEME.md.
"""
import datetime, difflib, glob, json, os, re, sys, urllib.parse
from bs4 import BeautifulSoup
from jinja2 import Environment, FileSystemLoader, StrictUndefined

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)

def vimg(url, w=1080):
    """URL del optimizador de fotos de Vercel (build_estatico.py la cambia por WebP propias en AWS)."""
    return "/_vercel/image?url=" + urllib.parse.quote(url, safe="") + "&w=%d&q=75" % w

def cargar(ruta):
    with open(ruta, encoding="utf-8") as f:
        return json.load(f)

env = Environment(loader=FileSystemLoader("herramientas/plantillas"), undefined=StrictUndefined,
                  autoescape=True, keep_trailing_newline=True)
env.filters["vimg"] = vimg
env.filters["tojson_bonito"] = lambda o: json.dumps(o, ensure_ascii=False, indent=1)
# datos("proyectos/metro-de-quito") -> contenido de datos/proyectos/metro-de-quito.json (p. ej. tarjetas de "Otros proyectos")
env.globals["datos"] = lambda ruta: cargar("datos/%s.json" % ruta)

SITIO = cargar("datos/sitio.json")
# Datos de todos los productos, por slug (las fichas los usan para "Productos relacionados")
env.globals["productos"] = {os.path.basename(r)[:-5]: cargar(r) for r in glob.glob("datos/productos/*.json")}
# (carpeta de datos, plantilla, carpeta de salida o None si la página va en la raíz)
TIPOS = [("datos/productos", "producto.html", "productos"),
         ("datos/proyectos", "proyecto.html", "proyectos"),
         ("datos/paginas", "pagina.html", None)]

def paginas():
    for carpeta, plantilla, salida in TIPOS:
        if not os.path.exists(os.path.join("herramientas/plantillas", plantilla)):
            continue
        for ruta in sorted(glob.glob(carpeta + "/*.json")):
            slug = os.path.basename(ruta)[:-5]
            p = cargar(ruta)
            p.setdefault("slug", slug)
            p.setdefault("ruta", "/" + (salida + "/" if salida else "") + slug)
            destino = (salida + "/" if salida else "") + slug + ".html"
            yield destino, plantilla, p

PRIORIDAD = {"productos": "0.8", "proyectos": "0.7"}

def actualizar_sitemap(rutas, escritas, revisar):
    """sitemap.xml: conserva el orden y las fechas; agrega páginas nuevas, quita las que ya no existen
    y pone la fecha de hoy a las páginas que cambiaron. La portada y los PDF se mantienen."""
    viejo = open("sitemap.xml", encoding="utf-8").read()
    filas = re.findall(r"<url><loc>([^<]+)</loc><lastmod>([^<]+)</lastmod><priority>([^<]+)</priority></url>", viejo)
    hoy = datetime.date.today().isoformat()
    dom = SITIO["dominio"]
    generadas = {dom + r for r in rutas}
    nuevas = []
    for loc, fecha, prio in filas:
        ruta = loc[len(dom):]
        es_generable = ruta.startswith(("/productos/", "/proyectos/")) or (dom + ruta) in generadas
        if es_generable and loc not in generadas:
            continue  # la página ya no existe
        nuevas.append([loc, hoy if ruta in escritas else fecha, prio])
    conocidas = {f[0] for f in nuevas}
    for r in rutas:
        if dom + r not in conocidas:
            nuevas.append([dom + r, hoy, PRIORIDAD.get(r.split("/")[1], "0.5")])
    xml = "\n".join(['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
                    + ["  <url><loc>%s</loc><lastmod>%s</lastmod><priority>%s</priority></url>" % tuple(f) for f in nuevas]
                    + ["</urlset>", ""])
    if xml != viejo:
        print(("cambiaría " if revisar else "escribe ") + "sitemap.xml")
        if not revisar:
            open("sitemap.xml", "w", encoding="utf-8").write(xml)
        return 1
    return 0

def generar(revisar=False):
    cambios = 0
    rutas, escritas = [], set()
    for destino, plantilla, p in paginas():
        rutas.append(p["ruta"])
        html = env.get_template(plantilla).render(sitio=SITIO, p=p)
        html = str(BeautifulSoup(html, "html.parser"))  # mismo formato en todas las páginas
        viejo = open(destino, encoding="utf-8").read() if os.path.exists(destino) else None
        if html != viejo:
            cambios += 1
            escritas.add(p["ruta"])
            print(("cambiaría " if revisar else "escribe ") + destino)
            if "--diff" in sys.argv and viejo:
                for linea in list(difflib.unified_diff(viejo.splitlines(), html.splitlines(), lineterm="", n=1))[:60]:
                    print("   ", linea[:300])
            if not revisar:
                with open(destino, "w", encoding="utf-8") as f:
                    f.write(html)
    cambios += actualizar_sitemap(rutas, escritas, revisar)
    print("archivos con cambios:", cambios)
    return cambios

if __name__ == "__main__":
    revisar = "--revisar" in sys.argv
    n = generar(revisar)
    sys.exit(1 if (revisar and n) else 0)
