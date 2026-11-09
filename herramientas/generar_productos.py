#!/usr/bin/env python3
"""Genera una página HTML estática por producto en /productos/.

El texto de cada producto se toma TAL CUAL de la web original (WordPress de
jocecia.com/portal), exportada con la API de WordPress:

    https://jocecia.com/portal/wp-json/wp/v2/pages?per_page=100

Guarde ese archivo como herramientas/fuente-wp.json y ejecute:

    python3 herramientas/generar_productos.py

La lista de productos, sus URL nuevas, títulos para Google, fotos y PDF está
en herramientas/productos.json. El estilo se copia de index.html para que las
páginas se vean igual que la portada.
"""
import html
import json
import os
import re
import sys
from html.parser import HTMLParser
from urllib.parse import quote

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMINIO = "https://www.jocecia.com"
WA = "593964068392"
HOY = "2026-11-09"

# Bloques de contacto y botones que en WordPress se repiten en cada página
OMITIR = re.compile(r"^(visítanos|llámanos|contáctanos|contactar|ver catálogo|ver catalogo|especiales)$", re.I)


class Extractor(HTMLParser):
    """Convierte el HTML de WordPress/Elementor en bloques sencillos sin tocar el texto."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.bloques = []  # (tipo, contenido)
        self.imgs = []
        self.pdfs = []
        self.pila = []
        self.buf = None
        self.tipo = None
        self.lista = None
        self.saltar = 0
        self.fin = False  # True al llegar al bloque de contacto del pie

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("script", "style", "noscript", "svg"):
            self.saltar += 1
            return
        if tag == "img":
            src = a.get("data-src") or a.get("src") or ""
            if "wp-content/uploads" in src and src not in self.imgs:
                self.imgs.append(src)
            return
        if tag == "a" and (a.get("href") or "").lower().endswith(".pdf"):
            self.pdfs.append(a["href"])
        clase = a.get("class") or ""
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6", "p", "li", "td", "th", "figcaption"):
            self._cerrar()
            self.tipo, self.buf = tag, []
        elif self.buf is None and re.search(r"(tab|accordion|toggle)-title", clase):
            # títulos de los acordeones de Elementor: se muestran como subtítulos
            self._cerrar()
            self.tipo, self.buf = "h2", []
            self.cierre_titulo = tag
        elif tag in ("ul", "ol"):
            self._cerrar()
            self.lista = {"tipo": tag, "items": []}
        elif tag == "br" and self.buf is not None:
            self.buf.append("\n")
        elif tag in ("strong", "b") and self.buf is not None:
            self.buf.append("\x01")
        self.pila.append(tag)

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "svg"):
            self.saltar = max(0, self.saltar - 1)
            return
        if tag in ("strong", "b") and self.buf is not None:
            self.buf.append("\x02")
        if tag == self.tipo or (self.tipo == "h2" and getattr(self, "cierre_titulo", None) == tag):
            self._cerrar()
        if tag in ("ul", "ol") and self.lista is not None:
            self._cerrar()
            if self.lista["items"]:
                self.bloques.append(("lista", self.lista))
            self.lista = None
        if self.pila and self.pila[-1] == tag:
            self.pila.pop()

    def handle_data(self, data):
        if self.saltar:
            return
        if self.buf is not None:
            self.buf.append(data)
        elif data.strip() and not self.fin and not OMITIR.match(data.strip()):
            # texto suelto dentro de un div (Elementor lo hace a veces)
            self.bloques.append(("p", data.strip()))

    def _cerrar(self):
        if self.buf is None:
            return
        t = re.sub(r"[ \t\r\f\v]+", " ", "".join(self.buf)).strip()
        t = re.sub(r"\x01\s*\x02", "", t)
        tipo, self.buf, self.tipo = self.tipo, None, None
        limpio = t.replace("\x01", "").replace("\x02", "").strip()
        if re.match(r"^(visítanos|llámanos|contáctanos)$", limpio, re.I):
            self.fin = True
        if self.fin or not t or OMITIR.match(limpio):
            return
        if tipo == "li" and self.lista is not None:
            self.lista["items"].append(t)
        else:
            self.bloques.append((tipo, t))


def en_linea(t):
    """Escapa el texto y convierte las marcas de negrita en <strong>."""
    t = html.escape(t, quote=False)
    t = t.replace("\x01", "<strong>").replace("\x02", "</strong>").replace("\n", "<br>")
    # cierra negritas que WordPress dejó abiertas
    abiertas = t.count("<strong>") - t.count("</strong>")
    return t + "</strong>" * max(0, abiertas)


def plano(t):
    return re.sub(r"\s+", " ", t.replace("\x01", "").replace("\x02", "")).strip()


def img_opt(url, w):
    return "/_vercel/image?url=%s&amp;w=%d&amp;q=75" % (quote(url, safe=""), w)


def foto(url, alt, sizes="(max-width: 700px) 100vw, 33vw", eager=False):
    srcset = ", ".join("%s %dw" % (img_opt(url, w), w) for w in (384, 640, 1080))
    return ('<img decoding="async"%s src="%s" srcset="%s" sizes="%s" data-o="%s" alt="%s">'
            % ("" if eager else ' loading="lazy"', img_opt(url, 640), srcset, sizes,
               html.escape(url), html.escape(alt)))


def cuerpo_html(bloques, nombre):
    out = []
    primero_h1 = True
    for tipo, c in bloques:
        if tipo == "h1" and primero_h1:
            primero_h1 = False  # el H1 de la plantilla ya lo muestra
            continue
        if tipo in ("h1", "h2"):
            out.append("<h2>%s</h2>" % en_linea(c))
        elif tipo == "h3":
            out.append("<h3>%s</h3>" % en_linea(c))
        elif tipo in ("h4", "h5", "h6"):
            out.append("<h4>%s</h4>" % en_linea(c))
        elif tipo == "lista":
            tag = c["tipo"]
            out.append("<%s>%s</%s>" % (tag, "".join("<li>%s</li>" % en_linea(i) for i in c["items"]), tag))
        else:
            out.append("<p>%s</p>" % en_linea(c))
    return "\n".join(out)


def descripcion(bloques, nombre):
    for tipo, c in bloques:
        if tipo == "p" and len(plano(c)) > 60:
            t = plano(c)
            if len(t) > 155:
                t = t[:152].rsplit(" ", 1)[0] + "…"
            return t
    return "%s de Joce Cia Ltda., Sangolquí, Ecuador. Cotice por WhatsApp o descargue el catálogo." % nombre


CSS_EXTRA = """
.pp-hero{padding:132px 0 40px;background:var(--bg-2)}
.pp-hero .crumb{font-family:var(--f-mono);font-size:.76rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.pp-hero .crumb a{color:var(--cyan);text-decoration:none}
.pp-hero h1{font-size:clamp(2.2rem,5.6vw,4rem);font-weight:800;font-stretch:110%;margin:14px 0 10px;max-width:22ch}
.pp-hero .grupo{color:var(--muted);margin:0 0 22px}
.pp-gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin:34px 0 0}
.pp-gal figure{margin:0;border-radius:16px;overflow:hidden;background:var(--surface);aspect-ratio:4/3}
.pp-gal img{width:100%;height:100%;object-fit:cover;display:block}
.pp-body{padding:48px 0 24px}
.pp-txt{max-width:760px}
.pp-txt h2{font-size:clamp(1.5rem,3vw,2.1rem);margin:40px 0 14px}
.pp-txt h3{margin:30px 0 10px}
.pp-txt h4{font-family:var(--f-display);font-size:1.05rem;margin:24px 0 8px}
.pp-txt p,.pp-txt li{color:var(--fg);opacity:.9}
.pp-txt ul,.pp-txt ol{padding-left:1.2em}
.pp-txt li{margin:6px 0}
.pp-txt strong{font-weight:700;opacity:1}
.pp-rel{padding:24px 0 72px}
.pp-rel h2{font-size:clamp(1.5rem,3vw,2.1rem);margin-bottom:18px}
.pp-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.pp-cards a{display:block;padding:20px 22px;border-radius:18px;background:var(--surface);border:1px solid var(--line);text-decoration:none;font-weight:700}
.pp-cards a small{display:block;font-family:var(--f-mono);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:400;margin-bottom:6px}
.pp-cards a:hover{border-color:var(--cyan)}
.top .wrap{min-height:76px}
"""

SCRIPT = """<script>
(function(){var r=document.documentElement;try{var t=localStorage.getItem('joce-theme');if(t)r.dataset.theme=t}catch(e){}
var top=document.getElementById('top');function s(){top.classList.add('solid')}s();
document.getElementById('theme').addEventListener('click',function(){var d=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;r.dataset.theme=d?'light':'dark';try{localStorage.setItem('joce-theme',r.dataset.theme)}catch(e){}});})();
</script>"""


def pagina(p, todos, bloques, imgs, css_base, head_comun):
    nombre = p["nombre"]
    url = "%s/productos/%s" % (DOMINIO, p["slug"])
    desc = descripcion(bloques, nombre)
    galeria = imgs or p.get("imgs", [])
    wa_txt = quote("Hola, quisiera una cotización de %s." % nombre)
    pdf = p.get("pdf")
    botones = ['<a class="btn btn-accent" href="https://wa.me/%s?text=%s" target="_blank" rel="noopener">Cotizar por WhatsApp</a>' % (WA, wa_txt)]
    if pdf:
        botones.append('<a class="btn btn-line" href="%s" target="_blank" rel="noopener">Ver catálogo (PDF)</a>' % pdf)
    botones.append('<a class="btn btn-line" href="/#contacto">Contacto</a>')
    gal_html = ""
    if galeria:
        gal_html = '<div class="pp-gal">%s</div>' % "".join(
            "<figure>%s</figure>" % foto(u, "%s – Joce Cia Ltda. (foto %d)" % (nombre, i + 1), eager=(i == 0))
            for i, u in enumerate(galeria[:6]))
    rel = [todos[s] for s in p.get("rel", []) if s in todos]
    rel_html = "".join('<a href="/productos/%s"><small>%s</small>%s</a>' % (r["slug"], html.escape(r["grupo"]), html.escape(r["nombre"])) for r in rel)
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Product", "name": nombre, "description": desc, "url": url,
         "image": [g for g in galeria[:3]], "category": p["grupo"],
         "brand": {"@type": "Organization", "name": "Joce Cia Ltda."},
         "manufacturer": {"@id": DOMINIO + "/#empresa"}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Inicio", "item": DOMINIO + "/"},
            {"@type": "ListItem", "position": 2, "name": "Productos", "item": DOMINIO + "/#productos"},
            {"@type": "ListItem", "position": 3, "name": nombre, "item": url}]},
        {"@type": ["Organization", "LocalBusiness"], "@id": DOMINIO + "/#empresa", "name": "Joce Cia Ltda.",
         "url": DOMINIO + "/", "telephone": "+593 2 233 7445", "email": "compras@jocecia.com",
         "address": {"@type": "PostalAddress", "streetAddress": "Calle La Florida 2114, Barrio San Sebastián",
                     "addressLocality": "Sangolquí", "addressRegion": "Pichincha", "addressCountry": "EC"}}]}
    return """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="Joce Cia Ltda.">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{nombre_e} · Joce Cia Ltda.">
<meta property="og:description" content="{desc}">
{ogimg}<meta property="og:locale" content="es_EC">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#070d17">
<meta name="format-detection" content="telephone=no">
{head_comun}
<script type="application/ld+json">
{ld}
</script>
<style>{css_base}
{css_extra}</style>
</head>
<body>
<a class="skip" href="#contenido" style="position:absolute;left:-9999px">Saltar al contenido</a>
<header class="top solid" id="top">
  <div class="wrap">
    <a class="logo" href="/" aria-label="Joce Cia Ltda. – inicio"><img decoding="async" src="{logo}" alt="Joce Cia Ltda." width="81" height="42"></a>
    <nav class="main" aria-label="Secciones">
      <a href="/#sectores">Soluciones</a><a href="/#productos">Productos</a><a href="/#proyectos">Proyectos</a><a href="/#nosotros">Nosotros</a><a href="/#contacto">Contacto</a>
    </nav>
    <div class="tools"><button type="button" class="round" id="theme" aria-label="Cambiar tema claro u oscuro"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button></div>
  </div>
</header>
<main id="contenido">
  <section class="pp-hero">
    <div class="wrap">
      <nav class="crumb" aria-label="Ruta"><a href="/">Inicio</a> / <a href="/#productos">Productos</a> / <span>{grupo}</span></nav>
      <h1>{nombre_e}</h1>
      <p class="grupo">{grupo} · Joce Cia Ltda., Sangolquí, Ecuador</p>
      <div class="cta-row">{botones}</div>
      {galeria}
    </div>
  </section>
  <section class="pp-body">
    <div class="wrap"><article class="pp-txt">
{cuerpo}
    </article></div>
  </section>
  <section class="pp-rel">
    <div class="wrap"><h2>Productos relacionados</h2><div class="pp-cards">{rel}<a href="/#productos"><small>Catálogo</small>Todos los productos</a></div></div>
  </section>
</main>
<footer>
  <div class="wrap">
    <span>© Joce Cia Ltda. · Calle La Florida 2114, Barrio San Sebastián, Sangolquí · <a href="tel:+59322337445">(02) 233 7445</a> · <a href="mailto:compras@jocecia.com">compras@jocecia.com</a></span>
    <a href="/">Volver al inicio</a>
  </div>
</footer>
{script}
</body>
</html>
""".format(title=html.escape(p["title"]), desc=html.escape(desc), url=url, nombre_e=html.escape(nombre),
           ogimg=('<meta property="og:image" content="%s">\n' % html.escape(galeria[0])) if galeria else "",
           head_comun=head_comun, ld=json.dumps(ld, ensure_ascii=False, indent=1), css_base=css_base,
           css_extra=CSS_EXTRA, logo=img_opt("https://jocecia.com/portal/wp-content/uploads/2025/02/LOGO-JOCECIA-1024x530.png", 384),
           grupo=html.escape(p["grupo"]), botones="".join(botones), galeria=gal_html,
           cuerpo=cuerpo_html(bloques, nombre), rel=rel_html, script=SCRIPT)


def main():
    idx = open(os.path.join(RAIZ, "index.html"), encoding="utf-8").read()
    estilos = re.findall(r"<style>(.*?)</style>", idx, re.S)
    css_base = max(estilos, key=len)
    fuentes = re.search(r'(<link rel="preconnect".*?display=swap">)', idx, re.S).group(1)
    fallback = re.search(r"(<script>\s*/\* Si el optimizador.*?</script>)", idx, re.S).group(1)
    head_comun = ('<link rel="icon" href="https://jocecia.com/portal/wp-content/uploads/2020/04/cropped-icono-270x270.png">\n'
                  '<style>:root{padding-top:env(safe-area-inset-top,0px)}body{margin:0}img{max-width:100%}</style>\n'
                  + fallback + "\n" + fuentes)

    productos = json.load(open(os.path.join(RAIZ, "herramientas", "productos.json"), encoding="utf-8"))
    todos = {p["slug"]: p for p in productos}
    ruta_fuente = os.environ.get("FUENTE") or os.path.join(RAIZ, "herramientas", "fuente-wp.json")
    if not os.path.exists(ruta_fuente):
        sys.exit("Falta herramientas/fuente-wp.json (export de wp-json/wp/v2/pages). No se genera nada para no inventar texto.")
    wp = {pg["slug"]: pg for pg in json.load(open(ruta_fuente, encoding="utf-8"))}

    os.makedirs(os.path.join(RAIZ, "productos"), exist_ok=True)
    hechos, faltan = [], []
    for p in productos:
        pg = wp.get(p["wp"])
        if not pg:
            faltan.append(p["wp"])
            continue
        ex = Extractor()
        ex.feed(pg["content"]["rendered"])
        ex._cerrar()
        imgs = ex.imgs
        open(os.path.join(RAIZ, "productos", p["slug"] + ".html"), "w", encoding="utf-8").write(
            pagina(p, todos, ex.bloques, imgs, css_base, head_comun))
        hechos.append(p["slug"])

    # sitemap
    urls = [(DOMINIO + "/", "1.0")] + [("%s/productos/%s" % (DOMINIO, s), "0.8") for s in hechos]
    urls += [(DOMINIO + "/catalogos/" + f, "0.5") for f in sorted(os.listdir(os.path.join(RAIZ, "catalogos")))]
    xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    xml += ["  <url><loc>%s</loc><lastmod>%s</lastmod><priority>%s</priority></url>" % (u, HOY, pr) for u, pr in urls]
    open(os.path.join(RAIZ, "sitemap.xml"), "w").write("\n".join(xml + ["</urlset>", ""]))
    print("Generadas:", ", ".join(hechos))
    if faltan:
        print("Sin texto en la fuente (no generadas):", ", ".join(faltan))


if __name__ == "__main__":
    main()
