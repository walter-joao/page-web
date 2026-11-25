"""Resumen de catalogos/alcantarillas.pdf (es/en/zh, tal cual) en la ficha general de alcantarillas."""
import json, os
P = os.path.join(os.path.dirname(__file__), '..', '..', 'datos', 'productos', 'alcantarillas-metalicas.json')
def L(es, en, zh): return {"es": es, "en": en, "zh": zh}
def h(t, *a): return {"tipo": t, **L(*a)}
nuevo = [
 h("h2", "Ficha técnica (del catálogo)", "Technical data (from the catalog)", "技术参数（摘自目录）"),
 h("p", "Estructuras de acero corrugado y galvanizado MiniMultiplate SP MP-68 y Multiplate SP MP-152 / MP-152 S para drenaje y obras viales. Norma ASTM A929, cargas HS20-44 · HL-93.",
   "Corrugated, galvanized steel structures MiniMultiplate SP MP-68 and Multiplate SP MP-152 / MP-152 S for drainage and road works. ASTM A929, loads HS20-44 · HL-93.",
   "MiniMultiplate SP MP‑68 和 Multiplate SP MP‑152 / MP‑152 S 镀锌波纹钢结构，用于排水和道路工程。ASTM A929，荷载 HS20‑44 ・ HL‑93。"),
 {"tipo": "tabla", "titulo": L("Modelos", "Models", "型号"),
  "cols": [L("", "", ""), L("MP-68", "MP-68", "MP-68"), L("MP-152 / 152 S", "MP-152 / 152 S", "MP-152 / 152 S")],
  "filas": [
   [L("Modelo", "Model", "型号"), L("MiniMultiplate SP", "MiniMultiplate SP", "MiniMultiplate SP"), L("Multiplate SP", "Multiplate SP", "Multiplate SP")],
   [L("Corruga", "Corrugation", "波纹"), L("68 × 13 mm", "68 × 13 mm", "68 × 13 mm"), L("152 × 51 mm", "152 × 51 mm", "152 × 51 mm")],
   [L("Luces", "Spans", "跨度"), L("Hasta 1,80 m", "Up to 1.80 m", "最大 1.80 m"), L("Hasta 16 m", "Up to 16 m", "最大 16 m")],
   [L("Espesores", "Thicknesses", "厚度"), L("e = 1,8 a 3,5 mm", "e = 1.8 to 3.5 mm", "e = 1.8 至 3.5 mm"), L("e = 2,5 a 8,0 mm", "e = 2.5 to 8.0 mm", "e = 2.5 至 8.0 mm")],
   [L("Longitud efectiva", "Effective length", "有效长度"), L("L = 0,81 m", "L = 0.81 m", "L = 0.81 m"), L("L = 4', 6' y 8'", "L = 4', 6' and 8'", "L = 4'、6' 和 8'")],
   [L("Usos", "Uses", "用途"), L("Uso general como drenaje de aguas superficiales. Hasta 1,80 m de luz o diámetro.", "General use as surface-water drainage. Up to 1.80 m span or diameter.", "一般用于地表排水。最大 1.80 m 跨度或直径。"),
    L("Drenaje de pequeñas quebradas y pasos peatonales; conducción de grandes caudales y pasos vehiculares y ferroviarios.", "Draining small streams and pedestrian underpasses; carrying large flows and vehicle and rail underpasses.", "小溪排水和人行地下通道；大流量输水以及车行和铁路地下通道。")],
  ]},
]
d = json.load(open(P, encoding='utf-8'))
i = next((k for k, b in enumerate(d['cuerpo']) if b.get('es', '').startswith('Ficha técnica')), None)
if i is not None: d['cuerpo'] = d['cuerpo'][:i]
d['cuerpo'] += nuevo
open(P, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
