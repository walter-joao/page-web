#!/usr/bin/env python3
"""Genera una página HTML estática por proyecto en /proyectos/.

Los textos y fotos salen del objeto PRODS de index.html (entradas pr1, pr2, ...),
el mismo que usa el mapa de obras. Aquí solo se agregan la URL, la ubicación y el
cliente de cada obra. Para regenerar después de cambiar index.html:

    python3 herramientas/generar_proyectos.py
"""
import html
import json
import os
import re
from urllib.parse import quote

import generar_productos as gp

RAIZ = gp.RAIZ
DOMINIO = gp.DOMINIO
WA = gp.WA

# pr -> datos de la página. "apx": la ubicación es aproximada (falta confirmarla con Jocecia).
# "mapa": id de la obra en el mapa de la portada (OBRAS en index.html), si tiene punto.
PROYECTOS = [
    {"pr": "pr7", "slug": "vista-valle-coral-center", "lugar": "Valle de los Chillos, Pichincha", "mapa": "vistavalle"},
    {"pr": "pr8", "slug": "colegio-americano", "lugar": "Puembo, Quito, Pichincha", "apx": True, "mapa": "colegio"},
    {"pr": "pr9", "slug": "proyecto-bauhaus", "lugar": "Quito, Pichincha", "apx": True, "mapa": "bauhaus"},
    {"pr": "pr10", "slug": "carls-jr-olive-garden-quito", "lugar": "Quito, Pichincha", "apx": True, "mapa": "carls"},
    {"pr": "pr1", "slug": "metro-de-quito", "lugar": "Quito, Pichincha", "cliente": "Metro de Quito", "mapa": "metro"},
    {"pr": "pr3", "slug": "central-manduriacu", "lugar": "Río Guayllabamba, Pichincha / Imbabura", "cliente": "CELEC EP", "mapa": "manduriacu"},
    {"pr": "pr2", "slug": "central-agoyan", "lugar": "Baños de Agua Santa, Tungurahua", "cliente": "CELEC EP", "mapa": "agoyan"},
    {"pr": "pr4", "slug": "central-san-francisco", "lugar": "Río Verde, Baños, Tungurahua", "cliente": "CELEC EP", "mapa": "sanfco"},
    {"pr": "pr11", "slug": "tunel-banos", "lugar": "Baños de Agua Santa, Tungurahua", "apx": True, "mapa": "tunel"},
    # sin ubicación confirmada: no va en el mapa; se llega desde Galpones en /productos/infraestructura-metalica
    {"pr": "pr5", "slug": "galpon-cadeco"},
]

# Fuera de la web por ahora (2026-11-10): falta que Jocecia confirme ubicación, año y fotos.
# Para volver a publicarlas, devolverlas a PROYECTOS y restaurar las tarjetas en index.html.
PENDIENTES = [
    {"pr": "pr6", "slug": "funvivalt-monserrat", "cliente": "Funvivalt"},
]

CSS_PROY = """
.pj-meta{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 24px;padding:0;list-style:none}
.pj-meta li{padding:8px 14px;border-radius:999px;background:var(--surface);border:1px solid var(--line);font-size:.92rem}
.pj-meta li b{font-family:var(--f-mono);font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);font-weight:400;margin-right:8px}
.pj-gal{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:220px;gap:12px;margin:34px 0 0}
.pj-gal a{display:block;border-radius:18px;overflow:hidden;background:var(--surface)}
.pj-gal a:first-child{grid-column:span 2;grid-row:span 2}
.pj-gal img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
.pj-gal a:hover img{transform:scale(1.04)}
.pj-gal.n4 a:last-child{grid-column:span 3}
.pj-gal.n1{grid-template-columns:1fr;grid-auto-rows:auto}.pj-gal.n1 a:first-child{grid-column:auto;grid-row:auto}.pj-gal.n1 img{max-height:640px}
@media (max-width:700px){.pj-gal.n4 a:last-child{grid-column:span 2}.pj-gal{grid-template-columns:1fr 1fr;grid-auto-rows:150px}.pj-gal a:first-child{grid-column:span 2;grid-row:span 2}}
.pj-list{list-style:none;padding:0!important;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}
.pj-list li{margin:0!important;padding:16px 18px;border-radius:16px;background:var(--surface);border:1px solid var(--line)}
.pj-list li::before{content:"";display:inline-block;width:8px;height:8px;border-radius:2px;background:var(--cyan);margin-right:10px;vertical-align:middle}
.pj-nota{font-size:.88rem;color:var(--muted)}
.pj-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.pj-cards a{position:relative;display:block;height:170px;border-radius:18px;overflow:hidden;text-decoration:none;color:#fff;isolation:isolate}
.pj-cards a img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2;transition:transform .6s ease}
.pj-cards a::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,transparent 35%,rgba(5,10,20,.88))}
.pj-cards a:hover img{transform:scale(1.05)}
.pj-cards a span{position:absolute;left:16px;right:16px;bottom:14px;font-weight:700;line-height:1.2}
.pj-cards a small{display:block;font-family:var(--f-mono);font-size:.66rem;letter-spacing:.12em;text-transform:uppercase;opacity:.75;font-weight:400;margin-bottom:4px}
"""


def src(url, w):
    """Fotos propias (/img/...) se sirven tal cual; las de jocecia.com pasan por el optimizador."""
    return url if url.startswith("/") else gp.img_opt(url, w)


def foto(url, alt, w=1080, eager=False):
    return '<img decoding="async"%s src="%s" alt="%s">' % ("" if eager else ' loading="lazy"', src(url, w), html.escape(alt))


def grande(url):
    return url if url.startswith("/") else re.sub(r"&amp;", "&", gp.img_opt(url, 1920))


def pagina(p, d, todos, css_base, head_comun):
    es = d["es"]
    nombre = es["t"]
    url = "%s/proyectos/%s" % (DOMINIO, p["slug"])
    desc = "%s %s Obra de Joce Cia Ltda., Sangolquí, Ecuador." % (es["d"], ("en " + p["lugar"].split(",")[0] + ".") if p.get("lugar") else "")
    desc = re.sub(r"\s+", " ", desc).strip()
    imgs = d.get("img", [])
    wa = quote("Hola, vi el proyecto %s en su web y quisiera cotizar algo similar." % nombre)
    botones = ['<a class="btn btn-accent" href="https://wa.me/%s?text=%s" target="_blank" rel="noopener">Cotizar un proyecto similar</a>' % (WA, wa)]
    if p.get("mapa"):
        botones.append('<a class="btn btn-line" href="/#obra-%s">Ver en el mapa</a>' % p["mapa"])
    botones.append('<a class="btn btn-line" href="/#proyectos">Todos los proyectos</a>')
    meta = ['<li><b>Tipo</b>%s</li>' % html.escape(es["k"])]
    if p.get("lugar"):
        meta.append('<li><b>Ubicación</b>%s%s</li>' % (html.escape(p["lugar"]), " (aprox.)" if p.get("apx") else ""))
    if p.get("cliente"):
        meta.append('<li><b>Cliente</b>%s</li>' % html.escape(p["cliente"]))
    gal = ""
    if imgs:
        gal = '<div class="pj-gal n%d">%s</div>' % (len(imgs), "".join(
            '<a href="%s" target="_blank" rel="noopener">%s</a>' % (html.escape(grande(u)), foto(u, "%s – Joce Cia Ltda. (foto %d)" % (nombre, i + 1), 1920 if i == 0 else 1080, eager=(i == 0)))
            for i, u in enumerate(imgs)))
    lista = '<ul class="pj-list">%s</ul>' % "".join("<li>%s</li>" % html.escape(f) for f in es.get("f", []))
    nota = ('<p class="pj-nota">Ubicación aproximada.</p>' if p.get("apx") else "")
    otros = [q for q in PROYECTOS if q["slug"] != p["slug"]][:6]
    otros_html = "".join('<a href="/proyectos/%s">%s<span><small>%s</small>%s</span></a>' % (
        q["slug"], foto(todos[q["pr"]]["img"][0], todos[q["pr"]]["es"]["t"], 640) if todos[q["pr"]].get("img") else "",
        html.escape(todos[q["pr"]]["es"]["k"]), html.escape(todos[q["pr"]]["es"]["t"])) for q in otros)
    abs_img = [(DOMINIO + u) if u.startswith("/") else u for u in imgs]
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "CreativeWork", "name": nombre, "description": desc, "url": url, "image": abs_img[:3],
         "creator": {"@id": DOMINIO + "/#empresa"}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Inicio", "item": DOMINIO + "/"},
            {"@type": "ListItem", "position": 2, "name": "Proyectos", "item": DOMINIO + "/#proyectos"},
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
<title>{nombre_e} · Proyectos · Joce Cia Ltda.</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
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
{css_extra}
{css_proy}</style>
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
      <nav class="crumb" aria-label="Ruta"><a href="/">Inicio</a> / <a href="/#proyectos">Proyectos</a> / <span>{tipo}</span></nav>
      <h1>{nombre_e}</h1>
      <p class="pp-lead">{lead}</p>
      <ul class="pj-meta">{meta}</ul>
      <div class="cta-row">{botones}</div>
      {galeria}
    </div>
  </section>
  <section class="pp-body">
    <div class="wrap"><article class="pp-txt" style="max-width:none">
<h2>{h}</h2>
{lista}
{nota}
    </article></div>
  </section>
  <section class="pp-rel">
    <div class="wrap"><h2>Otros proyectos</h2><div class="pj-cards">{otros}</div></div>
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
""".format(nombre_e=html.escape(nombre), desc=html.escape(desc), url=url,
           ogimg=('<meta property="og:image" content="%s">\n' % html.escape(abs_img[0])) if abs_img else "",
           head_comun=head_comun, ld=json.dumps(ld, ensure_ascii=False, indent=1), css_base=css_base,
           css_extra=gp.CSS_EXTRA, css_proy=CSS_PROY,
           logo=gp.img_opt("https://jocecia.com/portal/wp-content/uploads/2025/02/LOGO-JOCECIA-1024x530.png", 384),
           tipo=html.escape(es["k"]), lead=html.escape(es["d"]), meta="".join(meta), botones="".join(botones),
           galeria=gal, h=html.escape(es.get("h", "Trabajos realizados")), lista=lista, nota=nota,
           otros=otros_html, script=gp.SCRIPT)


def main():
    idx = open(os.path.join(RAIZ, "index.html"), encoding="utf-8").read()
    estilos = re.findall(r"<style>(.*?)</style>", idx, re.S)
    css_base = max(estilos, key=len)
    fuentes = re.search(r'(<link rel="preconnect".*?display=swap">)', idx, re.S).group(1)
    fallback = re.search(r"(<script>\s*/\* Si el optimizador.*?</script>)", idx, re.S).group(1)
    head_comun = ('<link rel="icon" href="https://jocecia.com/portal/wp-content/uploads/2020/04/cropped-icono-270x270.png">\n'
                  '<style>:root{padding-top:env(safe-area-inset-top,0px)}body{margin:0}img{max-width:100%}</style>\n'
                  + fallback + "\n" + fuentes)
    todos = json.loads(re.search(r"var PRODS=(\{.*?\});\n", idx, re.S).group(1))
    os.makedirs(os.path.join(RAIZ, "proyectos"), exist_ok=True)
    for p in PROYECTOS:
        open(os.path.join(RAIZ, "proyectos", p["slug"] + ".html"), "w", encoding="utf-8").write(
            pagina(p, todos[p["pr"]], todos, css_base, head_comun))
    # sitemap: se agregan (o actualizan) las URL de proyectos
    sm = os.path.join(RAIZ, "sitemap.xml")
    xml = open(sm, encoding="utf-8").read()
    xml = re.sub(r"\s*<url><loc>[^<]*/proyectos/[^<]*</loc>.*?</url>", "", xml)
    nuevas = "".join("\n  <url><loc>%s/proyectos/%s</loc><lastmod>2026-11-10</lastmod><priority>0.7</priority></url>" % (DOMINIO, p["slug"]) for p in PROYECTOS)
    xml = xml.replace("\n</urlset>", nuevas + "\n</urlset>")
    open(sm, "w", encoding="utf-8").write(xml)
    print("Generadas:", ", ".join(p["slug"] for p in PROYECTOS))


if __name__ == "__main__":
    main()
