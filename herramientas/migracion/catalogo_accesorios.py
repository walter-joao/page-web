"""Texto de catalogos/accesorios-para-tuberia.pdf (es/en/zh, tal cual) a la ficha de accesorios."""
import json, os
P = os.path.join(os.path.dirname(__file__), '..', '..', 'datos', 'productos', 'accesorios-para-tuberias.json')
def L(es, en, zh): return {"es": es, "en": en, "zh": zh}
def h(t, *a): return {"tipo": t, **L(*a)}
def ul(*items): return {"tipo": "ul", "items": [L(*i) for i in items]}
MAT = ("Según el material: acero al carbono, acero inoxidable y acero aleado.", "By material: carbon steel, stainless steel and alloy steel.", "按材质：碳钢、不锈钢和合金钢。")
nuevo = [
 h("h2", "Ficha técnica (del catálogo)", "Technical data (from the catalog)", "技术参数（摘自目录）"),
 h("h3", "Codos", "Elbows", "弯头"),
 h("p", "Se utilizan para cambiar la dirección del flujo en la tubería.", "Used to change the direction of flow in the pipe.", "用于改变管道中的流动方向。"),
 ul(MAT, ("Según la dirección del flujo: 45°, 90° y 180°.", "By flow direction: 45°, 90° and 180°.", "按流向：45°、90° 和 180°。"),
    ("Según la longitud y el radio: radio corto (SR) y radio largo (LR).", "By length and radius: short radius (SR) and long radius (LR).", "按长度和半径：短半径（SR）和长半径（LR）。")),
 h("h3", "Tees", "Tees", "三通"),
 h("p", "Permiten la conexión de tres tramos de tubería en forma de T.", "Connect three pipe sections in a T shape.", "以 T 形连接三段管道。"),
 ul(MAT, ("Según la conexión: roscadas, soldables y bridadas.", "By connection: threaded, socket-weld and flanged.", "按连接方式：螺纹、承插焊和法兰。")),
 h("h3", "Reducciones", "Reducers", "异径管"),
 h("p", "Se utilizan para conectar tuberías de diferentes diámetros. Pueden ser concéntricas o excéntricas: las concéntricas son las más utilizadas; las excéntricas se usan cuando hay problemas de espacio o de alineación.",
   "Used to connect pipes of different diameters. They can be concentric or eccentric: concentric reducers are the most common; eccentric ones are used where space or alignment is a problem.",
   "用于连接不同直径的管道。分为同心和偏心两种：同心异径管最常用；偏心异径管用于空间或对中受限的场合。"),
 ul(("<strong>Concéntricas</strong>: piezas cónicas con bases paralelas y ejes concéntricos, para unir tuberías de distinto diámetro. Son frecuentes en tramos horizontales o verticales sin una estructura establecida. Al concentrar el flujo hacia el centro, la presión de trabajo es más estable y balanceada.",
     "<strong>Concentric</strong>: conical parts with parallel ends and concentric axes, to join pipes of different diameters. Common in horizontal or vertical runs without a set structure. Because they focus the flow toward the center, the working pressure is more stable and balanced.",
     "<strong>同心</strong>：两端平行、轴线同心的锥形管件，用于连接不同直径的管道。常用于没有固定结构的水平或竖直管段。由于将流体集中到中心，工作压力更稳定、更均衡。"),
    ("<strong>Excéntricas</strong>: piezas cónicas con bases paralelas y ejes excéntricos, para unir tuberías de distinto diámetro. Se usan en instalaciones alineadas a la pared o al piso, ya que permiten alinear la tubería con la estructura.",
     "<strong>Eccentric</strong>: conical parts with parallel ends and offset axes, to join pipes of different diameters. Used in installations aligned with a wall or floor, since they let the pipe line up with the structure.",
     "<strong>偏心</strong>：两端平行、轴线偏移的锥形管件，用于连接不同直径的管道。用于沿墙或地面敷设的管道，可使管道与结构对齐。")),
 h("h3", "Uniones", "Unions", "活接头"),
 h("p", "Permiten conectar y desconectar fácilmente tramos de tubería. La elección depende del material de la tubería, la aplicación y la resistencia y flexibilidad requeridas.",
   "Allow pipe sections to be connected and disconnected easily. The choice depends on the pipe material, the application and the strength and flexibility required.",
   "便于管段的连接和拆卸。根据管道材质、用途以及所需的强度和柔性来选择。"),
 ul(("Uniones roscadas.", "Threaded unions.", "螺纹活接头。"), ("Uniones soldadas.", "Welded unions.", "焊接活接头。"),
    ("Uniones con bridas.", "Flanged unions.", "法兰活接头。"), ("Uniones de compresión.", "Compression unions.", "卡套活接头。")),
 h("h3", "Válvulas", "Valves", "阀门"),
 h("p", "Controlan el flujo de líquidos o gases a través de la tubería. Las válvulas son esenciales en la industria para controlar el flujo y la presión de los fluidos en sistemas de tratamiento y suministro de agua, así como en el tratamiento de aguas residuales.",
   "Control the flow of liquids or gases through the pipe. Valves are essential in industry to control the flow and pressure of fluids in water treatment and supply systems, and in wastewater treatment.",
   "控制管道中液体或气体的流量。阀门在工业中至关重要，用于控制给水处理与供水系统以及污水处理中流体的流量和压力。"),
 ul(("Bola", "Ball", "球阀"), ("Compuerta", "Gate", "闸阀"), ("Mariposa", "Butterfly", "蝶阀"), ("Diafragma", "Diaphragm", "隔膜阀"), ("Cono", "Plug", "旋塞阀"), ("Multivía", "Multiport", "多通阀")),
 h("h3", "Tapones y tapaderas", "Plugs and caps", "管堵与管帽"),
 h("p", "Se utilizan para cerrar los extremos de las tuberías. La elección depende de la presión del sistema, el costo, la permanencia y la comodidad.",
   "Used to close the ends of pipes. The choice depends on system pressure, cost, permanence and convenience.",
   "用于封闭管道末端。根据系统压力、成本、是否永久以及使用便利性来选择。"),
 ul(("Mecánicos.", "Mechanical.", "机械式。"), ("De conexión a presión.", "Push-fit.", "快插式。"), ("Soldados.", "Welded.", "焊接式。"), ("De drenaje, entre otros.", "Drain plugs, among others.", "排水堵头等。")),
]
d = json.load(open(P, encoding='utf-8'))
i = next((k for k, b in enumerate(d['cuerpo']) if b.get('es', '').startswith('Ficha técnica')), None)
if i is not None: d['cuerpo'] = d['cuerpo'][:i]
d['cuerpo'] += nuevo
open(P, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
