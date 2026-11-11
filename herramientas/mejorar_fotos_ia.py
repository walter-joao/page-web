"""Mejora fotos con IA (Real-ESRGAN x4plus) y las guarda al doble de resolución en la misma ruta.

Se ejecuta en GitHub Actions (.github/workflows/mejorar-fotos-ia.yml) porque necesita PyTorch.
Uso: python3 herramientas/mejorar_fotos_ia.py MODELO.pth PARTE TOTAL
  - Lee la lista de herramientas/fotos-ia-lista.txt (una ruta por línea).
  - Agrupa las variantes de tamaño de una misma foto (foto-1024x768.jpg, foto-1024x768-770x513.jpg)
    y procesa solo la más grande; las demás se generan reduciendo el resultado.
  - Antes de guardar compara el resultado reducido con el original: si se parece poco
    (algo salió mal), deja el original intacto. Así nunca se sube una foto dañada.
  - PNG con transparencia: la IA mejora el color y la transparencia se amplía aparte.
"""
import os, re, sys, time
import numpy as np, torch, spandrel
from PIL import Image

MAX_LADO = 2560
LIMITE_DIFERENCIA = 12  # diferencia media (0-255) entre original y resultado reducidos a 64x64

modelo = spandrel.ModelLoader().load_from_file(sys.argv[1]).eval()
parte, total = int(sys.argv[2]), int(sys.argv[3])
torch.set_num_threads(os.cpu_count())
S = modelo.scale


def ampliar(img, T=256, P=12):
    a = torch.from_numpy(np.asarray(img, np.float32) / 255.).permute(2, 0, 1)[None]
    _, _, H, W = a.shape
    out = torch.zeros(1, 3, H * S, W * S)
    for y in range(0, H, T):
        for x in range(0, W, T):
            y0, x0 = max(y - P, 0), max(x - P, 0)
            y1, x1 = min(y + T + P, H), min(x + T + P, W)
            with torch.no_grad():
                o = modelo(a[:, :, y0:y1, x0:x1])
            h, w = min(T, H - y) * S, min(T, W - x) * S
            yy, xx = (y - y0) * S, (x - x0) * S
            out[:, :, y * S:y * S + h, x * S:x * S + w] = o[:, :, yy:yy + h, xx:xx + w]
    o = (out[0].clamp(0, 1).permute(1, 2, 0).numpy() * 255).round().astype(np.uint8)
    return Image.fromarray(o)


def diferencia(a, b):
    a = np.asarray(a.convert('RGB').resize((64, 64), Image.BILINEAR), float)
    b = np.asarray(b.convert('RGB').resize((64, 64), Image.BILINEAR), float)
    return float(np.abs(a - b).mean())


lista = [l.strip() for l in open('herramientas/fotos-ia-lista.txt') if l.strip() and os.path.exists(l.strip())]
grupos = {}
for p in lista:
    base = re.sub(r'(-\d+x\d+)+(?=(-\d+)?\.\w+$)', '', p)
    grupos.setdefault(base, []).append(p)
grupos = [g for i, g in enumerate(sorted(grupos.values())) if i % total == parte]
print(f'Parte {parte + 1}/{total}: {len(grupos)} fotos', flush=True)

malas = 0
for ps in grupos:
    t = time.time()
    tam = {p: Image.open(p).size for p in ps}
    grande = max(ps, key=lambda p: tam[p][0] * tam[p][1])
    orig = Image.open(grande)
    alfa = None
    if orig.mode in ('RGBA', 'LA', 'P'):
        rgba = orig.convert('RGBA')
        if rgba.getchannel('A').getextrema()[0] < 255:
            alfa = rgba.getchannel('A')
        rgb = Image.new('RGB', rgba.size, (255, 255, 255)); rgb.paste(rgba, mask=rgba.getchannel('A'))
    else:
        rgb = orig.convert('RGB')
    res = ampliar(rgb)
    d = diferencia(rgb, res)
    if d > LIMITE_DIFERENCIA:
        malas += 1
        print(f'  DESCARTADA (diferencia {d:.1f}): {grande}', flush=True)
        continue
    rel = tam[grande][0] / tam[grande][1]
    for p in ps:
        w, h = tam[p]
        if abs(w / h - rel) > 0.02:
            continue  # recorte distinto: se deja como está
        k = min(2, MAX_LADO / max(w, h)); dest = (round(w * k), round(h * k))
        im = res.resize(dest, Image.LANCZOS)
        low = p.lower()
        if low.endswith('.png'):
            if alfa is not None:
                im.putalpha(alfa.resize(dest, Image.LANCZOS))
            im.save(p, optimize=True)
        elif low.endswith('.webp'):
            im.save(p, quality=82, method=6)
        else:
            im.save(p, quality=86, optimize=True, progressive=True)
        Image.open(p).load()
    print(f'  {grande} {tam[grande]} -> x2, diferencia {d:.1f}, {time.time() - t:.0f}s', flush=True)
print(f'Listo. Descartadas: {malas}', flush=True)
