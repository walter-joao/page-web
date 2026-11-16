"""Versiones web de las fotos propias (las que no vienen del WordPress), listas para Vercel y AWS.

Cada foto declarada en datos/fotos.json se genera en WebP, con la misma calidad, en:
  - los anchos de "anchos" (sin agrandar nunca el original): img/<nombre>-<ancho>.webp
  - si tiene "movil": un recorte vertical 1:2 para celulares, centrado en "foco" [x, y] (0..1):
    img/<nombre>-movil-<ancho>.webp

El original va en img/originales/<nombre>.<jpg|png|webp>. Esa carpeta no se publica (.vercelignore y build_estatico.py).
Los archivos generados sí se suben al repo: así Vercel y AWS sirven exactamente lo mismo.

Uso:
  python3 herramientas/fotos.py                    # genera lo que falte o sea más viejo que su original
  python3 herramientas/fotos.py --todo             # vuelve a generar todo (p. ej. tras cambiar la calidad o un foco)
  python3 herramientas/fotos.py --html portada/hidro   # imprime el <picture> listo para pegar en el HTML
"""
import glob
import json
import os
import sys

from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = os.path.join(RAIZ, "datos", "fotos.json")
ORIGINALES = os.path.join(RAIZ, "img", "originales")
MOVIL_PROPORCION = 0.5   # ancho / alto del recorte para celular (pantalla vertical)
MOVIL_ANCHOS = (480, 900)  # el mayor se limita a lo que dé el original
MOVIL_MEDIA = "(max-aspect-ratio: 2/3)"  # celulares en vertical


def original(nombre):
    hallados = glob.glob(os.path.join(ORIGINALES, nombre + ".*"))
    if not hallados:
        sys.exit(f"Falta el original de '{nombre}' en img/originales/")
    return hallados[0]


def recorte_movil(im, foco):
    """Recorte vertical MOVIL_PROPORCION lo más grande posible, centrado en el foco."""
    w, h = im.size
    cw, ch = (round(h * MOVIL_PROPORCION), h) if w / h > MOVIL_PROPORCION else (w, round(w / MOVIL_PROPORCION))
    x = min(max(round(foco[0] * w - cw / 2), 0), w - cw)
    y = min(max(round(foco[1] * h - ch / 2), 0), h - ch)
    return im.crop((x, y, x + cw, y + ch))


def anchos_movil(im_recorte):
    """Los anchos de MOVIL_ANCHOS, con el mayor limitado al ancho real del recorte."""
    tope = min(im_recorte.width, MOVIL_ANCHOS[-1])
    return sorted({min(a, tope) for a in MOVIL_ANCHOS})


def variantes(nombre, datos, im):
    """(sufijo, ancho, imagen fuente) de cada archivo a generar."""
    out = [("", a, im) for a in sorted({min(a, im.width) for a in datos["anchos"]})]
    if "movil" in datos:
        rec = recorte_movil(im, datos["movil"].get("foco", [0.5, 0.5]))
        out += [("-movil", a, rec) for a in anchos_movil(rec)]
    return out


def ruta(nombre, sufijo, ancho):
    return f"/img/{nombre}{sufijo}-{ancho}.webp"


def generar(nombre, datos, calidad, todo):
    src = original(nombre)
    im = Image.open(src)
    im.load()
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")
    hechos = 0
    for sufijo, ancho, fuente in variantes(nombre, datos, im):
        destino = RAIZ + ruta(nombre, sufijo, ancho)
        if not todo and os.path.exists(destino) and os.path.getmtime(destino) >= os.path.getmtime(src):
            continue
        os.makedirs(os.path.dirname(destino), exist_ok=True)
        alto = round(fuente.height * ancho / fuente.width)
        fuente.resize((ancho, alto), Image.LANCZOS).save(destino, "WEBP", quality=calidad, method=6)
        hechos += 1
    return hechos


def html(nombre, datos):
    im = Image.open(original(nombre))
    vs = variantes(nombre, datos, im)
    grande = ", ".join(f"{ruta(nombre, s, a)} {a}w" for s, a, _ in vs if s == "")
    movil = ", ".join(f"{ruta(nombre, s, a)} {a}w" for s, a, _ in vs if s == "-movil")
    base = ruta(nombre, "", min(a for s, a, _ in vs if s == ""))
    fuente = f'<source media="{MOVIL_MEDIA}" srcset="{movil}" sizes="100vw">' if movil else ""
    return f'<picture>{fuente}<img src="{base}" srcset="{grande}" sizes="100vw" alt="" decoding="async"></picture>'


def main():
    cfg = json.load(open(CONFIG, encoding="utf-8"))
    if "--html" in sys.argv:
        nombre = sys.argv[sys.argv.index("--html") + 1]
        print(html(nombre, cfg["fotos"][nombre]))
        return
    todo = "--todo" in sys.argv
    total = sum(generar(n, d, cfg["calidad"], todo) for n, d in cfg["fotos"].items())
    print(f"archivos generados: {total}")


if __name__ == "__main__":
    main()
