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
from bs4 import BeautifulSoup, Comment, NavigableString
from urllib.parse import quote

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOMINIO = "https://www.jocecia.com"
WA = "593964068392"
HOY = "2026-11-09"

# Textos de botones y del bloque de contacto que WordPress repite en cada página
OMITIR = re.compile(r"^(visítanos|llámanos|contáctanos|contactar|ver catálogo|ver catalogo|especiales)$", re.I)
CONTACTO = re.compile(r"^(visítanos|llámanos|contáctanos)$", re.I)
BLOQUES = {"p", "ul", "ol", "table", "h1", "h2", "h3", "h4", "h5", "h6", "div", "section", "article",
           "figure", "li", "blockquote", "details", "summary", "header", "footer", "nav", "form"}


def norm(t):
    return re.sub(r"\s+", " ", t).strip()


def inline(nodos, arriba=True):
    """HTML en línea con el texto tal cual: solo conserva negritas, cursivas y saltos de línea."""
    out = []
    for n in nodos:
        if isinstance(n, NavigableString):
            if isinstance(n, Comment):
                continue
            out.append(html.escape(str(n), quote=False))
        elif n.name == "br":
            out.append("<br>")
        elif n.name in ("strong", "b"):
            dentro = inline(n.children, False)
            out.append("<strong>%s</strong>" % dentro if norm(re.sub("<[^>]+>", "", dentro)) else dentro)
        elif n.name in ("em", "i"):
            out.append("<em>%s</em>" % inline(n.children, False))
        elif n.name == "img":
            continue
        elif n.name in ("p", "div", "li"):
            out.append(inline(n.children, False) + "<br>")
        else:
            out.append(inline(n.children, False))
    t = re.sub(r"\s+", " ", "".join(out))
    if not arriba:
        return t
    t = re.sub(r"(\s*<br>\s*)+$", "", re.sub(r"^(\s*<br>\s*)+", "", t))
    t = re.sub(r"(\s*<br>\s*){2,}", "<br>", t)
    return t.strip()


def texto(h):
    return norm(html.unescape(re.sub("<[^>]+>", "", h)))


def extraer(fuente):
    """Convierte el HTML de WordPress (Themify Builder) en bloques, sin tocar el texto."""
    sopa = BeautifulSoup(fuente, "html.parser")
    for t in sopa(["script", "style", "noscript", "svg", "iframe"]):
        t.decompose()
    imgs, pdfs = [], []
    for a in sopa.find_all("a", href=True):
        if a["href"].lower().endswith(".pdf"):
            pdfs.append(a["href"])
    for b in sopa.select(".module-buttons"):
        b.decompose()
    # acordeones: el título pasa a subtítulo y el contenido queda debajo
    for t in sopa.select(".accordion-title"):
        h = sopa.new_tag("h2")
        h.string = norm(t.get_text())
        t.replace_with(h)
    for ul in sopa.select("ul.module-accordion"):
        for li in ul.find_all("li", recursive=False):
            li.unwrap()
        ul.unwrap()

    bloques = []
    estado = {"fin": False}

    def emitir(tipo, contenido):
        if estado["fin"]:
            return
        if tipo != "lista":
            t = texto(contenido)
            if not t:
                return
            if CONTACTO.match(t):
                estado["fin"] = True
                return
            if OMITIR.match(t):
                return
        bloques.append((tipo, contenido))

    def recorrer(nodo):
        buf = []

        def vaciar():
            if buf:
                emitir("p", inline(buf))
                buf.clear()

        for n in list(nodo.children):
            if isinstance(n, Comment):
                continue
            if isinstance(n, NavigableString) or n.name not in BLOQUES and n.name != "img":
                if n.name is not None and n.find("img"):
                    for im in n.find_all("img"):
                        src = im.get("data-src") or im.get("src") or ""
                        if "wp-content/uploads" in src and src not in imgs:
                            imgs.append(src)
                buf.append(n)
                continue
            vaciar()
            if n.name == "img":
                src = n.get("data-src") or n.get("src") or ""
                if "wp-content/uploads" in src:
                    if n.find_parent(class_="tb_text_wrap"):
                        # tablas y figuras dentro del texto: van en su sitio
                        if not estado["fin"]:
                            bloques.append(("img", {"src": src, "alt": n.get("alt") or ""}))
                    elif src not in imgs:
                        imgs.append(src)
            elif n.name in ("h1", "h2", "h3", "h4", "h5", "h6", "summary"):
                emitir("h2" if n.name == "summary" else n.name, inline(n.children))
            elif n.name == "p":
                emitir("p", inline(n.children))
                for im in n.find_all("img"):
                    src = im.get("src") or ""
                    if "wp-content/uploads" in src and not estado["fin"]:
                        bloques.append(("img", {"src": src, "alt": im.get("alt") or ""}))
            elif n.name in ("ul", "ol"):
                items = [inline(li.children) for li in n.find_all("li", recursive=False)]
                items = [i for i in items if texto(i)]
                if items and not estado["fin"]:
                    bloques.append(("lista", {"tipo": n.name, "items": items}))
            elif n.name == "table":
                filas = []
                for tr in n.find_all("tr"):
                    filas.append([(c.name, inline(c.children)) for c in tr.find_all(["td", "th"])])
                if filas and not estado["fin"]:
                    bloques.append(("tabla", filas))
            else:
                recorrer(n)
        vaciar()

    recorrer(sopa)
    return bloques, imgs, pdfs



def corregir(slug, bloques, cfg):
    """Aplica las correcciones aprobadas (herramientas/correcciones.json) sobre el texto original."""
    usados = set()

    def fx(t):
        for i, (pag, viejo, nuevo) in enumerate(cfg.get("reemplazos", [])):
            if pag in ("*", slug) and viejo in t:
                t = t.replace(viejo, nuevo)
                usados.add(i)
        if cfg.get("unir_lineas_cortadas"):
            # saltos de línea pegados desde Word a mitad de frase
            t = re.sub(r"\s*<br>\s*(?=[a-záéíóúñü])", " ", t)
        return t

    out = []
    for tipo, c in bloques:
        if tipo == "lista":
            c = {"tipo": c["tipo"], "items": [fx(i) for i in c["items"]]}
        elif tipo == "tabla":
            c = [[(t, fx(v)) for t, v in fila] for fila in c]
        elif tipo != "img":
            c = fx(c)
        out.append((tipo, c))
    if cfg.get("quitar_secciones_repetidas"):
        # un título seguido de la misma lista que el título anterior igual: se deja una sola vez
        limpio, vistos = [], set()
        i = 0
        while i < len(out):
            t, c = out[i]
            if t in ("h2", "h3") and i + 1 < len(out) and out[i + 1][0] == "lista":
                clave = (texto(c).upper(), tuple(out[i + 1][1]["items"]))
                if clave in vistos:
                    i += 2
                    continue
                vistos.add(clave)
            limpio.append(out[i])
            i += 1
        out = limpio
    return out, usados

def plano(t):
    return texto(t)


_MAPA_WP = None


def localizar(s):
    """Cambia los enlaces a fotos de jocecia.com por su copia en /img/wp/ (ver traer_fotos_wp.py)."""
    global _MAPA_WP
    if _MAPA_WP is None:
        f = os.path.join(RAIZ, "herramientas", "fotos-wp.json")
        _MAPA_WP = json.load(open(f)) if os.path.exists(f) else {}
    for remoto, local in _MAPA_WP.items():
        if remoto in s:
            s = s.replace(remoto, local)
        q = quote(remoto, safe="")
        if q in s:
            s = s.replace(q, quote(local, safe=""))
    return s


def img_opt(url, w):
    return "/_vercel/image?url=%s&amp;w=%d&amp;q=75" % (quote(url, safe=""), w)


def foto(url, alt, sizes="(max-width: 700px) 100vw, 33vw", eager=False):
    srcset = ", ".join("%s %dw" % (img_opt(url, w), w) for w in (384, 640, 1080))
    return ('<img decoding="async"%s src="%s" srcset="%s" sizes="%s" data-o="%s" alt="%s">'
            % ("" if eager else ' loading="lazy"', img_opt(url, 640), srcset, sizes,
               html.escape(url), html.escape(alt)))


def unir_listas(bloques):
    """WordPress a veces pone cada punto en su propia lista: se juntan las seguidas."""
    out = []
    for b in bloques:
        if b[0] == "lista" and out and out[-1][0] == "lista" and out[-1][1]["tipo"] == b[1]["tipo"]:
            out[-1] = ("lista", {"tipo": b[1]["tipo"], "items": out[-1][1]["items"] + b[1]["items"]})
        else:
            out.append(b)
    return out


def cuerpo_html(bloques, nombre):
    bloques = unir_listas(bloques)
    out = []
    primero_h1 = True
    for tipo, c in bloques:
        if tipo == "h1" and primero_h1:
            primero_h1 = False  # el H1 de la plantilla ya lo muestra
            continue
        if tipo in ("h1", "h2"):
            out.append("<h2>%s</h2>" % c)
        elif tipo == "h3":
            out.append("<h3>%s</h3>" % c)
        elif tipo in ("h4", "h5", "h6"):
            out.append("<h4>%s</h4>" % c)
        elif tipo == "lista":
            tag = c["tipo"]
            out.append("<%s>%s</%s>" % (tag, "".join("<li>%s</li>" % i for i in c["items"]), tag))
        elif tipo == "img":
            alt = c["alt"] if c["alt"] and not re.match(r"^(IMG|WhatsApp|th\b|\d)", c["alt"]) else nombre
            out.append('<figure class="pp-fig"><a href="%s" target="_blank" rel="noopener">%s</a></figure>' % (
                html.escape(c["src"]), foto(c["src"], alt, sizes="(max-width: 800px) 100vw, 760px")))
        elif tipo == "tabla":
            out.append('<div class="pp-tabla"><table>%s</table></div>' % "".join(
                "<tr>%s</tr>" % "".join("<%s>%s</%s>" % (t, v, t) for t, v in fila) for fila in c))
        else:
            out.append("<p>%s</p>" % c)
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
.pp-hero .pp-lead{font-size:clamp(1.08rem,1.6vw,1.28rem);line-height:1.55;max-width:62ch;margin:0 0 14px;color:var(--fg)}
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
.pp-fig{margin:16px 0}.pp-fig img{border-radius:10px;background:#fff;max-width:100%;height:auto}
.pp-tabla{overflow-x:auto;margin:16px 0}.pp-tabla table{border-collapse:collapse;font-size:.92rem}.pp-tabla td,.pp-tabla th{border:1px solid var(--line);padding:6px 10px;text-align:left}
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
    desc = p.get("desc") or descripcion(bloques, nombre)
    galeria = imgs or p.get("imgs", [])
    wa_txt = quote("Hola, quisiera una cotización de %s." % nombre)
    pdf = p.get("pdf")
    botones = ['<a class="btn btn-accent" href="https://wa.me/%s?text=%s" target="_blank" rel="noopener">Cotizar por WhatsApp</a>' % (WA, wa_txt)]
    if pdf:
        nom = pdf.rsplit("/", 1)[-1][:-4]
        botones.append('<a class="btn btn-line" href="/#catalogo-%s">Ver catálogo</a>' % nom)
        botones.append('<a class="btn btn-line" href="%s" target="_blank" rel="noopener" download>Descargar PDF</a>' % pdf)
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
      <a href="/#proyectos">Proyectos</a><a href="/#sectores">Soluciones</a><a href="/#productos">Productos</a><a href="/#nosotros">Nosotros</a><a href="/#empleo">Trabaja con nosotros</a><a href="/#contacto">Contacto</a>
    </nav>
    <div class="tools"><button type="button" class="round" id="theme" aria-label="Cambiar tema claro u oscuro"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button></div>
  </div>
</header>
<main id="contenido">
  <section class="pp-hero">
    <div class="wrap">
      <nav class="crumb" aria-label="Ruta"><a href="/">Inicio</a> / <a href="/#productos">Productos</a> / <span>{grupo}</span></nav>
      <h1>{nombre_e}</h1>
      {intro}<p class="grupo">{grupo} · Joce Cia Ltda., Sangolquí, Ecuador</p>
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
           css_extra=CSS_EXTRA, logo=img_opt("/img/wp/2025/02/LOGO-JOCECIA-1024x530.png", 384),
           grupo=html.escape(p["grupo"]), botones="".join(botones), galeria=gal_html,
           intro=('<p class="pp-lead">%s</p>\n      ' % html.escape(p["intro"])) if p.get("intro") else "",
           cuerpo=cuerpo_html(bloques, nombre), rel=rel_html, script=SCRIPT)


def main():
    idx = open(os.path.join(RAIZ, "index.html"), encoding="utf-8").read()
    estilos = re.findall(r"<style>(.*?)</style>", idx, re.S)
    css_base = max(estilos, key=len)
    fuentes = re.search(r'(<link rel="preconnect".*?display=swap">)', idx, re.S).group(1)
    fallback = re.search(r"(<script>\s*/\* Si el optimizador.*?</script>)", idx, re.S).group(1)
    head_comun = ('<link rel="icon" href="/img/wp/2020/04/cropped-icono-270x270.png">\n'
                  '<style>:root{padding-top:env(safe-area-inset-top,0px)}body{margin:0}img{max-width:100%}</style>\n'
                  + fallback + "\n" + fuentes)

    productos = json.load(open(os.path.join(RAIZ, "herramientas", "productos.json"), encoding="utf-8"))
    todos = {p["slug"]: p for p in productos}
    ruta_fuente = os.environ.get("FUENTE") or os.path.join(RAIZ, "herramientas", "fuente-wp.json")
    if not os.path.exists(ruta_fuente):
        sys.exit("Falta herramientas/fuente-wp.json (export de wp-json/wp/v2/pages). No se genera nada para no inventar texto.")
    wp = {pg["slug"]: pg for pg in json.load(open(ruta_fuente, encoding="utf-8"))}

    ruta_corr = os.path.join(RAIZ, "herramientas", "correcciones.json")
    cfg = json.load(open(ruta_corr, encoding="utf-8")) if os.path.exists(ruta_corr) else {}
    usados_total = set()
    os.makedirs(os.path.join(RAIZ, "productos"), exist_ok=True)
    hechos, faltan = [], []
    for p in productos:
        pg = wp.get(p["wp"])
        if not pg:
            faltan.append(p["wp"])
            continue
        bloques, imgs, _ = extraer(pg["content"]["rendered"])
        bloques, usados = corregir(p["slug"], bloques, cfg)
        usados_total |= usados
        open(os.path.join(RAIZ, "productos", p["slug"] + ".html"), "w", encoding="utf-8").write(
            localizar(pagina(p, todos, bloques, imgs, css_base, head_comun)))
        hechos.append(p["slug"])

    # sitemap
    urls = [(DOMINIO + "/", "1.0")] + [("%s/productos/%s" % (DOMINIO, s), "0.8") for s in hechos]
    urls += [(DOMINIO + "/catalogos/" + f, "0.5") for f in sorted(os.listdir(os.path.join(RAIZ, "catalogos")))]
    xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    xml += ["  <url><loc>%s</loc><lastmod>%s</lastmod><priority>%s</priority></url>" % (u, HOY, pr) for u, pr in urls]
    open(os.path.join(RAIZ, "sitemap.xml"), "w").write("\n".join(xml + ["</urlset>", ""]))
    print("Generadas:", ", ".join(hechos))
    sin_uso = [r for i, r in enumerate(cfg.get("reemplazos", [])) if i not in usados_total]
    if sin_uso:
        print("Correcciones que ya no encuentran su texto:", sin_uso)
    if faltan:
        print("Sin texto en la fuente (no generadas):", ", ".join(faltan))


if __name__ == "__main__":
    main()
