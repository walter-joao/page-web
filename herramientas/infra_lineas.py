"""Rehace el cuerpo de /productos/infraestructura-metalica: tarjetas con foto por línea de producto.
La página de WordPress solo traía títulos (h3) sin fotos. Ejecutar: python3 herramientas/infra_lineas.py"""
import html, re, urllib.parse, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WP = "https://jocecia.com/portal/wp-content/uploads/"
def vi(u, w=640):
    if u.startswith("/"): return u
    return "/_vercel/image?url=%s&amp;w=%d&amp;q=75" % (urllib.parse.quote(u, safe=""), w)
# (título, descripción, foto, enlace)
LINEAS = [
    ("Galpones", "Diseño, fabricación y montaje de galpones industriales y comerciales.", WP+"2021/08/Galpon2.png", "/proyectos/galpon-cadeco"),
    ("Estructuras metálicas", "Estructuras y volados para edificios, centros comerciales y obra civil.", "/img/obras/vista-valle-coral-volados.webp", "/proyectos/vista-valle-coral-center"),
    ("Cerchas para túneles", "Cerchas curvas de perfil de acero para sostenimiento de túneles.", "/img/obras/metro-cercha.webp", "/proyectos/metro-de-quito"),
    ("Escaleras", "Escaleras metálicas fijas y provisionales para estaciones y plantas.", "/img/obras/metro-rampa.webp", "/proyectos/metro-de-quito"),
    ("Pasamanos y pasarelas", "Plataformas, pasarelas y barandas de acero con acabado a pedido.", "/img/obras/metro-plataformas.webp", "/proyectos/metro-de-quito"),
    ("Rejillas", "Rejillas metálicas para drenaje, ventilación y pisos técnicos.", "/img/obras/metro-rejillas.webp", "/proyectos/metro-de-quito"),
    ("Pisos metálicos grating y tramex", "Pisos industriales de rejilla electrosoldada.", WP+"2025/02/WhatsApp-Image-2022-05-03-at-10.23.11-AM-768x1024.jpeg", "/productos/grating-tramex"),
    ("Postes", "Postes de acero para alumbrado, cableado y anclaje de estructuras.", WP+"2025/02/image003.jpg", "/productos/postes-metalicos"),
    ("Encofrados", "Encofrados verticales, trepantes, circulares y deslizantes.", WP+"2025/02/IMG-20220426-WA0011-1024x576.jpg", "/productos/encofrados"),
    ("Pernos de anclaje", "Pernos para roca, túneles y estructuras.", "/img/obras/tunel-banos-1.webp", "/productos/soporte-en-roca"),
    ("Resina para anclaje", "Cartuchos de resina para fijar pernos en roca y concreto.", WP+"2025/02/IMG_20180131_095956-1024x768-1.jpg", "/productos/resina-de-anclaje"),
    ("Accesorios para tubería", "Codos, tees, reducciones, uniones y válvulas.", WP+"2025/02/IMG-20220426-WA0008-1-1024x576.jpg", "/productos/accesorios-para-tuberias"),
    ("Pedidos especiales", "Piezas y reparaciones fabricadas según plano o muestra.", WP+"2021/08/ReparacionCilindro4-1-576x1024.png", "/productos/partes-y-piezas-especiales"),
]
# fotos de galpones hechos por Jocecia (sin la de la fachada con las puertas)
GALPONES = [WP+"2025/01/22.3.jpg", WP+"2021/08/Galpon4.png", WP+"2021/02/IMG_3333-1024x768.jpg", WP+"2021/08/Galpon3.png", WP+"2021/08/Galpon2.png"]
WA_GALPON = "https://wa.me/593964068392?text=Hola%2C%20quisiera%20una%20cotizaci%C3%B3n%20de%20un%20galp%C3%B3n."
TAMBIEN = ["Placas", "Placas de anclaje", "Disipadores de energía", "Tubería metálica"]
CSS = """
.il-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
.il-card{display:flex;flex-direction:column;border-radius:20px;overflow:hidden;background:var(--surface);border:1px solid var(--line);text-decoration:none;color:inherit;transition:border-color .3s,transform .3s}
.il-card:hover{border-color:var(--cyan);transform:translateY(-3px)}
.il-card figure{margin:0;aspect-ratio:4/3;overflow:hidden;background:var(--line)}
.il-card img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s ease}
.il-card:hover img{transform:scale(1.05)}
.il-card div{padding:16px 18px 20px}
.il-card b{display:block;font-family:var(--f-display);font-size:1.1rem;margin-bottom:6px}
.il-card p{margin:0;font-size:.92rem;opacity:.8}
.il-card span{display:inline-block;margin-top:12px;font-size:.85rem;font-weight:700;color:var(--cyan)}
.il-gal{margin-top:56px;scroll-margin-top:90px}
.il-gal h2{margin:0 0 6px;font-family:var(--f-display);font-size:clamp(1.6rem,3vw,2.2rem)}
.il-gal>p{margin:0;opacity:.8}
.il-gal .pp-gal{margin-top:20px}
.il-gal .btn-wa{display:inline-flex;margin-top:20px;padding:12px 20px;border-radius:14px;background:var(--accent);color:#fff;font-weight:700;text-decoration:none}
.il-mas{margin-top:34px;display:flex;flex-wrap:wrap;gap:10px;align-items:center}
.il-mas small{font-family:var(--f-mono);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-right:6px}
.il-mas em{font-style:normal;padding:8px 14px;border-radius:999px;background:var(--surface);border:1px solid var(--line);font-size:.92rem}
"""
def card(t, d, img, href):
    tag, attr = ("a", ' href="%s"' % href) if href else ("div", "")
    mas = '<span>Ver más ›</span>' if href else ""
    return ('<%s class="il-card"%s><figure><img decoding="async" loading="lazy" src="%s" alt="%s – Joce Cia Ltda."></figure>'
            '<div><b>%s</b><p>%s</p>%s</div></%s>') % (tag, attr, vi(img), html.escape(t), html.escape(t), html.escape(d), mas, tag)
gal = ('<div class="il-gal" id="galpones"><h2>Galpones</h2><p>%s</p><div class="pp-gal">%s</div>'
       '<a class="btn-wa" href="%s" target="_blank" rel="noopener">Cotizar un galpón por WhatsApp</a></div>'
       % (html.escape(LINEAS[0][1]), "".join('<figure><img decoding="async" loading="lazy" src="%s" alt="Galpón metálico – Joce Cia Ltda. (foto %d)"></figure>' % (vi(u), i + 1) for i, u in enumerate(GALPONES)), WA_GALPON))
gal = ""  # las fotos de galpones viven en /proyectos/galpon-cadeco
cuerpo = ('<div class="wrap"><div class="il-grid">%s</div>%s<div class="il-mas"><small>También fabricamos</small>%s</div></div>'
          % ("".join(card(*l) for l in LINEAS), gal, "".join("<em>%s</em>" % html.escape(t) for t in TAMBIEN)))
f = os.path.join(R, "productos/infraestructura-metalica.html")
s = open(f).read()
s = re.sub(r'(<section class="pp-body">\s*).*?(\s*</section>)', lambda m: m.group(1) + cuerpo + m.group(2), s, count=1, flags=re.S)
s = re.sub(r"\n\.il-grid\{.*?\.il-mas em\{[^}]*\}\n", "", s, count=1, flags=re.S)
s = s.replace("</style>", CSS + "</style>", 1)
open(f, "w").write(s)
print("ok")
