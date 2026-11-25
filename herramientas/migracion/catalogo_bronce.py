"""Texto y tablas de catalogos/pernos-bronce-silicio.pdf (es/en/zh, tal cual) a su ficha."""
import json, os, re
P = os.path.join(os.path.dirname(__file__), '..', '..', 'datos', 'productos', 'pernos-bronce-silicio.json')
def L(es, en, zh): return {"es": es, "en": en, "zh": zh}
def h(t, *a): return {"tipo": t, **L(*a)}
def ul(*items): return {"tipo": "ul", "items": [L(*i) for i in items]}
def c(x):
    if isinstance(x, dict): return x
    d = re.sub(r'(?<=\d),(?=\d)', '.', x); return {"es": x, "en": d, "zh": d}
def tabla(titulo, cols, filas): return {"tipo": "tabla", "titulo": titulo, "cols": [c(x) for x in cols], "filas": [[c(x) for x in f] for f in filas]}
def kv(*f): return {"tipo": "tabla", "filas": [{"k": L(*k), "v": L(*v)} for k, v in f]}
ELEM, PCT = L("Elemento", "Element", "元素"), "%"
RESTO = L("Resto", "Balance", "余量")
CU, SI, ZN, FE, MN, PB = L("Cobre","Copper","铜"), L("Silicio","Silicon","硅"), L("Zinc","Zinc","锌"), L("Hierro","Iron","铁"), L("Manganeso","Manganese","锰"), L("Plomo","Lead","铅")
LARGOS = "1/2 · 3/4 · 1 · 1 1/4 · 1 1/2 · 2 · 2 1/2 · 3 · 3 1/2 · 4"
DISP = ("Disponibles en latón, bronce e inoxidable.", "Available in brass, bronze and stainless.", "可选黄铜、青铜、不锈钢。")
nuevo = [
 h("h2", "Ficha técnica (del catálogo)", "Technical data (from the catalog)", "技术参数（摘自目录）"),
 h("h3", "Bronce silicio · ASTM aleación 651", "Silicon bronze · ASTM alloy 651", "硅青铜 ・ ASTM 合金 651"),
 h("p", "Aleación de cobre con silicio, zinc, hierro, manganeso y plomo. El silicio le asegura dureza, resistencia y conductividad óptimas. Tiene propiedades mecánicas comparables a las de los aceros de medio carbono y una resistencia a la corrosión similar a la del cobre.",
   "Copper alloy with silicon, zinc, iron, manganese and lead. Silicon gives it optimal hardness, strength and conductivity. Its mechanical properties are comparable to medium-carbon steels and its corrosion resistance is similar to copper.",
   "含硅、锌、铁、锰和铅的铜合金。硅赋予其理想的硬度、强度和导电性。其力学性能与中碳钢相当，耐腐蚀性与铜相近。"),
 h("p", "Usos: conductores eléctricos, tanques, recipientes de presión, construcciones marítimas y conductos hidráulicos a presión; conectores eléctricos, líneas telefónicas y plantas petroleras. Las industrias que más lo emplean son la eléctrica, la naval y la de telecomunicaciones.",
   "Uses: electrical conductors, tanks, pressure vessels, marine construction and pressurized hydraulic lines; electrical connectors, telephone lines and oil plants. It is used most in the electrical, marine and telecommunications industries.",
   "用途：导电体、储罐、压力容器、海洋工程和承压液压管路；电气连接件、电话线路和石油装置。主要用于电气、船舶和电信行业。"),
 kv((("Norma","Standard","标准"),("ASTM B99","ASTM B99","ASTM B99")), (("Aleación","Alloy","合金"),("C-651","C-651","C-651")),
    (("Temple","Temper","状态"),("Medio duro","Half hard","半硬")), (("Tracción","Tensile","抗拉"),("75 – 95 ksi (≈ 517–655 MPa)","75 – 95 ksi (≈ 517–655 MPa)","75 – 95 ksi（≈ 517–655 MPa）")),
    (("Uso principal","Main use","主要用途"),("Conducción eléctrica","Electrical conduction","导电")), (("Productos","Products","产品"),("Tornillo, tuerca, arandela, varilla","Bolt, nut, washer, rod","螺栓、螺母、垫圈、螺杆"))),
 tabla(L("Composición química · bronce silicio", "Chemical composition · silicon bronze", "化学成分 ・ 硅青铜"), [ELEM, PCT],
       [[CU, RESTO], [SI, "0,8 – 2,0"], [ZN, "1,5"], [FE, "0,8"], [MN, "0,7"], [PB, "0,05"]]),
 h("h3", "Latón · ASTM B134, aleación B260", "Brass · ASTM B134, alloy B260", "黄铜 ・ ASTM B134，合金 B260"),
 h("p", "Es el latón que empleamos en la fabricación de nuestros productos. Es una mezcla de cobre, plomo, hierro y zinc. Cuando el zinc supera el 18 %, el metal se vuelve más claro y dorado. Es más duro que el cobre puro. Fundido no es viscoso, por lo que se adapta perfectamente a moldes detallados. La adición de un 2–3 % de plomo y hierro mejora su resistencia a la corrosión y permite conexiones herméticas a prueba de fugas.",
   "This is the brass we use to make our products. It is a mix of copper, lead, iron and zinc. When zinc exceeds 18 %, the metal becomes lighter and more golden. It is harder than pure copper. When molten it is not viscous, so it fills detailed molds perfectly. Adding 2–3 % lead and iron improves its corrosion resistance and allows tight, leak-proof connections.",
   "这是我们用于制造产品的黄铜，由铜、铅、铁和锌混合而成。锌含量超过 18 % 时，金属更轻、颜色更金黄。它比纯铜更硬。熔融时不黏稠，能完美填充精细模具。加入 2–3 % 的铅和铁可提高耐腐蚀性，实现紧密、不渗漏的连接。"),
 h("p", "Usos: accesorios de tuberías de agua potable, calefacción y distribución de gas; tubos condensadores e intercambiadores de calor en plantas de energía a vapor.",
   "Uses: fittings for pipes carrying drinking water, heating and gas distribution; condenser tubes and heat exchangers in steam power plants.",
   "用途：管道配件，用于输送饮用水、供暖和燃气输配；蒸汽电站的冷凝管和换热器。"),
 tabla(L("Composición química · latón", "Chemical composition · brass", "化学成分 ・ 黄铜"), [ELEM, PCT],
       [[CU, "68,5 – 71,5"], [PB, "0,07"], [FE, "0,05"], [ZN, RESTO]]),
 h("h3", "Tornillos, tuercas, arandelas y varillas", "Bolts, nuts, washers and rods", "螺栓、螺母、垫圈和螺杆"),
 h("p", "Por las propiedades de las aleaciones que manejamos, la mayoría de nuestros productos se fabrican en bronce y en latón. Para que tengan un empleo óptimo, recomendamos utilizar el mismo tipo de aleación en todo el conjunto (tornillo, tuerca y arandela). Materiales disponibles: latón, bronce e inoxidable.",
   "Because of the properties of the alloys we use, most of our products are made in bronze and brass. For best results, we recommend using the same alloy throughout the assembly (bolt, nut and washer). Available materials: brass, bronze and stainless.",
   "由于所用合金的特性，我们的大部分产品采用青铜和黄铜制造。为获得最佳效果，建议整套组件（螺栓、螺母和垫圈）使用同一种合金。可选材料：黄铜、青铜、不锈钢。"),
 h("h4", "Tornillos · sistema inglés y métrico · norma ANSI B18.2.1", "Bolts · imperial and metric · ANSI B18.2.1 standard", "螺栓 ・ 英制和公制 ・ ANSI B18.2.1 标准"),
 h("p", "La cabeza más solicitada es la hexagonal, aunque también fabricamos otras formas (redonda, cilíndrica) y sistemas de apriete (hexagonal, cuadrado, ranura, Phillips, Allen).",
   "Hex is the most requested head, but we also make other shapes (round, cheese) and drive types (hex, square, slotted, Phillips, Allen).",
   "六角头需求最多，但我们也生产其他形状（圆头、圆柱头）和驱动类型（六角、方头、一字槽、Phillips、Allen）。"),
 tabla(L("Tornillos · medidas disponibles", "Bolts · available sizes", "螺栓 ・ 可选规格"),
       [L("Diámetro (pulg)","Diameter (in)","直径（英寸）"), L("Hilos por pulg","Threads per in","每英寸牙数"), L("Norma","Standard","标准"), L("Largos disponibles (pulg)","Available lengths (in)","可选长度（英寸）")],
       [[d, t, "B18.2.1", LARGOS] for d, t in [("1/4","20"),("5/16","18"),("3/8","16"),("1/2","13"),("5/8","11")]]),
 h("h4", "Tuercas · norma ANSI B18.2.2", "Nuts · ANSI B18.2.2 standard", "螺母 ・ ANSI B18.2.2 标准"),
 h("p", "Tipos: hexagonal, cuadrada, castillo, mariposa, gota y normal. Medidas disponibles en hexagonal y cuadrada: #5-40, #8-32, #10-24, #10-32, 1/4, 5/16, 3/8, 1/2, 5/8, 3/4, 7/8 y 1.",
   "Types: hex, square, castle, wing, acorn and standard. Sizes available in hex and square: #5-40, #8-32, #10-24, #10-32, 1/4, 5/16, 3/8, 1/2, 5/8, 3/4, 7/8 and 1.",
   "类型：六角、方螺母、开槽螺母、蝶形、盖形螺母、标准。六角和方螺母可选规格：#5-40、#8-32、#10-24、#10-32、1/4、5/16、3/8、1/2、5/8、3/4、7/8 和 1。"),
 h("h4", "Arandelas · norma ANSI B18.21.1", "Washers · ANSI B18.21.1 standard", "垫圈 ・ ANSI B18.21.1 标准"),
 h("p", "Tipos: redonda (plana), de presión, diente interno, diente externo y empaque. Medidas disponibles en diente interno: 1/4, 5/16, 3/8, 7/16, 1/2, 9/16, 5/8 y 3/4.",
   "Types: round (flat), split lock, internal tooth, external tooth and gasket. Sizes available in internal tooth: 1/4, 5/16, 3/8, 7/16, 1/2, 9/16, 5/8 and 3/4.",
   "类型：圆形（平垫）、弹簧垫圈、内齿、外齿、密封垫。内齿可选规格：1/4、5/16、3/8、7/16、1/2、9/16、5/8 和 3/4。"),

]
d = json.load(open(P, encoding='utf-8'))
i = next((k for k, b in enumerate(d['cuerpo']) if b.get('es', '').startswith('Ficha técnica')), None)
if i is not None: d['cuerpo'] = d['cuerpo'][:i]
d['cuerpo'] += nuevo
open(P, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
