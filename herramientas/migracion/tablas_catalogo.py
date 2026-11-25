"""Tablas de los catálogos PDF de Jocecia pasadas a HTML (datos copiados tal cual de
catalogos/alcantarillas.pdf y sus versiones en/zh). Reemplaza en las fichas MP-68 y MP-152
las imágenes de tablas del WordPress por tablas que Google puede leer.
Uso: python3 herramientas/migracion/tablas_catalogo.py && python3 herramientas/generar_paginas.py"""
import json, re, os
R = os.path.join(os.path.dirname(__file__), '..', '..', 'datos', 'productos')

def L(es, en, zh): return {"es": es, "en": en, "zh": zh}
def celda(c):
    if isinstance(c, dict): return c
    c = str(c); d = re.sub(r'(?<=\d),(?=\d)', '.', c)   # 0,05 -> 0.05 en inglés y chino (como en sus catálogos)
    return {"es": c, "en": d, "zh": d}
def tabla(titulo, cols, filas):
    return {"tipo": "tabla", "titulo": titulo, "cols": [celda(c) for c in cols], "filas": [[celda(c) for c in f] for f in filas]}

ELEM = L("Elemento", "Element", "元素"); COMP = L("Composición, %", "Composition, %", "成分，%")
AZ = L("Azufre, máx.", "Sulfur, max.", "硫，最大")
SUMA = L("Suma de carbono, manganeso, fósforo, azufre y silicio, máx.", "Sum of carbon, manganese, phosphorus, sulfur and silicon, max.", "碳、锰、磷、硫和硅总和，最大")
MEC = [L("Límite elástico, mín. (MPa)", "Yield strength, min. (MPa)", "屈服强度，最小（MPa）"),
       L("Resistencia a la tracción, mín. (MPa)", "Tensile strength, min. (MPa)", "抗拉强度，最小（MPa）"),
       L("Elongación en 50 mm, %", "Elongation in 50 mm, %", "50 mm 伸长率，%")]
RELL_MIN = L("Relleno mín. (m)", "Fill height min. (m)", "填土高度 最小（m）")
RELL_MAX = L("Relleno máx. (m)", "Fill height max. (m)", "填土高度 最大（m）")
CAUDAL = L("Caudal 80 % tubo lleno (m³/s)", "Flow at 80 % full (m³/s)", "80 % 满流流量（m³/s）")
LUZ = L("Luz (m)", "Span (m)", "跨度（m）"); AREA = L("Área (m²)", "Area (m²)", "面积（m²）")
ESP = L("Espesor (mm)", "Thickness (mm)", "厚度（mm）"); PESO = L("Peso (kg/m)", "Weight (kg/m)", "重量（kg/m）")

MP68 = {
 "/img/wp/2021/08/3767521.png": tabla(L("Tabla 1 · Composición química", "Table 1 · Chemical composition", "表 1 ・ 化学成分"), [ELEM, COMP], [[AZ, "0,05"], [SUMA, "0,70"]]),
 "/img/wp/2021/08/Tabla2.png": tabla(L("Tabla 2 · Propiedades mecánicas", "Table 2 · Mechanical properties", "表 2 ・ 力学性能"), MEC, [["230", "310", "20"]]),
 "/img/wp/2021/08/Tabla-3.png": tabla(L("Tabla 3 · Diámetros y espesores", "Table 3 · Diameters and thicknesses", "表 3 ・ 直径和厚度"),
    [L("Diámetro (pulg)", "Diameter (in)", "直径（英寸）"), L("Diámetro (m)", "Diameter (m)", "直径（m）"), ESP],
    [['24"', "0,6", "1,8"], ['36"', "0,9", "2,0"], ['48"', "1,2", "2,5"], ['60"', "1,5", "3,0"], ['72"', "1,8", "3,3 · 3,5"]]),
 "/img/wp/2021/08/Tabla-5SCI.png": tabla(L("Tabla 4 · Sección circular", "Table 4 · Circular section", "表 4 ・ 圆形截面"),
    [LUZ, AREA, ESP, PESO, RELL_MIN, RELL_MAX, CAUDAL, "V (m/s)"],
    [["0,6","0,28","1,8","36,98","0,3","26","0,54","2,14"], ["0,9","0,64","2,0","56,14","0,3","19","1,59","2,80"],
     ["1,2","1,13","2,5","90,96","0,3","18","2,93","3,00"], ["1,5","1,77","3,0","133,6","0,3","17,5","4,75","3,00"],
     ["1,8","2,54","3,3","175","0,3","16","6,34","2,82"]]),
 "/img/wp/2021/08/Tabla-5SAB.png": tabla(L("Tabla 5 · Sección abovedada", "Table 5 · Arch section", "表 5 ・ 拱形截面"),
    [LUZ, L("Flecha (m)", "Rise (m)", "矢高（m）"), AREA, ESP, PESO, RELL_MIN, RELL_MAX, CAUDAL, "V (m/s)"],
    [["0,6","0,41","0,20","1,8","35,8","0,3","5,0","0,29","1,64"], ["0,9","0,56","0,41","2,0","52,1","0,3","4,5","0,73","2,05"],
     ["1,2","0,79","0,81","2,5","80","0,3","3,5","1,54","2,22"], ["1,5","0,91","1,06","3,0","118","0,3","4,0","2,31","2,45"],
     ["1,8","1,12","1,64","3,3","155","0,3","4,0","4,00","2,81"]]),
 "/img/wp/2021/08/Tabla-5PT.png": tabla(L("Tabla 6 · Dimensiones de pernos y tuercas", "Table 6 · Bolt and nut dimensions", "表 6 ・ 螺栓和螺母尺寸"),
    [L("Tipo", "Type", "类型"), L("Diámetro (pulg)", "Diameter (in)", "直径（英寸）"), L("Longitud (pulg)", "Length (in)", "长度（英寸）"), L("Espesor de plancha (mm)", "Plate thickness (mm)", "板厚（mm）")],
    [["1", '1/2"', '7/8"', L("1,8 a 3,5", "1.8 to 3.5", "1.8 至 3.5")], ["2*", '1/2"', '1 1/4"', L("1,8 a 3,5 (* solo para juntas de 3 planchas)", "1.8 to 3.5 (* only for 3-plate joints)", "1.8 至 3.5（* 仅用于 3 板接头）")]]),
}
MP152 = {
 "/img/wp/2021/08/Tabla_2.1.png": tabla(L("Tabla 7 · Composición química por análisis de colada", "Table 7 · Chemical composition by heat analysis", "表 7 ・ 熔炼分析化学成分"), [ELEM, COMP], [[AZ, "0,05"], [SUMA, "0,75"]]),
 "/img/wp/2021/08/Tabla_2.2.png": tabla(L("Tabla 8 · Propiedades mecánicas", "Table 8 · Mechanical properties", "表 8 ・ 力学性能"), MEC[:2] + [L("Elongación en 50 mm, % mín.", "Elongation in 50 mm, % min.", "50 mm 伸长率，% 最小")], [["190", "290", "25"]]),
 "/img/wp/2021/08/Tabla_2.3.png": tabla(L("Tabla 9 · Dimensiones nominales de planchas (N = 0,2438 m)", "Table 9 · Nominal plate dimensions (N = 0.2438 m)", "表 9 ・ 钢板公称尺寸（N = 0.2438 m）"),
    [L("Ancho", "Width", "宽度"), L("Ancho total (mm)", "Total width (mm)", "总宽度（mm）"), L("Ancho neto (mm)", "Net width (mm)", "净宽（mm）"),
     L("Longitud neta 4' (mm)", "Net length 4' (mm)", "净长 4'（mm）"), L("Longitud neta 6' (mm)", "Net length 6' (mm)", "净长 6'（mm）"), L("Longitud neta 8' (mm)", "Net length 8' (mm)", "净长 8'（mm）"),
     L("N.º espacios", "No. spaces", "间距数量"), L("N.º agujeros", "No. holes", "孔数量")],
    [[L(w+" PI", w+" PI", w+" 英尺"), *r] for w, *r in [["9","854","731","1219,2","1828,8","2438,4","3N","4"], ["15","1339","1219","1219,2","1828,8","2438,4","5N","6"],
                                                      ["18","1587","1463","1219,2","1828,8","2438,4","6N","7"], ["21","1825","1706","1219,2","1828,8","2438,4","7N","8"]]]),
 "/img/wp/2021/08/Tabla_2.7.png": tabla(L("Tabla 11 · Requisitos para pernos y tuercas (ASTM A761)", "Table 11 · Bolt and nut requirements (ASTM A761)", "表 11 ・ 螺栓和螺母要求（ASTM A761）"),
    [L("Característica", "Characteristic", "特性"), L("Pernos", "Bolts", "螺栓"), L("Tuercas", "Nuts", "螺母")],
    [[L("Dimensiones generales", "General dimensions", "一般尺寸"), "ANSI B18.2.1 Heavy Hex", "ANSI B18.2.2 Heavy Hex"],
     [L("Costuras longitudinales y circunferenciales", "Longitudinal and circumferential seams", "纵向和环向接缝"), "ASTM A449", L("ASTM A563 Grado C", "ASTM A563 Grade C", "ASTM A563 C 级")],
     [L("Anclaje de estructuras al concreto", "Anchoring structures to concrete", "结构与混凝土锚固"), "ASTM A307", L("ASTM A563 Grado A", "ASTM A563 Grade A", "ASTM A563 A 级")],
     [L("Recubrimiento de zinc", "Zinc coating", "镀锌层"), "ASTM A153", "ASTM A153"],
     [L("Diámetro nominal", "Nominal diameter", "公称直径"), '3/4"', '3/4"']]),
}
# Tabla 10 (pernos por espesor) va junto a las figuras de "Estructuras", que se quedan (son dibujos).
T10 = tabla(L("Tabla 10 · Pernos por espesor", "Table 10 · Bolts by thickness", "表 10 ・ 各厚度对应螺栓"),
    [L("Diámetro", "Diameter", "直径"), L("Longitud (A)", "Length (A)", "长度（A）"), L("Espesor de plancha", "Plate thickness", "板厚")],
    [['3/4"','1 1/4"',L("2,5 a 3,3 mm","2.5 to 3.3 mm","2.5 至 3.3 mm")], ['3/4"','1 1/2"',L("2,5 a 8,0 mm","2.5 to 8.0 mm","2.5 至 8.0 mm")],
     ['3/4"','1 3/4"',L("3,3 a 8,0 mm","3.3 to 8.0 mm","3.3 至 8.0 mm")], ['3/4"','3"',L("Canal de arranque","Base channel","基础槽钢")], ['3/4"','6"',L("Conexión de cabezal","Headwall connection","端墙连接")]])

def aplicar(slug, mapa, extra_tras=None):
    P = os.path.join(R, slug + '.json'); d = json.load(open(P, encoding='utf-8')); out = []
    for b in d['cuerpo']:
        if b.get('tipo') == 'figura' and b.get('foto') in mapa: out.append(mapa[b['foto']]); continue
        out.append(b)
        if extra_tras and b.get('foto') == extra_tras[0] and not any(x.get('titulo') == extra_tras[1]['titulo'] for x in d['cuerpo']): out.append(extra_tras[1])
    d['cuerpo'] = out
    open(P, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

aplicar('alcantarilla-mp-68', MP68)
aplicar('alcantarilla-mp-152', MP152, ("/img/wp/2021/08/Tabla_2.6_2.png", T10))
