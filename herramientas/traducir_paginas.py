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
"""
import glob, json, os, re, sys
from bs4 import BeautifulSoup

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TR = json.load(open(os.path.join(RAIZ, "herramientas", "traducciones-en.json"), encoding="utf-8"))

UNIDAD = {"p", "li", "h1", "h2", "h3", "h4", "h5", "td", "th", "dt", "dd", "figcaption", "small", "b", "strong",
          "span", "a", "button", "label", "summary", "caption", "em", "i"}
BLOQUE = ["p", "li", "h1", "h2", "h3", "h4", "td", "th", "div", "ul", "ol", "table", "section", "nav", "dl", "dt", "dd", "figure"]
LETRAS = re.compile("[A-Za-zÁÉÍÓÚáéíóúñÑ]{2,}")

PILL = ('<div class="pill" role="group" aria-label="Idioma / Language">'
        '<button type="button" id="lang-es" aria-pressed="true">ES</button>'
        '<button type="button" id="lang-en" aria-pressed="false">EN</button></div>')

SCRIPT = """<script id="i18n-fichas">(function(){
var R=document.documentElement,K='joce-lang',T=document.title,M=document.querySelector('meta[name="description"]'),D=M&&M.content;
function set(l){
  document.querySelectorAll('[data-en]').forEach(function(e){if(e.dataset.es==null)e.dataset.es=e.innerHTML;e.innerHTML=l==='en'?e.dataset.en:e.dataset.es});
  R.lang=l;document.title=l==='en'&&R.dataset.titleEn?R.dataset.titleEn:T;
  if(M)M.content=l==='en'&&R.dataset.descEn?R.dataset.descEn:D;
  var a=document.getElementById('lang-es'),b=document.getElementById('lang-en');if(a){a.setAttribute('aria-pressed',l==='es');b.setAttribute('aria-pressed',l==='en')}
  try{localStorage.setItem(K,l)}catch(e){}}
var a=document.getElementById('lang-es'),b=document.getElementById('lang-en');
if(a){a.addEventListener('click',function(){set('es')});b.addEventListener('click',function(){set('en')})}
try{if(localStorage.getItem(K)==='en')set('en')}catch(e){}
})();</script>"""


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
        else:
            faltan.setdefault(es, []).append(ruta)
    html = soup.html
    t = "TITLE:" + soup.title.string
    if t in TR:
        html["data-title-en"] = TR[t][6:]
    m = soup.find("meta", attrs={"name": "description"})
    if m and "META:" + m["content"] in TR:
        html["data-desc-en"] = TR["META:" + m["content"]][5:]
    tools = soup.select_one("header .tools")
    if tools and not tools.select_one("#lang-es"):
        tools.insert(0, BeautifulSoup(PILL, "html.parser"))
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
