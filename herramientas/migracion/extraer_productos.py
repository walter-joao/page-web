"""Migración (se usa una sola vez): lee las páginas actuales productos/*.html y escribe
datos/productos/<slug>.json, que luego genera herramientas/generar_paginas.py con la plantilla
herramientas/plantillas/producto.html.

Uso:  python3 herramientas/migracion/extraer_productos.py
      python3 herramientas/generar_paginas.py --revisar   # debe decir 0 cambios en productos/

Se puede volver a correr si otra rama cambió el HTML de los productos (sobrescribe los JSON y
herramientas/plantillas/estilos/<slug>.css). Lo que se puede calcular (URLs de fotos, alt de la
galería, enlace de WhatsApp, canonical, og:*, JSON-LD, datos de contacto, nombre y grupo de los
productos relacionados) NO se guarda: el script comprueba que coincide con lo que calcula la
plantilla y se detiene si alguna página no sigue la regla.
"""
import glob, json, os, re, sys, urllib.parse
from bs4 import BeautifulSoup, NavigableString

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(RAIZ)
SITIO = json.load(open("datos/sitio.json", encoding="utf-8"))


def vimg(url, w):
    return "/_vercel/image?url=" + urllib.parse.quote(url, safe="") + "&w=%d&q=75" % w


def src_a_foto(src, w):
    """Inverso de la macro foto_src de la plantilla: de la URL publicada saca la ruta de la foto.
    Las fotos propias ya optimizadas (/img/obras/...) van directas, sin el optimizador de Vercel."""
    m = re.fullmatch(r"/_vercel/image\?url=([^&]+)&w=(\d+)&q=75", src)
    if m:
        check(int(m.group(2)) == w, "ancho de foto %s" % src)
        return urllib.parse.unquote(m.group(1))
    check(src.startswith("/img/obras/"), "foto directa fuera de /img/obras: " + src)
    return src


def check(cond, msg):
    if not cond:
        sys.exit("ERROR: " + msg)


def t(el):
    """Texto en 3 idiomas: español = contenido del elemento (puede llevar <strong>, <br/>), inglés/chino = atributos."""
    return {"es": el.decode_contents(), "en": el["data-en"], "zh": el["data-zh"]}


def elementos(el):
    """Hijos que son etiquetas; comprueba que entre ellos solo hay saltos de línea (los pone la plantilla)."""
    hijos = []
    for c in el.children:
        if isinstance(c, NavigableString):
            check(str(c) == "\n", "texto suelto %r en <%s>" % (str(c), el.name))
        else:
            hijos.append(c)
    return hijos


def bloque(el, nombre):
    """Un bloque del cuerpo de la ficha (contenido que vino de WordPress)."""
    if el.name in ("h2", "h3", "h4", "p"):
        check(set(el.attrs) == {"data-en", "data-zh"}, "atributos raros en %s" % el)
        return {"tipo": el.name, **t(el)}
    if el.name in ("ul", "ol"):
        check(not el.attrs, "atributos en lista")
        items = []
        for li in el.children:
            check(getattr(li, "name", None) == "li" and set(li.attrs) == {"data-en", "data-zh"}, "lista con %r" % li)
            items.append(t(li))
        return {"tipo": el.name, "items": items}
    if el.name == "figure":
        a, img = el.a, el.a.img
        foto = img["data-o"]
        check(el["class"] == ["pp-fig"] and a["href"] == foto and img["src"] == vimg(foto, 640), "figura rara")
        b = {"tipo": "figura", "foto": foto}
        if img["alt"] != nombre:  # por defecto el alt es el nombre del producto
            b["alt"] = img["alt"]
        return b
    sys.exit("ERROR: bloque desconocido <%s>" % el.name)


def extraer(ruta):
    slug = os.path.basename(ruta)[:-5]
    soup = BeautifulSoup(open(ruta, encoding="utf-8").read(), "html.parser")
    html = soup.html
    p = {
        "titulo": {"es": soup.title.string, "en": html["data-title-en"], "zh": html["data-title-zh"]},
        "descripcion": {"es": soup.find("meta", attrs={"name": "description"})["content"],
                        "en": html["data-desc-en"], "zh": html["data-desc-zh"]},
    }
    hero = soup.find("section", class_="pp-hero").div
    p["nombre"] = t(hero.h1)
    nombre = p["nombre"]["es"]
    p["lead"] = t(hero.find("p", class_="pp-lead"))

    # Grupo (migas de pan: Inicio / Productos / grupo). "pagina" se completa en main().
    miga = hero.find("nav", class_="crumb").find_all(["a", "span"])[2]
    p["grupo"] = {"nombre": t(miga), "pagina": miga["href"].rsplit("/", 1)[1] if miga.name == "a" else None}
    texto_grupo = "%s · %s, %s, %s" % (p["grupo"]["nombre"]["es"], SITIO["marca"],
                                       SITIO["direccion"].rsplit(", ", 1)[1], SITIO["pais"]["es"])
    check(hero.find("p", class_="grupo").decode_contents() == texto_grupo, "línea de grupo en " + slug)

    # Catálogo (botones "Ver catálogo" y "Descargar PDF"), opcional
    cta = hero.find("div", class_="cta-row")
    ver = cta.find("a", href=re.compile(r"^/#catalogo"))
    if ver:
        pdf = cta.find("a", download=True)
        p["catalogo"] = {"ancla": ver["href"][2:], "pdf": pdf["href"], "descarga": pdf["download"]}
    wa = cta.find("a", class_="btn-accent")["href"]
    check(wa == "https://wa.me/%s?text=%s" % (SITIO["whatsapp"], urllib.parse.quote(
        "Hola, quisiera una cotización de %s." % nombre, safe="")), "enlace de WhatsApp distinto en " + slug)

    # Fotos de la galería (solo rutas; las URL y el alt los arma la plantilla)
    p["fotos"] = []
    gal = hero.find("div", class_="pp-gal")
    if gal:
        for i, img in enumerate(gal.find_all("img"), 1):
            foto = img["data-o"]
            check(img["alt"] == "%s – %s (foto %d)" % (nombre, SITIO["marca"], i), "alt de galería en " + slug)
            check(img["src"] == vimg(foto, 640), "src de galería en " + slug)
            p["fotos"].append(foto)
    og = soup.find("meta", property="og:image")
    check((og["content"] if og else None) == (p["fotos"][0] if p["fotos"] else None), "og:image distinta en " + slug)
    check(soup.find("meta", property="og:description")["content"] == p["descripcion"]["es"], "og:description")
    check(soup.find("meta", property="og:title")["content"] == "%s · %s" % (nombre, SITIO["marca"]), "og:title")

    # Estilo propio de la página (solo infraestructura-metalica): va a herramientas/plantillas/estilos/<slug>.css
    estilo = soup.head.find("style")
    if estilo:
        p["estilo"] = slug
        os.makedirs("herramientas/plantillas/estilos", exist_ok=True)
        with open("herramientas/plantillas/estilos/%s.css" % slug, "w", encoding="utf-8") as f:
            f.write(estilo.string)

    # Cuerpo
    cuerpo = soup.find("section", class_="pp-body").div
    art = cuerpo.find("article", class_="pp-txt")
    if art:
        p["cuerpo"] = [bloque(el, nombre) for el in elementos(art)]
    else:
        p.update(extraer_lineas(cuerpo))

    # Productos relacionados: solo los slugs (nombre y grupo salen del JSON de cada uno; se comprueba en main)
    p["relacionados"] = []
    for a in soup.find("section", class_="pp-rel").find("div", class_="pp-cards").find_all("a"):
        if a["href"] != "/#productos":
            p["relacionados"].append({"slug": a["href"].rsplit("/", 1)[1], "es": a.decode_contents(),
                                      "en": a["data-en"], "zh": a["data-zh"]})
    return slug, p


def extraer_lineas(cuerpo):
    """Página infraestructura-metalica: tarjetas de líneas, 'También fabricamos' y fichas propias."""
    lineas = []
    for a in cuerpo.find("div", class_="il-grid").find_all("a", class_="il-card"):
        img, b = a.img, a.div.b
        check(img["alt"] == "%s – %s" % (b.string, SITIO["marca"]), "alt de línea")
        lineas.append({"titulo": t(b), "texto": t(a.div.p), "foto": src_a_foto(img["src"], 640), "enlace": a["href"]})
    mas = cuerpo.find("div", class_="il-mas")
    sub = cuerpo.find("h2", class_="il-sub")
    fichas = []
    for a in cuerpo.find("div", class_="il-fichas").find_all("a"):
        img, b = a.img, a.div.b
        check(img["alt"] == "%s – Joce Cia Ltda." % b.string, "alt de ficha")
        fichas.append({"nombre": t(b), "foto": src_a_foto(img["src"], 256), "producto": a["href"].rsplit("/", 1)[1]})
    return {"lineas": lineas,
            "tambien": {"titulo": t(mas.small), "items": [t(em) for em in mas.find_all("em")]},
            "fichas": {"titulo": t(sub), "intro": t(sub.find_next_sibling("p")), "items": fichas}}


def main():
    todos = dict(extraer(r) for r in sorted(glob.glob("productos/*.html")))
    # Páginas de grupo: las que otras fichas enlazan en sus migas. Un grupo sin página (Servicios) queda en null.
    paginas_grupo = {p["grupo"]["pagina"] for p in todos.values()} - {None}
    for slug, p in todos.items():
        if p["grupo"]["pagina"] is None and slug in paginas_grupo:
            p["grupo"]["pagina"] = slug
    # Cada tarjeta relacionada debe coincidir con el nombre y el grupo del producto enlazado
    for slug, p in todos.items():
        slugs = []
        for r in p["relacionados"]:
            o = todos[r["slug"]]
            for lang in ("es", "en", "zh"):
                check(r[lang] == "<small>%s</small>%s" % (o["grupo"]["nombre"][lang], o["nombre"][lang]),
                      "relacionado %s en %s (%s): %r" % (r["slug"], slug, lang, r[lang]))
            slugs.append(r["slug"])
        p["relacionados"] = slugs
    os.makedirs("datos/productos", exist_ok=True)
    for slug, p in todos.items():
        with open("datos/productos/%s.json" % slug, "w", encoding="utf-8") as f:
            json.dump(p, f, ensure_ascii=False, indent=2)
            f.write("\n")
    print("escritos %d archivos en datos/productos/" % len(todos))


if __name__ == "__main__":
    main()
