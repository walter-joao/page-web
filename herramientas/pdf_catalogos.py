"""Catálogos PDF (catalogos/, catalogos/en/, catalogos/zh/): datos para Google y contactos.

Uso:  python3 herramientas/pdf_catalogos.py          (modifica los 18 PDF en su sitio)
      python3 herramientas/pdf_catalogos.py --revisar (solo muestra qué cambiaría)

Hace, sin cambiar el diseño:
1) Metadatos: título, descripción (la frase de la portada del PDF), palabras clave, autor e idioma (/Lang).
2) Contactos: deja solo el correo de ventas y su celular. CONTACTOS dice qué texto reemplazar o borrar.
3) Código QR de WhatsApp de la última página: lo vuelve a dibujar con el número de WHATSAPP.
Se puede correr varias veces: si ya está todo al día, no toca nada.
Requiere: pymupdf, segno, opencv-python-headless (para leer los QR y comprobarlos).
"""
import glob, os, sys
import pymupdf as fitz
import segno

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)
FUENTE = "herramientas/fuentes/OpenSans-400.ttf"
AUTOR = "JOCE Ingeniería y Materiales (Joce Cía. Ltda.)"
WHATSAPP = "593958849799"  # el celular que queda junto a ventas@jocecia.com
CONTACTOS = {"ventas6@jocecia.com": "ventas@jocecia.com", "compras@jocecia.com": None, "+593 96 406 8392": None}

NOMBRES = {  # nombre del catálogo por idioma
    "accesorios-para-tuberia": ("Catálogo de accesorios para tubería", "Pipe fittings catalog", "管道配件目录"),
    "alcantarillas": ("Catálogo de alcantarillas metálicas", "Metal culverts catalog", "金属涵管目录"),
    "grating-tramex": ("Catálogo de pisos industriales: grating y tramex", "Industrial flooring catalog: steel grating", "钢格板目录"),
    "pernos-bronce-silicio": ("Catálogo de pernos de bronce silicio", "Silicon bronze bolts catalog", "硅青铜螺栓目录"),
    "postes": ("Catálogo de postes metálicos", "Steel poles catalog", "金属电线杆目录"),
    "resina-de-anclaje": ("Catálogo de resina para anclaje en roca", "Rock anchoring resin cartridges catalog", "岩石锚固树脂药卷目录"),
}
CLAVES = {
    "accesorios-para-tuberia": ("accesorios para tubería, codos, tees, reducciones, válvulas, Ecuador",
                                "pipe fittings, elbows, tees, reducers, valves, Ecuador", "管道配件, 弯头, 三通, 阀门, 厄瓜多尔"),
    "alcantarillas": ("alcantarillas metálicas, acero corrugado, MP-68, MP-152, Multiplate, Ecuador",
                      "metal culverts, corrugated steel, MP-68, MP-152, Multiplate, Ecuador", "金属涵管, 波纹钢, MP-68, MP-152, 厄瓜多尔"),
    "grating-tramex": ("grating, tramex, rejilla de acero galvanizado, pisos industriales, Ecuador",
                       "steel grating, galvanized grating, industrial flooring, walkways, Ecuador", "钢格板, 镀锌钢格板, 工业地板, 厄瓜多尔"),
    "pernos-bronce-silicio": ("pernos de bronce silicio, latón, acero inoxidable, ASTM, Ecuador",
                              "silicon bronze bolts, brass, stainless steel, ASTM, Ecuador", "硅青铜螺栓, 黄铜, 不锈钢, ASTM, 厄瓜多尔"),
    "postes": ("postes metálicos, alumbrado público, postes galvanizados, canastillas de anclaje, Ecuador",
               "steel poles, street lighting poles, galvanized poles, anchor cages, Ecuador", "金属电线杆, 照明杆, 镀锌杆, 地脚螺栓笼, 厄瓜多尔"),
    "resina-de-anclaje": ("resina de anclaje, cartuchos de resina poliéster, pernos de roca, minería, Ecuador",
                          "anchoring resin, polyester resin cartridges, rock bolts, mining, Ecuador", "锚固树脂, 树脂药卷, 岩石锚杆, 采矿, 厄瓜多尔"),
}
IDIOMAS = ["es", "en", "zh"]
LANG = {"es": "es-EC", "en": "en", "zh": "zh-CN"}
MARCA = {"es": " · JOCE Ingeniería y Materiales, Ecuador", "en": " · JOCE Ingeniería y Materiales, Ecuador", "zh": " · JOCE Ingeniería y Materiales，厄瓜多尔"}


def frase_portada(doc, idioma):
    """La frase descriptiva de la portada (texto entre 8,5 y 12 pt más largo)."""
    mejor = ""
    for b in doc[0].get_text("dict")["blocks"]:
        if b["type"]:
            continue
        sp = [s for l in b["lines"] for s in l["spans"]]
        sep = "" if idioma == "zh" else " "
        t = sep.join("".join(s["text"] for s in l["spans"]).strip() for l in b["lines"])
        if sp and 8.5 < sp[0]["size"] < 12 and len(t) > len(mejor):
            mejor = t
    return mejor


def contactos(doc):
    """Reemplaza o borra los contactos viejos (misma fuente, tamaño y color). Devuelve cuántos cambió."""
    n = 0
    for pag in doc:
        poner = []
        for b in pag.get_text("dict")["blocks"]:
            for l in b.get("lines", []):
                for s in l["spans"]:
                    t = s["text"].strip()
                    if t in CONTACTOS:
                        pag.add_redact_annot(fitz.Rect(s["bbox"]), fill=False)
                        if CONTACTOS[t]:
                            poner.append((s["origin"], CONTACTOS[t], s["size"], s["color"]))
                        n += 1
        if n:
            pag.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE)
            for (x, y), txt, size, color in poner:
                rgb = tuple(((color >> k) & 255) / 255 for k in (16, 8, 0))
                pag.insert_text((x, y), txt, fontsize=size, fontname="OpenSans", fontfile=FUENTE, color=rgb)
    return n


def leer_qr(pag, rect):
    import cv2, numpy as np
    pix = pag.get_pixmap(dpi=300, clip=rect + (-6, -6, 6, 6))
    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
    return cv2.QRCodeDetector().detectAndDecode(img[:, :, :3].copy())[0]


def qr_whatsapp(doc):
    """El QR de WhatsApp de la última página: si no apunta a WHATSAPP, lo tapa y lo dibuja de nuevo."""
    pag = doc[-1]
    destino = "https://wa.me/" + WHATSAPP
    for d in pag.get_drawings():
        r = d["rect"]
        if len(d["items"]) > 300 and 40 < r.width < 120 and abs(r.width - r.height) < 2:
            actual = leer_qr(pag, r)
            if not actual.startswith("https://wa.me/") or actual == destino:
                continue
            color = d.get("fill") or (0.086, 0.184, 0.302)
            pag.draw_rect(r + (-1, -1, 1, 1), color=None, fill=(1, 1, 1), overlay=True)
            qr = segno.make(destino, error="m", boost_error=False)
            filas = list(qr.matrix)
            lado = r.width / len(filas)
            forma = pag.new_shape()
            for i, fila in enumerate(filas):
                for j, v in enumerate(fila):
                    if v:
                        forma.draw_rect(fitz.Rect(r.x0 + j * lado, r.y0 + i * lado, r.x0 + (j + 1) * lado + .05, r.y0 + (i + 1) * lado + .05))
            forma.finish(color=None, fill=color, width=0)
            forma.commit(overlay=True)
            assert leer_qr(pag, r) == destino, "el QR nuevo no se lee"
            return 1
    return 0


def main(revisar=False):
    for idioma in IDIOMAS:
        carpeta = "catalogos/" if idioma == "es" else "catalogos/%s/" % idioma
        for clave in NOMBRES:
            ruta = carpeta + clave + ".pdf"
            doc = fitz.open(ruta)
            k = IDIOMAS.index(idioma)
            meta = dict(doc.metadata)
            meta.update(title=NOMBRES[clave][k] + MARCA[idioma], subject=frase_portada(doc, idioma),
                        keywords=CLAVES[clave][k], author=AUTOR)
            cambia_meta = any(doc.metadata.get(c) != meta[c] for c in ("title", "subject", "keywords", "author"))
            lang = doc.xref_get_key(doc.pdf_catalog(), "Lang")
            cambia_lang = lang[1].strip("()") != LANG[idioma]
            n = contactos(doc)
            q = qr_whatsapp(doc)
            if not (cambia_meta or cambia_lang or n or q):
                print("al día   ", ruta)
                continue
            print(("cambiaría" if revisar else "escribe  "), ruta, "| contactos:", n, "| QR:", q, "|", meta["title"])
            if revisar:
                continue
            doc.set_metadata(meta)
            doc.xref_set_key(doc.pdf_catalog(), "Lang", "(%s)" % LANG[idioma])
            tmp = ruta + ".tmp"
            doc.save(tmp, garbage=3, deflate=True)
            doc.close()
            os.replace(tmp, ruta)


if __name__ == "__main__":
    main("--revisar" in sys.argv)
