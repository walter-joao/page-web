#!/usr/bin/env python3
"""Copia al proyecto todas las fotos y archivos que la web todavía pide a jocecia.com (WordPress)
y cambia los enlaces para que salgan de /img/wp/... (misma ruta que en WordPress).

Lo ejecuta la acción de GitHub "Traer fotos de WordPress" (.github/workflows/traer-fotos-wp.yml),
porque el contenedor de desarrollo no llega a jocecia.com. También se puede correr a mano:

    python3 herramientas/traer_fotos_wp.py

- Las JPG/PNG se guardan con la misma extensión, recomprimidas y con 2560 px como máximo
  (si la versión recomprimida pesa más, se guarda la original).
- Solo se cambian los enlaces de los archivos que sí se pudieron descargar; los que fallan
  quedan apuntando a jocecia.com y se listan al final.
- herramientas/fuente-wp.json (la copia del WordPress) no se toca.
- El mapa remoto -> local queda en herramientas/fotos-wp.json; los generadores lo usan
  (generar_productos.localizar) para que al regenerar las páginas no vuelvan los enlaces viejos.
"""
import io
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://jocecia.com/portal/wp-content/uploads/"
LOCAL = "/img/wp/"
MAPA = os.path.join(RAIZ, "herramientas", "fotos-wp.json")
MAX = 2560

RAW = re.compile(r"https?://jocecia\.com/portal/wp-content/uploads/[^\"'\s<>)\\&?#]+")
ENC = re.compile(r"https?%3A%2F%2Fjocecia\.com%2Fportal%2Fwp-content%2Fuploads%2F[^\"'\s<>)\\&?#]+", re.I)


def archivos():
    for carpeta, dirs, nombres in os.walk(RAIZ):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules", "img", "catalogos", "vendor")]
        for n in nombres:
            if n == "fuente-wp.json" or not n.endswith((".html", ".json", ".py", ".xml", ".js")):
                continue
            if n == "traer_fotos_wp.py":
                continue
            yield os.path.join(carpeta, n)


def normal(u):
    return "https://" + u.split("://", 1)[1]


def bajar(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"})
    for intento in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404:
                raise
            err = e
        except Exception as e:  # red inestable: reintentar
            err = e
        time.sleep(2 ** intento)
    raise err


def comprimir(datos, ext):
    if ext not in (".jpg", ".jpeg", ".png"):
        return datos
    try:
        im = Image.open(io.BytesIO(datos))
        im.load()
    except Exception:
        return datos
    if max(im.size) > MAX:
        im.thumbnail((MAX, MAX), Image.LANCZOS)
    out = io.BytesIO()
    if ext == ".png":
        im.save(out, "PNG", optimize=True)
    else:
        im.convert("RGB").save(out, "JPEG", quality=82, optimize=True, progressive=True)
    nuevo = out.getvalue()
    return nuevo if len(nuevo) < len(datos) else datos


def main():
    mapa = json.load(open(MAPA)) if os.path.exists(MAPA) else {}
    textos = {f: open(f, encoding="utf-8").read() for f in archivos()}
    urls = set()
    for s in textos.values():
        urls.update(normal(u) for u in RAW.findall(s))
        urls.update(normal(urllib.parse.unquote(u)) for u in ENC.findall(s))
    print("Enlaces a jocecia.com encontrados: %d" % len(urls))

    fallos, total = [], 0
    for url in sorted(urls):
        if url in mapa and os.path.exists(os.path.join(RAIZ, mapa[url].lstrip("/"))):
            continue
        rel = urllib.parse.unquote(url[len(BASE):])
        dest = os.path.join(RAIZ, "img", "wp", rel)
        try:
            datos = bajar(url)
        except Exception as e:
            fallos.append((url, str(e)))
            continue
        datos = comprimir(datos, os.path.splitext(rel)[1].lower())
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        open(dest, "wb").write(datos)
        total += len(datos)
        mapa[url] = LOCAL + rel
    json.dump(mapa, open(MAPA, "w"), indent=1, ensure_ascii=False, sort_keys=True)
    print("Descargados: %d archivos nuevos, %.1f MB" % (len(urls) - len(fallos), total / 1048576))

    def raw(m):
        return mapa.get(normal(m.group(0)), m.group(0))

    def enc(m):
        u = normal(urllib.parse.unquote(m.group(0)))
        return urllib.parse.quote(mapa[u], safe="") if u in mapa else m.group(0)

    cambiados = 0
    for f, s in textos.items():
        n = ENC.sub(enc, RAW.sub(raw, s))
        if n != s:
            open(f, "w", encoding="utf-8").write(n)
            cambiados += 1
    print("Archivos con enlaces cambiados: %d" % cambiados)
    if fallos:
        print("No se pudieron descargar (siguen apuntando a jocecia.com):")
        for u, e in fallos:
            print("  ", u, "->", e)
    return 0


if __name__ == "__main__":
    sys.exit(main())
