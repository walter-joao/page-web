"""Migración (una sola vez, pero se puede volver a correr): lee proyectos/*.html y escribe datos/proyectos/<slug>.json.

Uso:
  python3 herramientas/migracion/extraer_proyectos.py
  python3 herramientas/generar_paginas.py --revisar   # debe decir 0 cambios en proyectos/

Solo guarda lo que no se puede calcular: textos (es/en/zh), rutas de fotos, ancla del mapa y la lista
de "Otros proyectos". El título, las URL, el enlace de WhatsApp, los textos alternativos de las fotos,
las tarjetas de "Otros proyectos", el ld+json, etc. los arma la plantilla herramientas/plantillas/proyecto.html.
"""
import glob, json, os, urllib.parse
from bs4 import BeautifulSoup

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(RAIZ)
with open("datos/sitio.json", encoding="utf-8") as f:
    SITIO = json.load(f)
MARCA = SITIO["marca"]

# Etiquetas fijas de la ficha (.pj-meta); las pone la plantilla, en los datos va solo el valor.
ETIQUETAS = {"tipo": ("Tipo", "Type", "类型"),
             "ubicacion": ("Ubicación", "Location", "地点"),
             "cliente": ("Cliente", "Client", "客户")}

def tri(tag):
    """Texto de un elemento en los 3 idiomas (el español es el contenido; en/zh, los atributos data-*)."""
    return {"es": tag.decode_contents(), "en": tag["data-en"], "zh": tag["data-zh"]}

def sin_etiqueta(texto, etiqueta):
    """'<b>Tipo</b>Obra vial' -> 'Obra vial' (comprueba que la etiqueta sea la esperada)."""
    pre = "<b>%s</b>" % etiqueta
    assert texto.startswith(pre), (texto, pre)
    return texto[len(pre):]

def ruta_foto(src):
    """URL del optimizador de Vercel -> ruta original de la foto."""
    if src.startswith("/_vercel/image?"):
        return urllib.parse.parse_qs(urllib.parse.urlparse(src).query)["url"][0]
    return src

def extraer(ruta):
    with open(ruta, encoding="utf-8") as f:
        s = BeautifulSoup(f.read(), "html.parser")
    html = s.html
    d = {}
    d["nombre"] = tri(s.find("h1"))
    # El título se calcula ("<nombre> · Proyectos · <marca>"); se comprueba que siga siendo así.
    titulo = {"es": s.title.string, "en": html["data-title-en"], "zh": html["data-title-zh"]}
    for l, sec in (("es", "Proyectos"), ("en", "Projects"), ("zh", "项目")):
        assert titulo[l] == "%s · %s · %s" % (d["nombre"][l], sec, MARCA), (ruta, titulo[l])
    d["descripcion"] = {"es": s.find("meta", attrs={"name": "description"})["content"],
                        "en": html["data-desc-en"], "zh": html["data-desc-zh"]}
    d["resumen"] = tri(s.select_one("p.pp-lead"))
    for li in s.select(".pj-meta li"):
        clave = next(k for k, e in ETIQUETAS.items() if li.b.string == e[0])
        t = tri(li)
        d[clave] = {l: sin_etiqueta(t[l], e) for l, e in zip(("es", "en", "zh"), ETIQUETAS[clave])}
    mapa = [a["href"][2:] for a in s.select(".cta-row a") if a["href"].startswith("/#obra-")]
    if mapa:
        d["mapa"] = mapa[0]
    d["fotos"] = [ruta_foto(a["href"]) for a in s.select(".pj-gal > a")]
    d["trabajos"] = [tri(li) for li in s.select(".pp-body ul.pj-list > li")]
    nota = s.select_one(".pp-body p.pj-nota")
    if nota:
        d["nota"] = tri(nota)
    tarjetas = s.select(".pj-cards > a")
    d["otras_obras"] = [a["href"].rsplit("/", 1)[1] for a in tarjetas]
    # para comprobar luego que cada tarjeta coincide con los datos del otro proyecto
    d["_tarjetas"] = [(a["href"].rsplit("/", 1)[1], ruta_foto(a.img["src"]), a.small.string, a.span.contents[-1])
                      for a in tarjetas]
    return d

def main():
    todos = {}
    for ruta in sorted(glob.glob("proyectos/*.html")):
        todos[os.path.basename(ruta)[:-5]] = extraer(ruta)
    # Las tarjetas de "Otros proyectos" se arman con la 1.ª foto, el tipo y el nombre del otro proyecto.
    for slug, d in todos.items():
        for otro, foto, tipo, nombre in d.pop("_tarjetas"):
            o = todos[otro]
            assert (foto, tipo, nombre) == (o["fotos"][0], o["tipo"]["es"], o["nombre"]["es"]), (slug, otro)
    os.makedirs("datos/proyectos", exist_ok=True)
    for slug, d in todos.items():
        with open("datos/proyectos/%s.json" % slug, "w", encoding="utf-8") as f:
            json.dump(d, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print("escribe datos/proyectos/%s.json" % slug)

if __name__ == "__main__":
    main()
