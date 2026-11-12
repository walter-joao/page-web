"""Agrega la versión en inglés a las fichas de /productos y /proyectos.

Correr DESPUÉS de generar_productos.py y generar_proyectos.py:
    python3 herramientas/traducir_paginas.py

Cada texto de la página recibe un atributo data-en con su traducción, sacada de
herramientas/traducciones-en.json (texto en español -> texto en inglés). En el
encabezado se agrega el mismo botón ES/EN de la portada; el idioma elegido se
guarda en localStorage ('joce-lang'), así que se mantiene al pasar de la
portada a una ficha y al revés.

Si un texto no está en el JSON, el script lo lista al final: agregue su
traducción al JSON y vuelva a correrlo.

Chino simplificado (botón 中文): cada texto recibe también data-zh, sacado de
herramientas/traducciones-zh.json, que traduce el texto INGLÉS al chino (la misma idea que
i18n/zh.json de la portada). Si falta, la ficha muestra el inglés en modo chino.
"""
import glob, json, os, re, sys
from bs4 import BeautifulSoup

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TR = json.load(open(os.path.join(RAIZ, "herramientas", "traducciones-en.json"), encoding="utf-8"))
# Nombre del PDF al descargar, por idioma (es, en, zh). Igual que W.CATN en index.html.
CATALOGOS = {
    "alcantarillas": ["CATALOGO-ALCANTARILLAS-METALICAS", "CATALOG-METAL-CULVERTS", "金属涵管目录"],
    "postes": ["CATALOGO-POSTES-METALICOS", "CATALOG-STEEL-POLES", "金属电线杆目录"],
    "grating-tramex": ["CATALOGO-GRATING-Y-TRAMEX", "CATALOG-GRATING", "钢格板目录"],
    "pernos-bronce-silicio": ["CATALOGO-PERNOS-BRONCE-SILICIO", "CATALOG-SILICON-BRONZE-BOLTS", "硅青铜螺栓目录"],
    "resina-de-anclaje": ["CATALOGO-RESINA-DE-ANCLAJE", "CATALOG-ANCHORING-RESIN", "岩石锚固树脂药卷目录"],
    "accesorios-para-tuberia": ["CATALOGO-ACCESORIOS-PARA-TUBERIA", "CATALOG-PIPE-FITTINGS", "管道配件目录"],
}
ZH = json.load(open(os.path.join(RAIZ, "herramientas", "traducciones-zh.json"), encoding="utf-8"))

UNIDAD = {"p", "li", "h1", "h2", "h3", "h4", "h5", "td", "th", "dt", "dd", "figcaption", "small", "b", "strong",
          "span", "a", "button", "label", "summary", "caption", "em", "i"}
BLOQUE = ["p", "li", "h1", "h2", "h3", "h4", "td", "th", "div", "ul", "ol", "table", "section", "nav", "dl", "dt", "dd", "figure"]
LETRAS = re.compile("[A-Za-zÁÉÍÓÚáéíóúñÑ]{2,}")

PILL = ('<div class="pill" role="group" aria-label="Idioma / Language">'
        '<button type="button" id="lang-es" aria-pressed="true">ES</button>'
        '<button type="button" id="lang-en" aria-pressed="false">EN</button>'
        '<button type="button" id="lang-zh" aria-pressed="false" lang="zh-CN">中文</button></div>')

ZH_CSS = ('<style id="i18n-zh">html:lang(zh-CN){--f-body:"Open Sans",system-ui,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans SC",sans-serif;'
          '--f-mono:"Montserrat",Arial,"PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif;--f-display:"Montserrat",Arial,"PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif}'
          'html:lang(zh-CN) h1,html:lang(zh-CN) h2,html:lang(zh-CN) h3{line-height:1.25;letter-spacing:0}'
          '.pill button{white-space:nowrap}@media (max-width:380px){.pill button{padding:6px 8px}}</style>')

SCRIPT = r"""<script id="i18n-fichas">(function(){
var CN=%s;
var R=document.documentElement,K='joce-lang',T=document.title,M=document.querySelector('meta[name="description"]'),D=M&&M.content,L=['es','en','zh'];
function set(l){
  document.querySelectorAll('[data-en]').forEach(function(e){if(e.dataset.es==null)e.dataset.es=e.innerHTML;e.innerHTML=l==='es'?e.dataset.es:l==='zh'&&e.dataset.zh!=null?e.dataset.zh:e.dataset.en});
  R.lang=l==='zh'?'zh-CN':l;var d=R.dataset,tt=l==='zh'?d.titleZh||d.titleEn:l==='en'?d.titleEn:0,dd=l==='zh'?d.descZh||d.descEn:l==='en'?d.descEn:0;
  document.title=tt||T;if(M)M.content=dd||D;
  L.forEach(function(x){var b=document.getElementById('lang-'+x);if(b)b.setAttribute('aria-pressed',l===x)});
  document.querySelectorAll('a[href^="/catalogos/"]').forEach(function(e){var h=e.getAttribute('href').replace(/\/catalogos\/(en|zh)\//,'/catalogos/');e.setAttribute('href',l!=='es'?h.replace('/catalogos/','/catalogos/'+l+'/'):h);var n=CN[(/([a-z0-9-]+)\.pdf$/.exec(h)||[])[1]];if(n&&e.hasAttribute('download'))e.setAttribute('download',n[L.indexOf(l)]+'-JOCECIA.pdf')});
  try{localStorage.setItem(K,l)}catch(e){}}
L.forEach(function(x){var b=document.getElementById('lang-'+x);if(b)b.addEventListener('click',function(){set(x)})});
try{var s=localStorage.getItem(K);if(s==='en'||s==='zh')set(s)}catch(e){}
})();</script>""" % json.dumps(CATALOGOS, ensure_ascii=False)


def unidades(body):
    for el in body.find_all(True):
        if el.name not in UNIDAD or el.find(BLOQUE):
            continue
        if el.find_parent(class_="pill"):
            continue
        if el.find_parent(lambda t: t is not el and t.name in UNIDAD and not t.find(BLOQUE)):
            continue
        if not LETRAS.search(el.get_text(" ", strip=True)):
            continue
        yield el


def procesar(ruta, faltan):
    soup = BeautifulSoup(open(ruta, encoding="utf-8").read(), "html.parser")
    for el in unidades(soup.body):
        if "data-es" in el.attrs:
            del el["data-es"]
        es = el.decode_contents().strip()
        if es in TR:
            el["data-en"] = TR[es]
            if "data-zh" in el.attrs:
                del el["data-zh"]
            if TR[es] in ZH:
                el["data-zh"] = ZH[TR[es]]
        else:
            faltan.setdefault(es, []).append(ruta)
    html = soup.html
    t = "TITLE:" + soup.title.string
    if t in TR:
        html["data-title-en"] = TR[t][6:]
        if TR[t] in ZH:
            html["data-title-zh"] = ZH[TR[t]][6:]
    m = soup.find("meta", attrs={"name": "description"})
    if m and "META:" + m["content"] in TR:
        html["data-desc-en"] = TR["META:" + m["content"]][5:]
        if TR["META:" + m["content"]] in ZH:
            html["data-desc-zh"] = ZH[TR["META:" + m["content"]]][5:]
    for a in soup.select('a[href^="/catalogos/"][download]'):
        m = re.search(r"([a-z0-9-]+)\.pdf$", a["href"])
        if m and m.group(1) in CATALOGOS:
            a["download"] = CATALOGOS[m.group(1)][0] + "-JOCECIA.pdf"
    tools = soup.select_one("header .tools")
    if tools:
        for viejo in tools.select(".pill"):
            viejo.decompose()
        tools.insert(0, BeautifulSoup(PILL, "html.parser"))
    for viejo in soup.select("style#i18n-zh"):
        viejo.decompose()
    soup.head.append(BeautifulSoup(ZH_CSS, "html.parser"))
    viejo = soup.find("script", id="i18n-fichas")
    if viejo:
        viejo.decompose()
    soup.body.append(BeautifulSoup(SCRIPT, "html.parser"))
    open(ruta, "w", encoding="utf-8").write(str(soup))


def main():
    faltan = {}
    rutas = sorted(glob.glob(os.path.join(RAIZ, "productos", "*.html")) + glob.glob(os.path.join(RAIZ, "proyectos", "*.html")))
    for r in rutas:
        procesar(r, faltan)
    print("Páginas:", len(rutas))
    if faltan:
        print("Sin traducción (agregar a traducciones-en.json):")
        for k, v in faltan.items():
            print(" -", k[:120], "·", os.path.basename(v[0]))
        sys.exit(1)


if __name__ == "__main__":
    main()
