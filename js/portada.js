/* JS principal de la portada (index.html): cabecera, idiomas, tema, carrusel, mapa de obras, productos, catálogos PDF y contacto. */
(function(){
  var root=document.documentElement;

  // Fotos del sitio antiguo: pasan por el optimizador de Vercel (WebP/AVIF, tamaño justo)
  function VI(u,w){return /^(https:\/\/jocecia\.com\/portal\/|\/img\/(wp|obras)\/)/.test(u)?'/_vercel/image?url='+encodeURIComponent(u)+'&w='+(w||1080)+'&q=75':u}
  function IMG(u,w){return 'src="'+VI(u,w)+'" data-o="'+u+'" decoding="async"'}

  // Imágenes: si una foto no carga, queda el fondo de acero corrugado
  document.querySelectorAll('.corr img').forEach(function(img){
    img.addEventListener('error',function(){if(img.dataset.f==='1'){img.dataset.f='2';return}img.remove()});
  });

  // Cabecera transparente sobre la portada, sólida al bajar
  var top=document.getElementById('top');
  var lastY=scrollY;
  function onScroll(){
    var y=scrollY,navOpen=document.getElementById('nav').classList.contains('open');
    top.classList.toggle('solid',y>40);
    // Se esconde al bajar (deja más pantalla) y vuelve en cuanto el usuario sube
    if(Math.abs(y-lastY)>6){top.classList.toggle('away',y>lastY&&y>160&&!navOpen&&!top.contains(document.activeElement));lastY=y}
  }
  addEventListener('scroll',onScroll,{passive:true});requestAnimationFrame(onScroll);
  top.addEventListener('focusin',function(){top.classList.remove('away')});

  // Portada: fotos que se alternan cada 6 s
  var slides=[].slice.call(document.querySelectorAll('.slide')),dots=document.getElementById('dots'),cap=document.getElementById('cap'),cur=0,timer,lang='es';
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  slides.forEach(function(s,i){
    var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Foto '+(i+1));
    b.addEventListener('click',function(){go(i,true)});dots.appendChild(b);
  });
  function go(i,manual){
    slides.forEach(function(s){s.classList.remove('prev')});
    slides[cur].classList.remove('on');slides[cur].classList.add('prev');dots.children[cur].classList.remove('on');
    cur=(i+slides.length)%slides.length;
    slides[cur].classList.add('on');
    var d=dots.children[cur];void d.offsetWidth;d.classList.add('on');
    cap.textContent=TR(slides[cur].dataset.cap,slides[cur].dataset.capEn);
    if(manual)start();
  }
  function start(){clearInterval(timer);if(!reduce)timer=setInterval(function(){go(cur+1)},6000)}
  dots.children[0].classList.add('on');start();

  // El botón flotante de WhatsApp se oculta en Contacto, donde ya hay uno
  var wa=document.querySelector('.wa'),ct=document.getElementById('contacto');
  if('IntersectionObserver' in window&&wa&&ct){new IntersectionObserver(function(es){wa.classList.toggle('hide',es[0].isIntersecting)},{threshold:.2}).observe(ct)}

  /* Cambia la foto de un visor sin que se vea un instante la anterior: se oculta, se vacía y aparece cuando la nueva terminó de cargar.
     o = foto original para el respaldo si falla el optimizador de Vercel. */
  window.cambiarFoto=function(img,src,o){img.classList.remove('ok');img.removeAttribute('data-f');img.dataset.o=o||'';
    img.onload=function(){img.classList.add('ok')};img.removeAttribute('src');if(src)img.src=src};
  // Proyectos: ampliar la foto dentro de la página
  var lb=document.getElementById('lb'),lbimg=document.getElementById('lbimg');
  var lbSet=null,lbI=0;
  function closeLb(){lb.hidden=true;lbSet=null;document.getElementById('lbp').hidden=document.getElementById('lbn').hidden=true;document.body.style.overflow=''}
  function lbShow(i){lbI=(i+lbSet.list.length)%lbSet.list.length;cambiarFoto(lbimg,lbSet.list[lbI]);lbimg.hidden=false;
    document.getElementById('lbk').textContent=lbSet.k+' · '+(lbI+1)+' / '+lbSet.list.length;document.getElementById('lbt').textContent=lbSet.t}
  document.querySelectorAll('[data-tables]').forEach(function(b){
    b.addEventListener('click',function(){
      lbSet={list:JSON.parse(b.dataset.tables),k:b.dataset.name,t:b.querySelector('span').textContent};lbShow(0);
      document.getElementById('lbp').hidden=document.getElementById('lbn').hidden=false;
      lb.hidden=false;document.body.style.overflow='hidden';document.getElementById('lbn').focus();
    });
  });
  document.getElementById('lbp').addEventListener('click',function(){lbShow(lbI-1)});
  document.getElementById('lbn').addEventListener('click',function(){lbShow(lbI+1)});
  addEventListener('keydown',function(e){if(lb.hidden||!lbSet)return;if(e.key==='ArrowLeft')lbShow(lbI-1);if(e.key==='ArrowRight')lbShow(lbI+1)});
  document.querySelectorAll('.shot').forEach(function(a){
    a.addEventListener('click',function(e){
      e.preventDefault();var im=a.querySelector('img');
      cambiarFoto(lbimg,a.dataset.full||(im?(im.dataset.o?VI(im.dataset.o,1920):im.src):''),(!a.dataset.full&&im&&im.dataset.o)||'');lbimg.hidden=!im;
      document.getElementById('lbk').textContent=a.querySelector('small').textContent;
      document.getElementById('lbt').textContent=a.querySelector('b').textContent;
      lb.hidden=false;document.body.style.overflow='hidden';document.getElementById('lbx').focus();
    });
  });
  document.getElementById('lbx').addEventListener('click',closeLb);
  lb.addEventListener('click',function(e){if(e.target===lb)closeLb()});
  addEventListener('keydown',function(e){if(e.key!=='Escape')return;if(!lb.hidden)closeLb();if(!cv.hidden)closeCv();if(!pd.hidden)closePd()});

  // Productos: "Saber más" abre la ficha dentro de la página
  var PRODS={"p1": {"subs": [{"img": "/img/wp/2025/02/image003.jpg", "pdf": "/catalogos/postes.pdf", "es": {"t": "Postes metálicos", "d": "Postes de acero para iluminación, alumbrado público, sujeción de cables y anclaje de estructuras."}, "en": {"t": "Steel poles", "d": "Steel poles for lighting, street lighting, cable support and structural anchoring."}}, {"go": "p4", "es": {"t": "Grating y tramex", "d": "Rejillas y pisos industriales."}, "en": {"t": "Grating and tramex", "d": "Industrial grates and floors."}}, {"go": "p5", "es": {"t": "Encofrados", "d": "Verticales, trepantes, circulares y deslizantes."}, "en": {"t": "Formwork", "d": "Vertical, climbing, circular and slipform."}}, {"go": "p6", "es": {"t": "Accesorios para tuberías", "d": "Codos, tees, reducciones, uniones y válvulas."}, "en": {"t": "Pipe fittings", "d": "Elbows, tees, reducers, unions and valves."}}, {"go": "p7", "es": {"t": "Anclaje en roca", "d": "Resina de anclaje y perno de barra helicoidal."}, "en": {"t": "Rock anchoring", "d": "Anchoring resin and helical bar bolt."}}], "img": ["/img/wp/2021/08/Galpon2.png", "/img/wp/2025/01/WhatsApp-Image-2022-05-26-at-8.12.52-AM-1024x768.jpeg", "/img/wp/2025/02/WhatsApp-Image-2022-05-18-at-8.23.05-AM.jpeg"], "es": {"k": "Infraestructura metálica", "t": "Estructuras a la medida de su obra", "d": "Diseñamos, fabricamos y montamos estructuras metálicas para obra civil, energía e industria, desde la ingeniería hasta la entrega en sitio.", "h": "Líneas de producto", "f": ["Pisos metálicos", "Postes", "Rejillas", "Placas", "Cerchas para túneles", "Encofrados", "Disipadores de energía", "Accesorios para tubería", "Pernos y placas de anclaje", "Galpones", "Escaleras", "Pasamanos y pasarelas"]}, "en": {"k": "Metal infrastructure", "t": "Structures built for your project", "d": "We design, fabricate and install steel structures for civil works, energy and industry, from engineering to on-site delivery.", "h": "Product lines", "f": ["Metal floors", "Poles", "Grates", "Plates", "Tunnel arches", "Formwork", "Energy dissipators", "Pipe fittings", "Anchor bolts and plates", "Industrial sheds", "Stairs", "Handrails and walkways"]}}, "p2": {"subs": [{"img": "/img/wp/2025/02/WhatsApp-Image-2025-02-11-at-14.46.30-fotor-bg-remover-2025021114511.png", "es": {"t": "Pernos a la forja", "d": "", "h": "Clasificación", "f": ["Pernos molino", "Pernos para la construcción", "Pernos para minería e industria alimenticia", "Pernos para vía férrea", "Pernos estándar", "Productos especiales", "Herrajería eléctrica", "Tuercas estándar y especiales", "Rodelas"], "sec": [{"h": "¿Qué son?", "p": "Elementos de fijación fabricados por forja: el material se moldea con calor y presión. Este proceso orienta los cristales del metal y mejora su resistencia y dureza, por lo que resisten mejor la fatiga y el desgaste que los pernos estampados o mecanizados."}, {"h": "¿Dónde se usan?", "p": "En aplicaciones que exigen alta resistencia y durabilidad: maquinaria pesada, estructuras metálicas, equipos de transporte e industria automotriz."}]}, "en": {"t": "Forged bolts", "d": "", "h": "Range", "f": ["Mill bolts", "Construction bolts", "Mining and food-industry bolts", "Railway bolts", "Standard bolts", "Special products", "Power-line hardware", "Standard and special nuts", "Washers"], "sec": [{"h": "What are they?", "p": "Fasteners made by forging: the material is shaped with heat and pressure. This aligns the metal grain and improves strength and hardness, so they resist fatigue and wear better than stamped or machined bolts."}, {"h": "Where are they used?", "p": "Wherever high strength and durability are required: heavy machinery, steel structures, transport equipment and the automotive industry."}]}, "gal": ["/img/wp/2025/02/WhatsApp-Image-2025-02-11-at-14.46.30-fotor-bg-remover-2025021114511.png", "/img/wp/2025/01/ALTARESOLUCION1-1024x577.png"]}, {"img": "/img/wp/2025/02/BSilicio.jpg", "pdf": "/catalogos/pernos-bronce-silicio.pdf", "es": {"t": "Pernos bronce-silicio", "d": "", "sec": [{"h": "¿Qué son?", "p": "Pernos que se destacan por sus propiedades mecánicas y su resistencia a la corrosión. Son adecuados para muchas aplicaciones industriales, sobre todo donde hay exposición a condiciones extremas."}, {"h": "Composición y propiedades", "p": "La aleación de bronce-silicio contiene entre 1 % y 5 % de silicio, lo que le da propiedades únicas:", "items": [["Resistencia a la corrosión", "El silicio mejora la resistencia a la corrosión por agua dulce y salada, y a medios agresivos como las soluciones alcalinas."], ["Alta resistencia mecánica", "Aunque es un material relativamente ligero, resiste bien la tracción y es duro, por lo que sirve para piezas que soportan cargas pesadas."], ["Buena maquinabilidad", "A diferencia de otros bronces se maquina con facilidad, lo que permite pernos de distintas formas y tamaños con tolerancias estrictas."], ["Baja fricción y desgaste", "El silicio reduce el desgaste y mejora el deslizamiento, por eso se usa en aplicaciones con piezas en movimiento."], ["Resistencia al calor", "Soporta temperaturas elevadas sin perder sus propiedades mecánicas."]]}, {"h": "Fabricación y tratamiento", "p": "Se fabrican por fundición o forja y después pueden recibir tratamientos térmicos para mejorar sus propiedades:", "items": [["Envejecimiento controlado", "Incrementa la dureza y la resistencia del perno."], ["Recubrimiento antioxidante", "Mejora aún más su resistencia a la corrosión."]]}, {"h": "Aplicaciones comunes", "p": "Se utilizan en una amplia gama de sectores industriales:", "items": [["Industria naval", "Por su resistencia a la corrosión marina, son ideales para maquinaria naval y equipos en contacto con agua salada."], ["Automotriz", "En frenos, suspensión y motores, donde se exige alta resistencia al desgaste y a la temperatura."], ["Aeronáutica", "En piezas sometidas a altas cargas y temperaturas, como sistemas de dirección y componentes estructurales."], ["Sistemas eléctricos", "Por sus buenas propiedades eléctricas, en conexiones y piezas que necesitan conductividad sin perder durabilidad."]]}]}, "en": {"t": "Silicon-bronze bolts", "d": "", "sec": [{"h": "What are they?", "p": "Bolts that stand out for their mechanical properties and corrosion resistance. They suit many industrial uses, especially where conditions are extreme."}, {"h": "Composition and properties", "p": "Silicon-bronze alloy contains 1% to 5% silicon, which gives it unique properties:", "items": [["Corrosion resistance", "Silicon improves resistance to fresh and salt water and to aggressive media such as alkaline solutions."], ["High mechanical strength", "Although relatively light, it has high tensile strength and hardness, so it suits parts that carry heavy loads."], ["Easy to machine", "Unlike other bronzes it machines easily, allowing bolts in many shapes and sizes with tight tolerances."], ["Low friction and wear", "Silicon reduces wear and improves sliding, so it is used where parts move."], ["Heat resistance", "It withstands high temperatures without losing its mechanical properties."]]}, {"h": "Manufacturing and treatment", "p": "They are cast or forged and can then be heat-treated to improve their properties:", "items": [["Controlled ageing", "Increases hardness and strength."], ["Anti-oxidation coating", "Further improves corrosion resistance."]]}, {"h": "Common applications", "p": "They are used across many industrial sectors:", "items": [["Marine industry", "Their resistance to marine corrosion makes them ideal for ship machinery and equipment in contact with salt water."], ["Automotive", "In brakes, suspension and engines, where high wear and heat resistance are required."], ["Aerospace", "In parts under high loads and temperatures, such as steering systems and structural components."], ["Electrical systems", "Thanks to good electrical properties, in connections and parts that need conductivity and durability."]]}]}, "gal": ["/img/wp/2025/02/BSilicio.jpg", "/img/wp/2025/01/WhatsApp-Image-2025-01-28-at-15.40.10.jpeg", "/img/wp/2025/01/WhatsApp-Image-2025-01-28-at-15.31.38-1024x336.jpeg"]}], "img": ["/img/wp/2025/02/20220815_145218_013-640-640.webp", "/img/wp/2025/02/BSilicio.jpg", "/img/wp/2025/02/WhatsApp-Image-2025-02-13-at-15.47.01.jpeg"], "es": {"k": "Pernos especiales", "t": "Pernos de alta fiabilidad", "d": "Importamos y distribuimos pernos especiales de alta fiabilidad para proyectos de infraestructura metálica, de acuerdo con la necesidad de cada cliente.", "h": "Tipos", "f": ["Pernos a la forja", "Pernos bronce-silicio", "Pernos de anclaje", "Fabricación bajo plano"]}, "en": {"k": "Special bolts", "t": "High-reliability bolts", "d": "We import and distribute special high-reliability bolts for steel infrastructure projects, matched to each client's needs.", "h": "Types", "f": ["Forged bolts", "Silicon-bronze bolts", "Anchor bolts", "Made to drawing"]}, "contain": true, "hero": {"img": "/img/wp/2021/08/nut-161213_1280.png", "es": "Nosotros evolucionamos, su negocio también", "en": "We evolve, and so does your business"}}, "p4": {"pdf": "/catalogos/grating-tramex.pdf", "img": ["/img/wp/2025/02/WhatsApp-Image-2022-05-03-at-10.23.11-AM-768x1024.jpeg", "/img/wp/2025/02/WhatsApp-Image-2022-05-18-at-8.22.22-AM-1-1-1024x768.jpeg", "/img/wp/2021/08/grating-1024x576.jpg", "/img/wp/2025/02/WhatsApp-Image-2022-05-18-at-8.23.06-AM-1024x575.jpeg"], "es": {"k": "Grating y tramex", "t": "Rejillas y pisos industriales", "d": "El grating o rejilla metálica es una solución versátil y eficiente para pisos, plataformas, pasarelas y cubiertas de canal.", "adv": [["Durabilidad", "Materiales de alta calidad que soportan cargas pesadas y uso intensivo."], ["Seguridad", "Opciones antideslizantes y de alta capacidad de carga para proteger a los trabajadores."], ["Versatilidad", "Varios tamaños y configuraciones que se adaptan a cada proyecto."], ["Fácil instalación", "Diseñados para montarse rápido, con menos tiempo y costo de obra."]], "sec": [{"h": "Tipos", "items": [["Grating de barra", "Barras transversales y portantes; ideal donde se necesita alta capacidad de carga y buena ventilación."], ["Grating antideslizante", "Superficie segura en áreas con humedad o aceite."]]}]}, "en": {"k": "Grating and tramex", "t": "Industrial grates and floors", "d": "Grating, or metal grate, is a versatile and efficient solution for floors, platforms, walkways and trench covers.", "adv": [["Durability", "High-quality materials built for heavy loads and intensive use."], ["Safety", "Anti-slip and high-load options to protect workers."], ["Versatility", "Many sizes and configurations to fit each project."], ["Easy installation", "Designed for quick installation, saving time and cost."]], "sec": [{"h": "Types", "items": [["Bar grating", "Cross and bearing bars; ideal for high loads and good ventilation."], ["Anti-slip grating", "A safe surface in wet or oily areas."]]}]}}, "p5": {"img": ["/img/wp/2025/02/IMG-20220426-WA0011-1024x576.jpg", "/img/wp/2025/01/WhatsApp-Image-2022-04-26-at-10.16.34-AM-1-1024x576.jpeg", "/img/wp/2025/02/IMG_20230912_152446-1-768x1024.jpg", "/img/wp/2021/08/ENCOFRADOS-METALICOS-3-768x1024.jpg"], "es": {"k": "Encofrados", "t": "Encofrados metálicos", "d": "Estructuras temporales de acero que moldean y sostienen el hormigón fresco hasta que alcanza la resistencia necesaria para soportar su peso y sus cargas.", "h": "Tipos", "f": ["Verticales", "Trepantes", "Circulares y cónicos", "Deslizantes"], "adv": [["Durabilidad y resistencia", "Materiales de primera calidad que soportan las presiones del hormigón y se reutilizan en varias obras."], ["Eficiencia en la construcción", "Instalación rápida y sencilla que reduce tiempos y costos."], ["Versatilidad", "Varios tamaños y configuraciones para cada proyecto."], ["Seguridad", "Estructura robusta que protege a los trabajadores en obra."]]}, "en": {"k": "Formwork", "t": "Steel formwork", "d": "Temporary steel structures that shape and hold fresh concrete until it is strong enough to carry its own weight and loads.", "h": "Types", "f": ["Vertical", "Climbing", "Circular and conical", "Slipform"], "adv": [["Durability and strength", "Top-quality materials that withstand concrete pressure and can be reused across projects."], ["Faster construction", "Quick, simple installation that cuts time and cost."], ["Versatility", "Many sizes and configurations for each project."], ["Safety", "A sturdy structure that keeps site workers safe."]]}}, "p8": {"img": ["/img/wp/2021/08/ReparacionCilindro4-1-576x1024.png", "/img/wp/2025/01/IMG_20240613_105948-1024x768.jpg", "/img/wp/2025/02/WhatsApp-Image-2022-06-01-at-9.21.17-AM-1-576x1024.jpeg", "/img/wp/2021/08/Ataguia-Estructura-2-1024x768.jpg"], "es": {"k": "Piezas especiales", "t": "Fabricación y reparación de partes y piezas", "d": "Trabajamos con cada cliente para desarrollar diseños y prototipos que se ajusten a sus requisitos, con software de diseño y modelado 3D para garantizar la precisión.", "adv": [["Calidad garantizada", "Controles de calidad rigurosos en cada etapa."], ["Personalización", "Soluciones a la medida de cada proyecto."], ["Tecnología avanzada", "Maquinaria moderna para mayor precisión y eficiencia."], ["Experiencia y profesionalismo", "Un equipo con años de experiencia en la industria."]], "sec": [{"h": "Nuestros servicios", "items": [["Diseño y prototipado", "Diseños y prototipos a la medida, con software de diseño y modelado 3D."], ["Corte y conformado", "Corte láser, plasma y por agua, con prensas y dobladoras CNC."], ["Soldadura y ensamblaje", "Soldadores certificados con técnicas MIG, TIG y por puntos."], ["Acabados superficiales", "Pintura electrostática, galvanizado y anodizado contra la corrosión."]]}]}, "en": {"k": "Special parts", "t": "Manufacturing and repair of parts", "d": "We work with each client to develop designs and prototypes that fit their requirements, using design software and 3D modeling for precision.", "adv": [["Guaranteed quality", "Strict quality control at every stage."], ["Customization", "Solutions tailored to each project."], ["Advanced technology", "Modern machinery for precision and efficiency."], ["Experience", "A team with years of industry experience."]], "sec": [{"h": "Our services", "items": [["Design and prototyping", "Custom designs and prototypes with CAD and 3D modeling."], ["Cutting and forming", "Laser, plasma and waterjet cutting, plus CNC presses and brakes."], ["Welding and assembly", "Certified welders using MIG, TIG and spot welding."], ["Surface finishing", "Electrostatic paint, galvanizing and anodizing against corrosion."]]}]}}, "p6": {"pdf": "/catalogos/accesorios-para-tuberia.pdf", "img": ["/img/wp/2025/02/IMG-20220426-WA0008-1-1024x576.jpg", "/img/wp/2025/02/WhatsApp-Image-2022-05-10-at-8.34.46-AM-1-576x1024.jpeg", "/img/wp/2025/01/IMG_20240228_182048-768x1024.jpg", "/img/wp/2025/02/WhatsApp-Image-2022-05-10-at-8.34.45-AM-1-576x1024.jpeg"], "es": {"k": "Accesorios para tuberías", "t": "Accesorios para tubería metálica", "d": "Componentes para conectar, unir, cambiar de dirección, controlar el flujo y sellar tuberías metálicas en sistemas industriales, de plomería y de climatización.", "sec": [{"h": "Ejemplos", "items": [["Codos", "Cambian la dirección del flujo."], ["Tees", "Conectan tres tramos de tubería en forma de T."], ["Reducciones", "Unen tuberías de diferentes diámetros."], ["Uniones", "Permiten conectar y desconectar tramos con facilidad."], ["Válvulas", "Controlan el flujo de líquidos o gases."], ["Tapones y tapaderas", "Cierran los extremos de la tubería."]]}]}, "en": {"k": "Pipe fittings", "t": "Steel pipe fittings", "d": "Components to connect, join, change direction, control flow and seal steel pipes in industrial, plumbing and HVAC systems.", "sec": [{"h": "Examples", "items": [["Elbows", "Change the flow direction."], ["Tees", "Join three pipe runs in a T."], ["Reducers", "Join pipes of different diameters."], ["Unions", "Allow easy connection and disconnection."], ["Valves", "Control the flow of liquids or gases."], ["Plugs and caps", "Close pipe ends."]]}]}}, "p7": {"subs": [{"img": "/img/wp/2025/02/Pernos-helicoidales.png", "es": {"t": "Perno de barra helicoidal", "d": "Refuerzo para controlar inestabilidades del macizo rocoso en minería y obra civil. Diámetros de 19, 22, 25 y 32 mm, en largos de 9 y 12 m (otros a pedido), en paquetes de 1 tonelada.", "h": "Especificaciones", "f": ["Barra BAHE A615-G75 (ASTM A615 grado 75)", "Placa de sujeción A36, diseño normal: domo semiesférico", "Placa de sujeción A36, diseño volcán", "Tuerca acerada A194 o fundida A536"]}, "en": {"t": "Helical bar bolt", "d": "Reinforcement to control rock-mass instability in mining and civil works. Diameters of 19, 22, 25 and 32 mm, in 9 and 12 m lengths (others on request), in 1-tonne bundles.", "h": "Specifications", "f": ["BAHE A615-G75 bar (ASTM A615 grade 75)", "A36 bearing plate, standard design: hemispherical dome", "A36 bearing plate, volcano design", "A194 steel or A536 cast nut"]}, "gal": ["/img/wp/2025/02/Pernos-helicoidales.png"]}], "pdf": "/catalogos/resina-de-anclaje.pdf", "img": ["/img/wp/2025/02/IMG_20180131_095956-1024x768-1.jpg", "/img/wp/2025/02/pernos-expansivos1.jpg", "/img/wp/2021/08/tunnel-4427609_1280-1024x681.jpg", "/img/wp/2021/01/4.2-1024x768.jpg"], "es": {"k": "Soporte en roca", "t": "Anclaje en roca con resina", "d": "Cartucho de resina para instalar anclajes en roca o materiales de alta resistencia, con una fijación segura y duradera en rocas de distinta composición y dureza.", "h": "Incluye", "f": ["Cartucho de resina para anclaje", "Perno de barra helicoidal", "Ficha técnica con modo de empleo"], "adv": [["Fijación segura y duradera", "La resina se une con fuerza a la roca y evita que el anclaje se desplace o se afloje."], ["Menor daño a la roca", "Fija el anclaje sin fracturar el macizo alrededor de la perforación."], ["Adaptabilidad", "Sirve en muchos tipos de roca, desde trabajos ligeros hasta grandes obras."]], "sec": [{"h": "Función", "p": "Cartucho a base de resina poliéster, formulado para anclar pernos, barras de anclaje y fijaciones soportantes, principalmente en roca y hormigón. Densidad: 1,8 kg/dm³ (20 °C). Se instala con el mismo equipo de perforación."}, {"h": "Datos técnicos", "p": "Arrancamiento a tracción directa en roca, perforación de 50 mm y perno estriado de 25 mm, anclado 15 cm, a las 24 horas y 23 °C. Ensayos de la Pontificia Universidad Católica (REP 23602).", "items": [["114,4 kN", "Carga máxima"], ["7,9 MPa", "Resistencia a la tracción"]]}, {"h": "Propiedades", "items": [["Gran adherencia", "A roca, hormigón y acero."], ["Rápida colocación y fraguado", "Gran capacidad de anclaje en poco tiempo; material tixotrópico."], ["Resistencia mecánica y química", "Ya curada resiste ácidos y álcalis entre pH 2 y 10, y no se debilita sumergida en agua."], ["Anclaje indefinido", "Curada es más fuerte que la roca y que la mayoría de materiales donde se usa."], ["Resistente al calor", "No se deforma con calentamiento hasta 100 °C."], ["Reduce costos", "Menos mano de obra en la instalación."]]}, {"h": "Aplicaciones comunes", "items": [["Túneles y pozos", "Fijación de barras de refuerzo."], ["Minería subterránea", "Anclajes para estructuras de soporte."], ["Montaje en roca", "Estructuras metálicas o de concreto."], ["Equipos pesados", "Sistemas de anclaje en ambientes rocosos."]]}, {"h": "Presentación", "p": "Cargas de 25 × 500 mm y de 40 × 500 mm. El consumo varía según el diámetro y la longitud de la perforación y de la barra."}, {"h": "Modo de empleo", "items": [["Perforar", "Hasta una profundidad igual al largo del perno, dejando la parte roscada fuera; punta del perno en bisel."], ["Limpiar", "La perforación, de preferencia con aire comprimido."], ["Insertar cartuchos", "Con un exceso de resina de 10 a 20 % para cubrir grietas."], ["Girar el perno", "Rotarlo a través de los cartuchos para mezclar resina y catalizador, y seguir 90 a 100 segundos al llegar al fondo."]]}, {"h": "Almacenamiento y precauciones", "p": "Guardar en lugar fresco y bajo techo, en sus envases cerrados y sin exposición al sol. Usar guantes de goma y gafas; en contacto con los ojos, lavar con abundante agua. Limpiar las herramientas con acetona."}]}, "en": {"k": "Rock support", "t": "Resin rock anchoring", "d": "Resin cartridge to install anchors in rock or high-strength materials, giving a secure, lasting hold in rocks of any composition and hardness.", "h": "Includes", "f": ["Resin anchoring cartridge", "Helical bar bolt", "Data sheet with instructions"], "adv": [["Secure, lasting hold", "The resin bonds strongly to the rock so the anchor does not shift or loosen."], ["Less damage to the rock", "Anchors without fracturing the rock around the hole."], ["Adaptability", "Works in many rock types, from light jobs to large projects."]], "sec": [{"h": "Function", "p": "Polyester-resin cartridge designed to anchor bolts, anchor bars and load-bearing fixings, mainly in rock and concrete. Density: 1.8 kg/dm³ (20 °C). Installed with the same drilling equipment."}, {"h": "Technical data", "p": "Direct pull-out test in rock, 50 mm hole and 25 mm ribbed bolt anchored 15 cm, after 24 hours at 23 °C. Tests by Pontificia Universidad Católica (REP 23602).", "items": [["114.4 kN", "Maximum load"], ["7.9 MPa", "Tensile strength"]]}, {"h": "Properties", "items": [["Strong adhesion", "To rock, concrete and steel."], ["Fast setting", "High anchoring capacity in a short time; thixotropic."], ["Mechanical and chemical resistance", "Cured, it resists acids and alkalis from pH 2 to 10 and does not weaken under water."], ["Permanent anchoring", "Cured, it is stronger than the rock and most host materials."], ["Heat resistant", "No distortion when heated up to 100 °C."], ["Lower costs", "Less labor to install."]]}, {"h": "Common applications", "items": [["Tunnels and shafts", "Fixing reinforcement bars."], ["Underground mining", "Anchors for support structures."], ["Rock mounting", "Steel or concrete structures."], ["Heavy equipment", "Anchoring systems in rocky ground."]]}, {"h": "Presentation", "p": "Cartridges of 25 × 500 mm and 40 × 500 mm. Consumption depends on hole diameter and length and on the bar."}, {"h": "How to use", "items": [["Drill", "To a depth equal to the bolt length, leaving the thread outside; bevelled bolt tip."], ["Clean", "The hole, ideally with compressed air."], ["Insert cartridges", "With 10–20% extra resin to fill cracks."], ["Spin the bolt", "Rotate it through the cartridges to mix resin and catalyst, and keep spinning 90–100 seconds at the bottom."]]}, {"h": "Storage and safety", "p": "Store cool and under cover, in closed original packaging, away from sunlight. Wear rubber gloves and goggles; if it reaches the eyes, rinse with plenty of water. Clean tools with acetone."}]}}, "p9": {"img": ["/img/wp/2025/01/Lincoln-Electric-RX-520.jpg", "/img/wp/2025/01/Invertec-v275-S-left.jpg", "/img/wp/2025/01/lincoln_electric_invertec_v350_pro_1.jpg", "/img/wp/2025/01/625-TOMAHAWK.jpg", "/img/wp/2025/01/LF-72.jpg", "/img/wp/2025/01/azav1-lin405saperb.jpg"], "contain": true, "es": {"k": "Venta de maquinaria", "t": "Venta de soldadoras", "d": "Motosoldadoras reparadas con overhaul y equipos Lincoln Electric para taller y obra."}, "en": {"k": "Machinery sales", "t": "Welding machines", "d": "Overhauled engine welders and Lincoln Electric equipment for workshop and site."}, "subs": [{"img": "/img/wp/2025/01/Lincoln-Electric-RX-520.jpg", "gal": ["/img/wp/2025/01/Lincoln-Electric-RX-520.jpg"], "es": {"t": "Lincoln Electric RX 520", "d": "", "h": "Características", "f": ["Soldadora AC/DC, monofásica y trifásica", "Corriente nominal 220/440 V trifásica, 60 Hz", "Salida de 55 a 110 A CD"]}, "en": {"t": "Lincoln Electric RX 520", "d": "", "h": "Features", "f": ["AC/DC welder, single and three-phase", "Rated 220/440 V three-phase, 60 Hz", "Output 55–110 A DC"]}}, {"img": "/img/wp/2025/01/Invertec-v275-S-left.jpg", "gal": ["/img/wp/2025/01/Invertec-v275-S-left.jpg"], "es": {"t": "Invertec V275-S", "d": "", "h": "Características", "f": ["400 V ±15 %, trifásica 50/60 Hz, apta para generador", "Ligera: 14,3 kg", "Potencia en vacío 19 W y eficiencia mayor a 85 %", "SMAW manual, sinérgico y pulsado (0,5–15 Hz)"]}, "en": {"t": "Invertec V275-S", "d": "", "h": "Features", "f": ["400 V ±15%, 3-phase 50/60 Hz, generator-ready", "Lightweight: 14.3 kg", "19 W idle power, efficiency above 85%", "Manual, synergic and pulsed SMAW (0.5–15 Hz)"]}}, {"img": "/img/wp/2025/01/lincoln_electric_invertec_v350_pro_1.jpg", "gal": ["/img/wp/2025/01/lincoln_electric_invertec_v350_pro_1.jpg"], "es": {"t": "Invertec V350 PRO", "d": ""}, "en": {"t": "Invertec V350 PRO", "d": ""}}, {"img": "/img/wp/2025/01/625-TOMAHAWK.jpg", "gal": ["/img/wp/2025/01/625-TOMAHAWK.jpg"], "es": {"t": "Tomahawk 625", "d": "", "h": "Características", "f": ["Cortadora de plasma con antorcha manual de 6,1 m", "Concentra el arco para distintos espesores", "Encendido confiable sin alta frecuencia", "Corte rápido entre huecos, incluso en metal expandido"]}, "en": {"t": "Tomahawk 625", "d": "", "h": "Features", "f": ["Plasma cutter with 6.1 m hand torch", "Focused arc for different thicknesses", "Reliable start without high frequency", "Fast cutting across gaps, even expanded metal"]}}, {"img": "/img/wp/2025/01/LF-72.jpg", "gal": ["/img/wp/2025/01/LF-72.jpg"], "es": {"t": "Lincoln Electric LF-72", "d": "", "h": "Características", "f": ["Alimentador de alambre de 2 rodillos", "Conexiones de latón a latón para mejor arco", "Cambio de guías y rodillos sin herramientas"]}, "en": {"t": "Lincoln Electric LF-72", "d": "", "h": "Features", "f": ["2-roll wire feeder", "Brass-to-brass connections for a better arc", "Tool-less guide and roll changes"]}}, {"img": "/img/wp/2025/01/azav1-lin405saperb.jpg", "gal": ["/img/wp/2025/01/azav1-lin405saperb.jpg"], "es": {"t": "Linc 405-SA", "d": "", "h": "Características", "f": ["Medidores digitales de corriente", "Hot Start y fuerza de arco ajustables", "Dos ruedas grandes para moverla en taller"]}, "en": {"t": "Linc 405-SA", "d": "", "h": "Features", "f": ["Digital current meters", "Adjustable Hot Start and arc force", "Two large wheels for easy handling"]}}]}, "sec1": {"img": ["/img/wp/2021/08/DESTACADA-CEL.1804.jpg"], "es": {"k": "Soluciones", "t": "Centrales hidroeléctricas", "d": "", "h": "Qué ofrecemos en este sector", "f": ["Encofrados verticales y trepantes", "Cerchas para túneles", "Pernos de anclaje", "Resina para anclaje de acero en roca", "Reparación de piezas especiales", "Pintura industrial", "Postes metálicos", "Soportes para tendido eléctrico de baja y alta tensión", "Estructura para pozo de cables", "Instalación de tubería en plano inclinado"]}, "en": {"k": "Solutions", "t": "Hydropower plants", "d": "", "h": "What we offer in this sector", "f": ["Vertical and climbing formwork", "Tunnel arches", "Anchor bolts", "Resin for steel anchoring in rock", "Repair of special parts", "Industrial painting", "Steel poles", "Supports for low and high voltage lines", "Cable-shaft structures", "Pipe installation on inclined planes"]}}, "sec2": {"img": ["/img/wp/2021/08/mining-856022_1920.jpg"], "es": {"k": "Soluciones", "t": "Industria minera", "d": "", "h": "Qué ofrecemos en este sector", "f": ["Pernos de anclaje", "Cerchas para túneles", "Zarandas metálicas"]}, "en": {"k": "Solutions", "t": "Mining", "d": "", "h": "What we offer in this sector", "f": ["Anchor bolts", "Tunnel arches", "Steel screens"]}}, "sec3": {"img": ["/img/wp/2021/08/INDUSTRIA-CEMENTERA.jpg"], "es": {"k": "Soluciones", "t": "Industria cementera", "d": "", "h": "Qué ofrecemos en este sector", "f": ["Plataformas para perforación de túneles", "Encofrados circulares", "Encofrados cónicos", "Bolardos", "Encofrados deslizantes", "Encofrados verticales"]}, "en": {"k": "Solutions", "t": "Cement industry", "d": "", "h": "What we offer in this sector", "f": ["Tunnel drilling platforms", "Circular formwork", "Conical formwork", "Bollards", "Slipform", "Vertical formwork"]}}, "sec4": {"img": ["/img/wp/2025/02/WhatsApp-Image-2022-05-18-at-8.23.05-AM.jpeg"], "es": {"k": "Soluciones", "t": "Industria eléctrica", "d": "", "h": "Qué ofrecemos en este sector", "f": ["Torres eléctricas", "Herrajes para alta y baja tensión", "Herrajes para instalación de fibra óptica", "Grating y tramex para subestaciones"]}, "en": {"k": "Solutions", "t": "Power industry", "d": "", "h": "What we offer in this sector", "f": ["Power towers", "High and low voltage hardware", "Fiber-optic installation hardware", "Grating and tramex for substations"]}}, "sec5": {"img": ["/img/wp/2025/01/IMG_20241229_142505.jpg"], "es": {"k": "Soluciones", "t": "Proyectos viales", "d": "", "h": "Qué ofrecemos en este sector", "f": ["Cerchas para túneles", "Andenes subterráneos para talleres y cocheras del metro", "Escaleras", "Pasamanos"]}, "en": {"k": "Solutions", "t": "Road projects", "d": "", "h": "What we offer in this sector", "f": ["Tunnel arches", "Underground platforms for metro depots", "Stairs", "Handrails"]}}, "sec6": {"img": ["/img/wp/2021/08/INMOBILIARIO-scaled.jpg"], "es": {"k": "Soluciones", "t": "Estructuras metálicas", "d": "", "h": "Qué ofrecemos en este sector", "f": ["Galpones", "Cerchas", "Estructuras industriales (edificios)"]}, "en": {"k": "Solutions", "t": "Steel structures", "d": "", "h": "What we offer in this sector", "f": ["Industrial sheds", "Trusses", "Industrial structures (buildings)"]}}, "sec7": {"img": ["/img/wp/2025/01/WhatsApp-Image-2025-01-22-at-15.52.19.jpeg"], "es": {"k": "Soluciones", "t": "Mobiliario público", "d": "", "h": "Qué ofrecemos en este sector", "f": ["Juegos infantiles", "Montaje de esculturas", "Bebederos de agua en acero inoxidable", "Bancas de parque", "Basureros"]}, "en": {"k": "Solutions", "t": "Public furniture", "d": "", "h": "What we offer in this sector", "f": ["Playgrounds", "Sculpture installation", "Stainless steel drinking fountains", "Park benches", "Litter bins"]}}, "sec8": {"img": ["/img/wp/2025/02/lam-e1739981950225.jpg"], "es": {"k": "Soluciones", "t": "Pedidos especiales", "d": "", "h": "Qué ofrecemos en este sector", "f": ["Escaleras para aviones", "Piezas a medida bajo plano"]}, "en": {"k": "Solutions", "t": "Special orders", "d": "", "h": "What we offer in this sector", "f": ["Aircraft stairs", "Custom parts made to drawing"]}}, "pr1": {"img": ["/img/wp/2019/11/Metro-de-Quito-trenes-min-1024x683.jpg", "/img/wp/2025/02/WhatsApp-Image-2022-05-03-at-10.23.11-AM-2-1024x768.jpeg", "/img/wp/2025/02/WhatsApp-Image-2022-05-03-at-10.23.11-AM-3-768x1024.jpeg", "/img/wp/2025/02/WhatsApp-Image-2022-05-03-at-10.23.10-AM-1024x491.jpeg", "/img/wp/2025/02/IMG_20220309_1103281-1024x461.jpg", "/img/obras/metro-rejillas.webp", "/img/obras/metro-cercha.webp", "/img/obras/metro-plataformas.webp", "/img/obras/metro-plataforma-escape.webp", "/img/obras/metro-rampa.webp"], "es": {"k": "Transporte público", "t": "Metro de Quito", "d": "Montaje y fabricación de escaleras y perfilería metálica.", "h": "Trabajos realizados", "f": ["Escaleras provisionales en la Estación San Francisco", "Escalera metálica en la parada del Boulevard 24 de Mayo", "Estructura metálica de plenum para Talleres y Cocheras", "Perfilería para cierre de hueco de estructura de reacción, Estación Magdalena", "Perfilería galvanizada y barolada en la Estación Iñaquito", "Escaleras bajo andén y pasamanos en las estaciones Universidad Central, El Ejido y La Alameda", "Escaleras bajo andén en las estaciones El Recreo, Cardenal de la Torre y Solanda", "Chapas y vierteaguas en zona de cubetos de las estaciones del Centro", "Montaje de tramex en Talleres y Cocheras", "Pendolón para soporte de catenaria en Talleres y Cocheras", "Perfilería para eje divisorio de las vías 23 y 24, foso de torno", "Suministro e instalación de tubos y placas galvanizadas", "Perfilería galvanizada para garita de guardia y cuartos de herramientas", "Fabricación de rejillas metálicas para el Consorcio Línea 1", "Fabricación de cerchas curvas para el Consorcio Línea 1", "Plataformas y escaleras de escape para el Consorcio Metro Quito"]}, "en": {"k": "Public transport", "t": "Quito Metro", "d": "Fabrication and installation of stairs and steel profiles.", "h": "Work carried out", "f": ["Temporary stairs at San Francisco station", "Steel stair at the Boulevard 24 de Mayo stop", "Steel plenum structure for the depot", "Profiles to close the reaction-structure opening, Magdalena station", "Galvanized and rolled profiles at Iñaquito station", "Under-platform stairs and handrails at Universidad Central, El Ejido and La Alameda", "Under-platform stairs at El Recreo, Cardenal de la Torre and Solanda", "Sheets and drip edges in the downtown stations", "Tramex installation at the depot", "Catenary support hangers at the depot", "Profiles for the track 23/24 divider at the lathe pit", "Supply and installation of galvanized tubes and plates", "Galvanized profiles for guard booth and tool rooms", "Steel gratings made for the Line 1 Consortium", "Curved trusses made for the Line 1 Consortium", "Escape platforms and stairs for the Metro Quito Consortium"]}}, "pr2": {"img": ["/img/wp/2021/08/SF-CELEC-2-1-1024x681.jpg", "/img/wp/2025/02/DSC05907-768x1024.jpg", "/img/wp/2025/02/DSC07603-1024x768.jpg", "/img/wp/2025/02/DSC05928-1024x768.jpg", "/img/wp/2025/02/DSC05691-1024x768.jpg"], "es": {"k": "Hidroeléctrica", "t": "Central Agoyán", "d": "Trabajos de reparación e infraestructura.", "h": "Trabajos realizados", "f": ["Reparaciones en alturas con equipos especiales", "Soldadura de infraestructura metálica"]}, "en": {"k": "Hydropower", "t": "Agoyán plant", "d": "Repair and infrastructure work.", "h": "Work carried out", "f": ["Repairs at height with special equipment", "Welding of steel infrastructure"]}}, "pr3": {"img": ["/img/wp/2019/11/DESTACADA-CEL.1804.jpg", "/img/wp/2025/02/WhatsApp-Image-2022-05-10-at-8.36.55-AM-2-576x1024.jpeg", "/img/wp/2025/02/WhatsApp-Image-2022-05-10-at-8.36.55-AM-1-1024x576.jpeg", "/img/wp/2025/02/WhatsApp-Image-2022-05-10-at-8.34.46-AM-1-576x1024.jpeg", "/img/wp/2025/02/WhatsApp-Image-2022-05-10-at-8.34.45-AM-576x1024.jpeg"], "es": {"k": "Hidroeléctrica", "t": "Central Manduriacu", "d": "Andamiaje, pintura y turbinas.", "h": "Trabajos realizados", "f": ["Andamios trepantes y deslizantes", "Pintura de tubería", "Turbinas para planta de aguas residuales"]}, "en": {"k": "Hydropower", "t": "Manduriacu plant", "d": "Scaffolding, painting and turbines.", "h": "Work carried out", "f": ["Climbing and sliding scaffolds", "Pipe painting", "Turbines for a wastewater plant"]}}, "pr4": {"img": ["/img/wp/2019/11/SF-CELEC-1024x768.jpg", "/img/wp/2025/01/IMG_20240816_092927-769x1024.jpg", "/img/wp/2025/02/DSC00204-1024x768.jpg", "/img/wp/2025/02/P1000605-1024x768.jpg", "/img/wp/2025/02/DSC01168-1024x768.jpg"], "es": {"k": "Hidroeléctrica", "t": "Central San Francisco", "d": "Mantenimiento mecánico e hidráulico.", "h": "Trabajos realizados", "f": ["Suministros y materiales para mantenimiento mecánico", "Suministro y montaje de soportería metálica para el skid del sistema de limpieza"]}, "en": {"k": "Hydropower", "t": "San Francisco plant", "d": "Mechanical and hydraulic maintenance.", "h": "Work carried out", "f": ["Supplies and materials for mechanical maintenance", "Supply and installation of steel supports for the cleaning-system skid"]}}, "pr7": {"img": ["/img/obras/vista-valle-coral-exterior.webp", "/img/obras/vista-valle-coral-volados.webp", "/img/obras/vista-valle-interior-1.webp", "/img/obras/vista-valle-interior-2.webp"], "es": {"k": "Centro comercial", "t": "Vista Valle · Coral Center", "d": "Armado de estructuras metálicas del centro comercial en el Valle de los Chillos.", "h": "Trabajos realizados", "f": ["Armado de la estructura metálica", "Armado de volados en la fachada", "Estructuras metálicas interiores"]}, "en": {"k": "Shopping center", "t": "Vista Valle · Coral Center", "d": "Steel structure assembly for the shopping center in Valle de los Chillos.", "h": "Work carried out", "f": ["Steel structure assembly", "Facade cantilevers", "Interior steel structures"]}}, "pr8": {"img": ["/img/obras/colegio-americano.webp"], "es": {"k": "Educativo", "t": "Proyecto Colegio Americano", "d": "Fabricación y montaje de estructuras metálicas.", "h": "Trabajos realizados", "f": ["Fabricación de estructura metálica", "Montaje en obra"]}, "en": {"k": "Education", "t": "Colegio Americano project", "d": "Steel structure manufacturing and installation.", "h": "Work carried out", "f": ["Steel structure manufacturing", "On-site installation"]}}, "pr9": {"img": ["/img/obras/bauhaus-1.webp"], "es": {"k": "Edificación", "t": "Proyecto Bauhaus", "d": "Estructuras metálicas para un edificio de altura.", "h": "Trabajos realizados", "f": ["Fabricación de estructura metálica", "Montaje en altura"]}, "en": {"k": "Building", "t": "Bauhaus project", "d": "Steel structures for a high-rise building.", "h": "Work carried out", "f": ["Steel structure manufacturing", "Installation at height"]}}, "pr10": {"img": ["/img/obras/carls-jr-quito.webp"], "es": {"k": "Comercial", "t": "Carl's Jr. · Olive Garden Quito", "d": "Armado de un soporte metálico para conservar un árbol en el proyecto.", "h": "Trabajos realizados", "f": ["Diseño y fabricación del soporte", "Montaje en sitio"]}, "en": {"k": "Commercial", "t": "Carl's Jr. · Olive Garden Quito", "d": "Steel support built to preserve a tree on the project site.", "h": "Work carried out", "f": ["Support design and manufacturing", "On-site installation"]}}, "pr11": {"img": ["/img/obras/tunel-banos-1.webp", "/img/obras/tunel-banos-2.webp"], "es": {"k": "Obra vial", "t": "Túnel de Baños", "d": "Colocación de pernos de anclaje para el sostenimiento del túnel.", "h": "Trabajos realizados", "f": ["Suministro de pernos de anclaje", "Colocación de pernos desde plataformas metálicas", "Trabajo en frente de excavación"]}, "en": {"k": "Roadworks", "t": "Baños tunnel", "d": "Rock bolt installation to support the tunnel.", "h": "Work carried out", "f": ["Rock bolt supply", "Bolt installation from steel platforms", "Work at the excavation face"]}}, "pr5": {"img": ["/img/wp/2025/01/22.3.jpg", "/img/wp/2021/08/Galpon4.png", "/img/wp/2021/02/IMG_3333-1024x768.jpg", "/img/wp/2021/08/Galpon3.png"], "es": {"k": "Estructura metálica", "t": "Galpón industrial Cadeco", "d": "Diseño, montaje y soldadura.", "h": "Trabajos realizados", "f": ["Diseño estructural", "Montaje y soldadura de estructura", "Montaje y sujeción de techo", "Piso industrial"]}, "en": {"k": "Steel structure", "t": "Cadeco industrial shed", "d": "Design, installation and welding.", "h": "Work carried out", "f": ["Structural design", "Structure installation and welding", "Roof installation and fastening", "Industrial floor"]}}, "pr6": {"img": ["/img/wp/2021/02/Primera-etapa-2-1024x768.jpg"], "es": {"k": "Residencial", "t": "Funvivalt · Conjunto habitacional Monserrat", "d": "Diseño, soldadura y montaje.", "h": "Trabajos realizados", "f": ["Diseño estructural metálico para conjunto habitacional", "Estudio de suelos", "Compactación de suelos", "Montaje y soldadura de estructura", "Pernos y acoples para estructura metálica", "Piezas especiales para estructura metálica"]}, "en": {"k": "Residential", "t": "Funvivalt · Monserrat housing complex", "d": "Design, welding and installation.", "h": "Work carried out", "f": ["Steel structural design for a housing complex", "Soil study", "Soil compaction", "Structure installation and welding", "Bolts and couplings for the structure", "Special parts for the structure"]}}};
  var pd=document.getElementById('pd'),pdLast;
  function closePd(){pd.hidden=true;document.body.style.overflow='';if(pdLast)pdLast.focus()}
  function secHtml(sec){return (sec||[]).map(function(z){return '<div class="sec"><h4>'+z.h+'</h4>'+(z.p?'<p>'+z.p+'</p>':'')+(z.items?'<div class="adv">'+z.items.map(function(a,j){return '<div><i>'+('0'+(j+1))+'</i><b>'+a[0]+'</b><span>'+a[1]+'</span></div>'}).join('')+'</div>':'')+'</div>'}).join('')}
  function openPd(id){
    var p=PRODS[id],t=ZO(p);
    document.getElementById('pdk').textContent=t.k;
    document.getElementById('pdt').textContent=t.t;
    document.getElementById('pdd').textContent=t.d;
    document.getElementById('pdh').textContent=t.h;
    document.getElementById('pdf').innerHTML=(t.f||[]).map(function(x){return '<li>'+x+'</li>'}).join('');
    document.getElementById('pds').innerHTML=p.img.map(function(u){return '<div class="corr'+(p.contain?' white':'')+'"><img '+IMG(u,1080)+' alt="" loading="lazy"></div>'}).join('');
    document.querySelectorAll('#pds img').forEach(function(i){i.addEventListener('error',function(){i.remove()})});
    document.getElementById('pdwa').href='https://wa.me/593964068392?text='+encodeURIComponent((TR('Hola, quisiera cotizar: ','Hello, I would like a quote for: '))+t.t);
    var hr=document.getElementById('pdhero');hr.hidden=!p.hero;if(p.hero){cambiarFoto(hr.querySelector('img'),VI(p.hero.img,1080),p.hero.img);hr.querySelector('b').textContent=ZO(p.hero)}
    var L=JL(),SB=p.subs||[],AD=t.adv||[];
    document.getElementById('pdsec').innerHTML=secHtml(t.sec);
    document.getElementById('pdh').hidden=!t.f;document.getElementById('pdf').hidden=!t.f;
    document.getElementById('pdd').hidden=!t.d;
    document.getElementById('pdah').hidden=!AD.length;
    document.getElementById('pdadv').innerHTML=AD.map(function(a,i){return '<div><i>'+('0'+(i+1))+'</i><b>'+a[0]+'</b><span>'+a[1]+'</span></div>'}).join('');
    document.getElementById('pdsh').hidden=!SB.length;
    document.getElementById('pdsub').innerHTML=SB.map(function(x,i){var c=ZO(x);
      return '<details class="sub"'+(i===0&&!x.go?' open':'')+'><summary>'+(x.img?'<span class="corr white"><img '+IMG(x.img,256)+' alt="" loading="lazy"></span>':'')+'<b>'+c.t+'</b></summary><div class="sub-b">'
        +(x.gal?'<div class="sub-gal">'+x.gal.map(function(g){return '<div class="corr white"><img '+IMG(g,1080)+' alt="" loading="lazy"></div>'}).join('')+'</div>':'')
        +(c.d?'<p>'+c.d+'</p>':'')
        +(c.sec||[]).map(function(z){return '<div class="sec"><h4>'+z.h+'</h4>'+(z.p?'<p>'+z.p+'</p>':'')+(z.items?'<div class="adv">'+z.items.map(function(a,j){return '<div><i>'+('0'+(j+1))+'</i><b>'+a[0]+'</b><span>'+a[1]+'</span></div>'}).join('')+'</div>':'')+'</div>'}).join('')
        +(c.f?'<h4>'+c.h+'</h4><ul class="pd-list">'+c.f.map(function(y){return '<li>'+y+'</li>'}).join('')+'</ul>':'')
        +(x.pdf||x.go?'<div class="cta-row">'+(x.pdf?'<button type="button" class="btn btn-line" data-pdf="'+x.pdf+'" data-title="'+c.t+'">'+(TR('Ver catálogo','View catalog'))+'</button>':'')+(x.go?'<button type="button" class="btn btn-line" data-go="'+x.go+'">'+(TR('Saber más','Learn more'))+' ›</button>':'')+'</div>':'')
        +'</div></details>'}).join('');
    var pc=document.getElementById('pdcat');pc.hidden=!p.pdf;
    pc.onclick=function(){closePd();openCv(1,p.pdf,(TR('Catálogo · ','Catalog · '))+t.k)};
    var FICHA={p1:'infraestructura-metalica',p2:'pernos-de-alta-fiabilidad',p4:'grating-tramex',p5:'encofrados',p6:'accesorios-para-tuberias',p7:'soporte-en-roca',p8:'partes-y-piezas-especiales',p9:'venta-de-soldadoras'},fp=document.getElementById('pdpage');fp.hidden=!FICHA[id];if(FICHA[id])fp.href='/productos/'+FICHA[id];
    if(pd.hidden)pdLast=document.activeElement;pd.hidden=false;document.body.style.overflow='hidden';
    pd.querySelector('.pd-in').scrollTop=0;document.getElementById('pdx').focus();
  }
  document.querySelectorAll('[data-prod]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();openPd(b.dataset.prod)})});
  var MO_PROVS=[{"n":"Azuay","d":"M253.0,405.9L254.4,406.0L265.6,409.4L267.8,413.1L252.2,420.7L248.5,428.4L252.5,434.9L246.8,441.5L239.7,462.7L234.9,464.7L214.6,480.0L215.7,484.1L207.1,487.3L204.0,492.8L204.4,510.5L200.5,512.5L192.0,494.2L181.1,496.7L176.8,484.2L163.9,483.0L158.4,480.7L144.4,482.6L150.2,467.9L146.6,463.7L133.7,456.3L137.4,448.0L143.6,447.3L150.6,440.2L145.3,431.9L147.9,425.4L156.8,423.3L159.8,416.3L166.9,408.2L167.3,399.9L172.7,405.7L184.5,407.4L185.7,417.6L188.5,422.3L202.2,423.0L207.8,418.8L215.6,432.9L227.8,432.7L233.0,417.3L239.4,418.7L248.3,412.9L253.0,405.9Z"},{"n":"Bolivar","d":"M223.8,269.1L216.2,286.0L222.1,296.2L220.2,308.5L225.4,317.0L221.5,325.2L208.8,327.4L209.1,340.0L206.5,356.1L207.1,361.2L197.3,370.2L197.5,361.4L189.7,363.3L189.1,357.4L183.9,346.0L189.0,324.9L177.8,315.9L185.2,306.0L177.8,301.3L176.2,296.0L182.6,283.8L175.1,277.2L181.0,270.5L195.5,265.5L201.1,265.6L211.5,272.0L217.6,268.3L223.8,269.1Z"},{"n":"Cañar","d":"M253.0,405.9L248.3,412.9L239.4,418.7L233.0,417.3L227.8,432.7L215.6,432.9L207.8,418.8L202.2,423.0L188.5,422.3L185.7,417.6L184.5,407.4L172.7,405.7L167.3,399.9L162.0,396.7L168.1,387.8L174.1,386.3L179.7,390.2L187.3,390.9L189.1,381.3L192.5,380.4L195.9,371.3L207.2,385.9L218.8,391.9L228.6,387.7L231.8,393.5L238.3,392.6L253.0,405.9Z"},{"n":"Carchi","d":"M356.8,84.8L344.4,85.2L342.1,93.9L334.9,99.4L328.7,109.7L328.7,114.3L317.6,109.9L308.5,102.6L300.7,101.9L297.1,96.9L296.0,87.5L282.9,71.6L271.3,67.5L264.6,62.4L255.3,55.9L255.6,45.4L259.6,42.8L259.1,31.1L268.2,34.0L278.6,30.9L281.8,44.3L289.1,49.5L290.2,55.0L299.3,57.2L313.4,67.6L323.3,69.8L337.9,65.0L342.7,67.6L340.4,76.0L343.7,79.4L356.8,84.8Z"},{"n":"Cotopaxi","d":"M267.8,221.7L270.9,224.9L267.3,239.0L269.5,249.0L264.1,258.4L254.0,255.9L243.2,265.5L235.6,263.3L228.0,264.5L223.8,269.1L217.6,268.3L211.5,272.0L201.1,265.6L195.5,265.5L181.0,270.5L176.3,262.4L180.8,250.5L181.3,239.2L185.9,237.5L188.1,230.9L196.0,221.0L201.7,206.7L198.7,204.2L204.0,201.4L208.5,192.3L213.6,190.0L215.9,183.1L226.1,197.7L226.8,202.4L236.7,205.9L236.1,212.1L243.0,215.6L249.0,210.0L258.9,210.8L267.8,221.7Z"},{"n":"Chimborazo","d":"M274.2,302.2L273.6,314.4L267.0,318.5L265.9,327.1L269.6,337.8L261.1,345.9L265.8,351.3L265.1,361.6L259.6,365.7L260.0,374.1L253.9,382.6L261.6,386.7L262.7,392.7L258.8,404.2L254.4,406.0L253.0,405.9L238.3,392.6L231.8,393.5L228.6,387.7L218.8,391.9L207.2,385.9L195.9,371.3L197.3,370.2L207.1,361.2L206.5,356.1L209.1,340.0L208.8,327.4L221.5,325.2L225.4,317.0L220.2,308.5L222.1,296.2L231.9,293.2L238.9,299.1L248.0,300.6L261.8,295.3L274.2,302.2Z"},{"n":"El Oro","d":"M133.7,456.3L146.6,463.7L150.2,467.9L144.4,482.6L158.4,480.7L163.9,483.0L162.5,489.7L167.8,494.3L162.1,501.1L162.1,508.3L170.9,511.3L173.4,516.0L165.1,531.3L154.1,530.3L149.2,525.2L141.9,528.0L138.1,533.1L130.0,534.5L123.6,532.0L114.4,532.9L106.6,537.4L97.3,538.9L91.8,528.6L91.0,509.8L85.7,498.6L88.1,494.2L103.5,491.8L107.6,486.0L109.9,474.6L118.4,467.7L123.1,456.0L133.7,456.3Z"},{"n":"Esmeraldas","d":"M259.1,31.1L259.6,42.8L255.6,45.4L255.3,55.9L264.6,62.4L265.7,69.5L258.0,74.3L267.4,91.5L264.6,96.0L255.9,98.5L248.6,108.4L242.2,112.7L238.1,109.7L228.8,109.8L217.7,114.2L207.5,119.3L193.7,115.2L183.0,118.1L175.2,128.8L177.0,135.5L172.9,146.7L180.6,148.3L174.8,160.9L155.2,160.0L149.9,156.2L147.6,145.6L150.2,137.8L139.0,131.5L143.3,124.4L138.3,120.9L139.4,115.6L120.5,118.8L119.9,120.8L111.5,120.6L112.0,113.5L103.8,104.4L109.0,95.1L109.0,88.9L100.0,82.0L100.7,72.5L104.0,68.4L115.2,67.1L129.2,60.5L136.4,53.4L144.8,50.5L155.6,50.4L167.2,42.9L184.6,42.5L197.1,37.8L203.7,28.6L214.7,35.5L214.0,28.2L224.0,24.2L227.0,20.4L226.3,9.3L229.6,8.7L243.7,17.9L250.7,26.1L255.5,25.5L259.1,31.1Z"},{"n":"Guayas","d":"M109.8,418.5L119.9,424.1L116.7,429.2L110.5,430.6L107.3,435.9L96.9,433.1L94.4,437.9L100.8,445.7L97.1,452.5L89.8,453.9L83.7,450.3L84.3,433.5L89.3,423.0L106.5,417.5L109.8,418.5ZM113.1,400.8L110.7,408.9L103.6,409.5L110.4,398.9L113.1,400.8ZM124.9,379.2L123.8,390.9L117.8,386.1L118.7,379.5L124.9,379.2ZM189.7,363.3L197.5,361.4L197.3,370.2L195.9,371.3L192.5,380.4L189.1,381.3L180.9,381.6L174.1,386.3L168.1,387.8L162.0,396.7L167.3,399.9L166.9,408.2L159.8,416.3L156.8,423.3L147.9,425.4L145.3,431.9L150.6,440.2L143.6,447.3L137.4,448.0L133.7,456.3L123.1,456.0L125.4,451.3L124.5,438.9L130.0,428.9L132.3,416.3L136.7,414.3L140.7,402.6L132.8,402.0L126.7,389.6L127.1,370.9L122.9,378.3L113.8,373.5L106.6,389.3L101.8,392.7L101.8,398.9L92.7,409.7L84.2,413.9L85.6,423.7L79.5,422.0L70.5,413.6L65.0,412.9L53.8,400.6L60.5,400.0L63.9,391.4L72.6,384.6L81.7,383.5L81.7,377.3L88.2,373.3L85.4,361.8L66.0,344.3L68.1,328.6L78.7,319.0L86.6,318.8L90.5,292.2L95.3,290.6L96.3,282.4L101.3,282.0L109.4,273.6L111.8,268.3L125.6,258.3L136.9,238.4L139.5,238.3L144.3,240.1L149.3,235.3L159.5,235.4L159.3,244.5L156.2,255.4L148.5,256.4L144.8,261.8L135.5,269.3L134.7,274.5L123.2,293.5L122.9,310.3L127.6,320.8L135.1,323.8L136.9,334.0L144.4,342.3L155.9,338.2L161.1,338.4L165.4,343.5L173.1,347.2L180.9,359.7L189.7,363.3Z"},{"n":"Imbabura","d":"M328.7,114.3L321.8,130.0L313.5,134.2L307.3,131.2L300.5,131.8L294.5,135.9L285.5,137.7L271.9,125.0L259.0,127.3L238.2,128.0L226.6,125.9L215.1,129.7L208.3,122.8L217.7,114.2L228.8,109.8L238.1,109.7L242.2,112.7L248.6,108.4L255.9,98.5L264.6,96.0L267.4,91.5L258.0,74.3L265.7,69.5L264.6,62.4L271.3,67.5L282.9,71.6L296.0,87.5L297.1,96.9L300.7,101.9L308.5,102.6L317.6,109.9L328.7,114.3Z"},{"n":"Loja","d":"M200.5,512.5L190.5,522.5L197.1,538.9L193.8,561.5L199.3,568.5L198.9,590.4L193.2,597.5L182.8,597.4L177.2,601.1L176.7,610.6L167.0,624.1L161.4,612.8L161.1,602.7L155.6,602.6L145.5,593.4L134.9,598.4L128.8,599.1L123.0,591.4L114.1,589.6L100.3,579.4L92.1,580.1L87.6,587.9L76.9,596.5L71.8,597.7L65.0,594.3L64.7,588.2L77.1,572.3L66.5,569.6L61.4,558.2L65.3,549.7L73.3,548.2L80.0,551.7L85.9,545.6L97.3,538.9L106.6,537.4L114.4,532.9L123.6,532.0L130.0,534.5L138.1,533.1L141.9,528.0L149.2,525.2L154.1,530.3L165.1,531.3L173.4,516.0L170.9,511.3L162.1,508.3L162.1,501.1L167.8,494.3L162.5,489.7L163.9,483.0L176.8,484.2L181.1,496.7L192.0,494.2L200.5,512.5Z"},{"n":"Los Rios","d":"M198.7,204.2L201.7,206.7L196.0,221.0L188.1,230.9L185.9,237.5L181.3,239.2L180.8,250.5L176.3,262.4L181.0,270.5L175.1,277.2L182.6,283.8L176.2,296.0L177.8,301.3L185.2,306.0L177.8,315.9L189.0,324.9L183.9,346.0L189.1,357.4L189.7,363.3L180.9,359.7L173.1,347.2L165.4,343.5L161.1,338.4L155.9,338.2L144.4,342.3L136.9,334.0L135.1,323.8L127.6,320.8L122.9,310.3L123.2,293.5L134.7,274.5L135.5,269.3L144.8,261.8L148.5,256.4L156.2,255.4L159.3,244.5L159.5,235.4L149.3,235.3L150.3,224.0L159.4,212.9L161.7,204.3L173.8,204.0L173.7,217.6L180.7,219.9L198.7,204.2Z"},{"n":"Manabi","d":"M155.2,160.0L159.2,166.9L169.0,170.9L169.8,190.3L164.0,200.4L156.3,198.6L147.8,206.4L139.5,238.3L136.9,238.4L125.6,258.3L111.8,268.3L109.4,273.6L101.3,282.0L96.3,282.4L95.3,290.6L90.5,292.2L86.6,318.8L78.7,319.0L68.1,328.6L66.0,344.3L58.0,342.0L48.3,320.9L45.6,317.5L35.2,316.8L29.7,321.1L24.7,310.1L28.2,301.4L33.1,297.9L34.4,282.1L24.9,270.6L18.7,255.8L27.1,245.7L48.2,244.4L56.1,236.5L59.2,223.9L66.2,205.8L60.7,189.9L69.6,180.7L71.6,174.2L80.9,168.5L95.9,154.9L103.9,143.8L110.3,126.7L114.4,130.1L119.9,120.8L120.5,118.8L139.4,115.6L138.3,120.9L143.3,124.4L139.0,131.5L150.2,137.8L147.6,145.6L149.9,156.2L155.2,160.0Z"},{"n":"Morona Santiago","d":"M440.7,411.0L370.8,434.6L325.6,449.9L316.0,456.6L295.7,482.6L290.6,486.6L295.3,497.9L288.4,500.9L285.9,490.9L275.9,488.2L273.5,502.8L247.2,503.4L234.6,506.9L226.8,504.9L223.0,500.2L221.8,490.1L215.7,484.1L214.6,480.0L234.9,464.7L239.7,462.7L246.8,441.5L252.5,434.9L248.5,428.4L252.2,420.7L267.8,413.1L265.6,409.4L254.4,406.0L258.8,404.2L262.7,392.7L261.6,386.7L253.9,382.6L260.0,374.1L259.6,365.7L265.1,361.6L265.8,351.3L261.1,345.9L269.6,337.8L265.9,327.1L267.0,318.5L273.6,314.4L274.2,302.2L292.2,294.8L301.8,299.6L308.1,317.7L315.8,315.3L321.8,320.9L328.1,342.7L343.3,355.1L348.3,354.1L380.9,369.6L387.0,376.1L401.1,384.5L406.8,394.9L415.5,405.5L432.2,405.2L440.7,411.0Z"},{"n":"Napo","d":"M379.4,156.0L381.4,160.3L380.1,170.1L384.3,180.6L378.2,185.7L370.9,199.4L366.8,202.1L353.7,199.8L347.2,204.1L356.2,212.0L360.3,220.2L355.8,229.1L354.8,240.0L357.1,245.1L375.1,236.1L382.2,233.8L387.8,227.2L395.8,239.6L400.8,241.2L403.9,250.8L387.0,252.6L386.5,255.2L364.1,259.9L353.7,265.8L340.5,264.2L326.9,271.7L309.6,272.1L304.8,274.8L297.7,272.2L289.2,264.6L276.3,263.5L277.4,254.0L269.5,249.0L267.3,239.0L270.9,224.9L267.8,221.7L276.8,215.9L282.2,206.9L286.4,193.6L284.5,190.6L290.8,181.9L290.7,170.3L313.1,162.1L318.0,152.9L326.0,147.3L331.4,148.0L332.0,157.8L347.4,157.7L351.9,160.2L363.9,151.9L366.0,163.0L372.2,165.3L379.4,156.0Z"},{"n":"Pastaza","d":"M403.9,250.8L403.7,258.7L420.3,262.7L444.7,255.7L458.5,256.8L457.0,269.2L463.7,275.8L469.2,276.0L477.2,280.6L496.3,277.6L508.8,280.7L514.3,285.4L521.9,285.7L546.8,300.1L552.0,304.7L505.7,362.5L446.6,409.0L440.7,411.0L432.2,405.2L415.5,405.5L406.8,394.9L401.1,384.5L387.0,376.1L380.9,369.6L348.3,354.1L343.3,355.1L328.1,342.7L321.8,320.9L315.8,315.3L308.1,317.7L301.8,299.6L292.2,294.8L298.3,285.1L297.7,272.2L304.8,274.8L309.6,272.1L326.9,271.7L340.5,264.2L353.7,265.8L364.1,259.9L386.5,255.2L387.0,252.6L403.9,250.8Z"},{"n":"Tungurahua","d":"M269.5,249.0L277.4,254.0L276.3,263.5L289.2,264.6L297.7,272.2L298.3,285.1L292.2,294.8L274.2,302.2L261.8,295.3L248.0,300.6L238.9,299.1L231.9,293.2L222.1,296.2L216.2,286.0L223.8,269.1L228.0,264.5L235.6,263.3L243.2,265.5L254.0,255.9L264.1,258.4L269.5,249.0Z"},{"n":"Pichincha","d":"M208.3,122.8L215.1,129.7L226.6,125.9L238.2,128.0L259.0,127.3L271.9,125.0L285.5,137.7L294.5,135.9L300.5,131.8L307.3,131.2L313.5,134.2L312.3,138.8L321.0,141.7L326.0,147.3L318.0,152.9L313.1,162.1L290.7,170.3L290.8,181.9L284.5,190.6L286.4,193.6L282.2,206.9L276.8,215.9L267.8,221.7L258.9,210.8L249.0,210.0L243.0,215.6L236.1,212.1L236.7,205.9L226.8,202.4L226.1,197.7L215.9,183.1L223.9,184.7L235.4,177.7L226.8,168.8L226.2,163.5L213.3,160.2L207.6,161.7L195.2,158.5L200.2,152.6L180.6,148.3L172.9,146.7L177.0,135.5L175.2,128.8L183.0,118.1L197.2,118.0L208.3,122.8Z"},{"n":"Zamora Chinchipe","d":"M273.5,502.8L267.8,519.0L268.8,528.9L262.7,535.4L261.0,543.6L253.3,549.3L255.9,557.5L251.7,563.6L248.6,579.0L244.9,586.2L246.7,591.5L244.0,608.6L238.6,612.8L225.9,615.4L220.9,622.1L220.7,638.7L212.6,639.6L208.6,651.4L202.6,647.1L183.8,646.8L179.4,640.3L170.4,632.5L167.0,624.1L176.7,610.6L177.2,601.1L182.8,597.4L193.2,597.5L198.9,590.4L199.3,568.5L193.8,561.5L197.1,538.9L190.5,522.5L200.5,512.5L204.4,510.5L204.0,492.8L207.1,487.3L215.7,484.1L221.8,490.1L223.0,500.2L226.8,504.9L234.6,506.9L247.2,503.4L273.5,502.8Z"},{"n":"Sucumbios","d":"M583.7,215.5L571.2,210.6L563.5,204.7L554.8,204.9L550.4,198.5L536.0,192.4L527.3,193.8L522.4,191.8L512.7,206.2L504.1,200.5L502.1,194.4L483.4,194.9L471.4,202.1L463.4,198.9L459.5,194.4L441.2,187.1L433.8,176.2L424.5,166.9L419.5,158.4L413.5,156.6L407.0,160.6L389.6,159.9L379.4,156.0L372.2,165.3L366.0,163.0L363.9,151.9L351.9,160.2L347.4,157.7L332.0,157.8L331.4,148.0L326.0,147.3L321.0,141.7L312.3,138.8L313.5,134.2L321.8,130.0L328.7,114.3L328.7,109.7L334.9,99.4L342.1,93.9L344.4,85.2L356.8,84.8L362.1,85.9L357.7,98.0L358.0,107.9L367.9,107.8L381.2,113.7L398.7,112.9L402.3,121.3L409.6,120.3L418.7,125.2L425.3,126.1L436.8,121.2L447.0,123.7L451.5,128.1L468.8,125.8L468.8,112.0L476.6,111.0L478.6,106.6L492.5,112.8L496.8,112.8L508.5,119.7L516.2,130.0L528.6,142.3L535.2,146.4L543.5,145.9L552.0,148.8L567.0,158.3L580.4,160.8L577.8,166.0L568.1,166.5L558.4,161.5L549.0,161.4L549.0,169.3L556.2,167.6L561.7,173.6L562.6,179.5L571.4,193.6L578.4,196.4L585.7,202.7L587.7,212.4L583.7,215.5Z"},{"n":"Orellana","d":"M583.7,215.5L583.1,228.6L587.7,236.5L584.1,247.2L579.4,248.8L571.3,243.2L554.4,304.9L552.0,304.7L546.8,300.1L521.9,285.7L514.3,285.4L508.8,280.7L496.3,277.6L477.2,280.6L469.2,276.0L463.7,275.8L457.0,269.2L458.5,256.8L444.7,255.7L420.3,262.7L403.7,258.7L403.9,250.8L400.8,241.2L395.8,239.6L387.8,227.2L382.2,233.8L375.1,236.1L357.1,245.1L354.8,240.0L355.8,229.1L360.3,220.2L356.2,212.0L347.2,204.1L353.7,199.8L366.8,202.1L370.9,199.4L378.2,185.7L384.3,180.6L380.1,170.1L381.4,160.3L379.4,156.0L389.6,159.9L407.0,160.6L413.5,156.6L419.5,158.4L424.5,166.9L433.8,176.2L441.2,187.1L459.5,194.4L463.4,198.9L471.4,202.1L483.4,194.9L502.1,194.4L504.1,200.5L512.7,206.2L522.4,191.8L527.3,193.8L536.0,192.4L550.4,198.5L554.8,204.9L563.5,204.7L571.2,210.6L583.7,215.5Z"},{"n":"Santo Domingo","d":"M215.9,183.1L213.6,190.0L208.5,192.3L204.0,201.4L198.7,204.2L180.7,219.9L173.7,217.6L173.8,204.0L161.7,204.3L164.0,200.4L169.8,190.3L169.0,170.9L159.2,166.9L155.2,160.0L174.8,160.9L180.6,148.3L200.2,152.6L195.2,158.5L207.6,161.7L213.3,160.2L226.2,163.5L226.8,168.8L235.4,177.7L223.9,184.7L215.9,183.1Z"},{"n":"Santa Elena","d":"M66.0,344.3L85.4,361.8L88.2,373.3L81.7,377.3L81.7,383.5L72.6,384.6L63.9,391.4L60.5,400.0L53.8,400.6L43.8,391.7L31.7,388.7L22.9,382.5L18.9,372.0L33.3,363.0L36.6,353.0L33.7,347.6L37.5,342.6L33.1,326.2L29.7,321.1L35.2,316.8L45.6,317.5L48.3,320.9L58.0,342.0L66.0,344.3Z"},{"n":"Zonas No Delimitadas","d":"M189.1,381.3L187.3,390.9L179.7,390.2L174.1,386.3L180.9,381.6L189.1,381.3ZM164.0,200.4L161.7,204.3L159.4,212.9L150.3,224.0L149.3,235.3L144.3,240.1L139.5,238.3L147.8,206.4L156.3,198.6L164.0,200.4ZM217.7,114.2L208.3,122.8L197.2,118.0L183.0,118.1L193.7,115.2L207.5,119.3L217.7,114.2Z"}];
  // Mapa de obras en Ecuador (sección #mapa-obras)
  var MO=(function(){
    var ACC={"Bolivar":"Bolívar","Manabi":"Manabí","Los Rios":"Los Ríos","Sucumbios":"Sucumbíos","Zonas No Delimitadas":""};
    var SECT={hidro:{c:"#3cc8e8",es:"Hidroeléctrica",en:"Hydropower"},trans:{c:"#8fb2ff",es:"Transporte",en:"Transport"},soc:{c:"#7fd6a4",es:"Obra social",en:"Social work"},edif:{c:"#a9b8cc",es:"Edificación y comercio",en:"Buildings & retail"}};
    var TX={
      es:{all:"Todas",works:"obras en el mapa",provs:"provincias",cities:"ciudades",obras:"obras",obra:"obra",done:"Trabajos realizados",photos:"Ver fotos de la obra",social:"Ver labor social",quote:"Cotizar un proyecto similar",prev:"← Anterior",next:"Siguiente →",client:"Cliente",year:"Año",here:"Nuestras obras aquí",back:"← Volver a ",hq:"Planta Sangolquí",hqL:"Planta Jocecia",ocean:"OCÉANO PACÍFICO",more:function(n){return "y "+n+" trabajos más en otras estaciones"}},
      en:{all:"All",works:"projects on the map",provs:"provinces",cities:"cities",obras:"projects",obra:"project",done:"Work carried out",photos:"See project photos",social:"See our social work",quote:"Quote a similar project",prev:"← Previous",next:"Next →",client:"Client",year:"Year",here:"Our projects here",back:"← Back to ",hq:"Sangolquí plant",hqL:"Jocecia plant",ocean:"PACIFIC OCEAN",more:function(n){return "and "+n+" more jobs at other stations"}},
      zh:{all:"全部",works:"个项目在地图上",provs:"个省份",cities:"座城市",obras:"个项目",obra:"个项目",done:"已完成的工作",photos:"查看项目照片",social:"查看我们的社会公益",quote:"咨询类似项目报价",prev:"← 上一个",next:"下一个 →",client:"客户",year:"年份",here:"我们在这里的项目",back:"← 返回 ",hq:"Sangolquí 工厂",hqL:"Jocecia 工厂",ocean:"太平洋",more:function(n){return "以及其他车站的另外 "+n+" 项工作"}}
    };
    var OBRAS=[
      {id:"vistavalle",pr:"pr7",cg:"quito",s:"edif",lat:-0.2965,lon:-78.457,city:"Valle de los Chillos",prov:"Pichincha",
        es:{t:"Vista Valle · Coral Center",d:"Armado de estructuras metálicas y volados del centro comercial."},en:{t:"Vista Valle · Coral Center",d:"Steel structure and cantilever assembly for the shopping center."}},
      {id:"colegio",pr:"pr8",cg:"quito",s:"edif",apx:1,lat:-0.176,lon:-78.357,city:"Puembo, Quito",prov:"Pichincha",
        es:{t:"Proyecto Colegio Americano",d:"Fabricación y montaje de estructuras metálicas."},en:{t:"Colegio Americano project",d:"Steel structure manufacturing and installation."}},
      {id:"bauhaus",pr:"pr9",cg:"quito",s:"edif",apx:1,lat:-0.183,lon:-78.484,city:"Quito",prov:"Pichincha",
        es:{t:"Proyecto Bauhaus",d:"Estructuras metálicas para un edificio de altura."},en:{t:"Bauhaus project",d:"Steel structures for a high-rise building."}},
      {id:"carls",pr:"pr10",cg:"quito",s:"edif",apx:1,lat:-0.195,lon:-78.493,city:"Quito",prov:"Pichincha",
        es:{t:"Carl's Jr. · Olive Garden Quito",d:"Soporte metálico para conservar un árbol."},en:{t:"Carl's Jr. · Olive Garden Quito",d:"Steel support to preserve a tree."}},
      {id:"metro",pr:"pr1",cg:"quito",s:"trans",lat:-0.2205,lon:-78.5145,lbl:"r",off:[-6,-16],city:"Quito",prov:"Pichincha",cl:"Metro de Quito",more:7,
        es:{t:"Metro de Quito",d:"Montaje y fabricación de escaleras y perfilería metálica en estaciones, talleres y cocheras.",f:["Escaleras provisionales en la Estación San Francisco","Escaleras bajo andén en Universidad Central, El Ejido y La Alameda","Escaleras bajo andén en El Recreo, Cardenal de la Torre y Solanda","Perfilería galvanizada en la Estación Iñaquito","Estructura de plenum y montaje de tramex en Talleres y Cocheras","Pendolón para soporte de catenaria"]},
        en:{t:"Quito Metro",d:"Manufacture and installation of stairs and steel profiles at stations, workshops and depots.",f:["Temporary stairs at San Francisco Station","Under-platform stairs at Universidad Central, El Ejido and La Alameda","Under-platform stairs at El Recreo, Cardenal de la Torre and Solanda","Galvanized profiles at Iñaquito Station","Plenum structure and grating at the workshops and depots","Catenary support hangers"]}},
      {id:"manduriacu",pr:"pr3",cg:"pacto",s:"hidro",lat:0.3104,lon:-78.8586,lbl:"l",city:"Río Guayllabamba",prov:"Pichincha / Imbabura",cl:"CELEC EP",
        es:{t:"Central Manduriacu",d:"Andamiaje, pintura de tubería y turbinas para la central hidroeléctrica.",f:["Andamios trepantes y deslizantes","Pintura de tubería","Turbinas para planta de aguas residuales"]},
        en:{t:"Manduriacu plant",d:"Scaffolding, pipe painting and turbines for the hydropower plant.",f:["Climbing and sliding scaffolding","Pipe painting","Turbines for a wastewater plant"]}},
      {id:"agoyan",pr:"pr2",cg:"banos",s:"hidro",lat:-1.3967,lon:-78.3836,lbl:"l",off:[-14,-14],city:"Baños de Agua Santa",prov:"Tungurahua",cl:"CELEC EP",
        es:{t:"Central Agoyán",d:"Trabajos de reparación e infraestructura metálica en la central.",f:["Reparaciones en alturas con equipos especiales","Soldadura de infraestructura metálica"]},
        en:{t:"Agoyán plant",d:"Repair and steel infrastructure work at the plant.",f:["Repairs at height with special equipment","Welding of steel infrastructure"]}},
      {id:"sanfco",pr:"pr4",cg:"banos",s:"hidro",lat:-1.43,lon:-78.29,lbl:"r",off:[30,22],city:"Río Verde, Baños",prov:"Tungurahua",cl:"CELEC EP",
        es:{t:"Central San Francisco",d:"Mantenimiento mecánico e hidráulico de la central.",f:["Suministros y materiales para mantenimiento mecánico","Soportería metálica para el skid del sistema de limpieza"]},
        en:{t:"San Francisco plant",d:"Mechanical and hydraulic maintenance of the plant.",f:["Supplies and materials for mechanical maintenance","Steel supports for the cleaning system skid"]}},
      {id:"tunel",pr:"pr11",cg:"banos",s:"trans",apx:1,lat:-1.3965,lon:-78.43,lbl:"l",city:"Baños de Agua Santa",prov:"Tungurahua",
        es:{t:"Túnel de Baños",d:"Colocación de pernos de anclaje para el sostenimiento del túnel."},en:{t:"Baños tunnel",d:"Rock bolt installation to support the tunnel."}},
      {id:"otavalo",cg:"otavalo",s:"soc",lat:0.1995,lon:-78.229,lbl:"r",off:[22,-10],city:"San Rafael de la Laguna",prov:"Imbabura",year:"2023",img:"/img/wp/2025/01/Social2.png",
        es:{t:"Comunidad San Rafael de la Laguna",d:"Capacitación en manejo de desechos sólidos y aguas servidas, donación de biodigestores y una red para emprendimientos.",f:["Capacitación a la comunidad","Donación de biodigestores","Red para emprendimientos"]},
        en:{t:"San Rafael de la Laguna community",d:"Training in solid waste and wastewater management, donated biodigesters and a network for small businesses.",f:["Community training","Donated biodigesters","Small business network"]}},
      {id:"esmeraldas",cg:"esm",s:"soc",lat:0.9592,lon:-79.6539,lbl:"r",city:"Esmeraldas",prov:"Esmeraldas",year:"2021",cl:"ONG AMU · Sunrise+",
        es:{t:"Panadería comunitaria",d:"Donación e instalación del techo de una panadería comunitaria, con el proyecto Sunrise+ de la ONG AMU.",f:["Donación de la estructura y cubierta","Instalación en sitio"]},
        en:{t:"Community bakery",d:"Roof donated and installed for a community bakery, with the AMU NGO's Sunrise+ project.",f:["Donated structure and roofing","On-site installation"]}}
    ];
    var PRURL={"pr7":"vista-valle-coral-center","pr8":"colegio-americano","pr9":"proyecto-bauhaus","pr10":"carls-jr-olive-garden-quito","pr5":"galpon-cadeco","pr6":"funvivalt-monserrat","pr11":"tunel-banos","pr1":"metro-de-quito","pr2":"central-agoyan","pr3":"central-manduriacu","pr4":"central-san-francisco"};
    var CITIES=[
      {k:"quito",n:"Quito",prov:"Pichincha",lat:-0.2205,lon:-78.5145,side:"r",es:"Capital del país. Trabajamos en la primera línea del Metro.",en:"The capital. We worked on the first Metro line."},
      {k:"pacto",n:"Pacto",prov:"Pichincha",lat:0.3104,lon:-78.8586,side:"l",es:"Parroquia del noroccidente de Quito, junto al río Guayllabamba.",en:"Rural parish northwest of Quito, on the Guayllabamba river."},
      {k:"otavalo",n:"Otavalo",prov:"Imbabura",lat:0.2343,lon:-78.2611,side:"r",es:"Ciudad de la sierra norte, junto al lago San Pablo.",en:"Northern highlands town by San Pablo lake."},
      {k:"banos",n:"Baños",prov:"Tungurahua",lat:-1.3964,lon:-78.4247,side:"r",es:"Zona de las centrales hidroeléctricas del río Pastaza.",en:"Home to the Pastaza river hydropower plants."},
      {k:"esm",n:"Esmeraldas",prov:"Esmeraldas",lat:0.9592,lon:-79.6539,side:"r",es:"Ciudad del norte de la costa ecuatoriana.",en:"City on Ecuador's northern coast."}
    ];
    var REFS=[["Guayaquil",-2.19,-79.89],["Cuenca",-2.90,-79.00],["Manta",-0.95,-80.73],["Portoviejo",-1.05,-80.45],["Santo Domingo",-0.25,-79.17],["Ambato",-1.24,-78.62],["Riobamba",-1.67,-78.65],["Latacunga",-0.93,-78.62],["Loja",-3.99,-79.20],["Machala",-3.26,-79.96],["Ibarra",0.35,-78.12],["Tena",-0.99,-77.81],["Puyo",-1.49,-78.00],["Nueva Loja",0.08,-76.89],["Macas",-2.31,-78.12],["Babahoyo",-1.80,-79.53]];
    var PEAKS=[["Chimborazo",6263,-1.469,-78.817,"l"],["Cotopaxi",5897,-0.683,-78.437,"r"],["Cayambe",5790,0.029,-77.986,"r"],["Sangay",5230,-2.005,-78.341,"r"]];
    var HQ={lat:-0.3125,lon:-78.4475};
    var NS="http://www.w3.org/2000/svg",$=function(id){return document.getElementById(id)};
    function P(lon,lat){return[(lon+81.1)*100,(1.5-lat)*100]}
    function el(t,a,p){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
    function L(){return JL()}
    function T(){return ZO(TX)}
    function fmt(v,a,b){return Math.abs(v).toFixed(2)+"° "+(v>=0?a:b)}
    function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
    var filter="all",mode="obras",sel="metro";
    // ---- Mapa sobre paisaje satelital: fondo fijo + marcadores calibrados con la misma cámara del render ----
    function SAT(){
      var box=$('sat'),pinsEl=$('sat-pins'),card=$('sat-card'),wire=$('sat-wire'),chips=$('sat-chips');
      var PT={desk:{w:2560,h:1440,ox:.62,oy:.25,p:{metro:[.61157,.2305],manduriacu:[.58144,.18239],agoyan:[.62834,.37104],sanfco:[.63677,.37247],otavalo:[.63202,.18626],esmeraldas:[.51864,.12301],vistavalle:[0.61654,0.23843],colegio:[0.62383,0.22327],bauhaus:[0.61379,0.22579],carls:[0.61314,0.22729],tunel:[0.62443,0.37223]}},
              mob:{w:1080,h:1350,ox:.5,oy:.5,p:{metro:[.51264,.29998],manduriacu:[.46258,.24881],agoyan:[.53285,.43262],sanfco:[.54722,.43516],otavalo:[.55419,.25587],esmeraldas:[.35075,.18647],vistavalle:[0.52106,0.30789],colegio:[0.53551,0.29384],bauhaus:[0.51705,0.29561],carls:[0.51575,0.29700],tunel:[0.52591,0.43322]}}};
      // nombres de provincia (misma cámara que el paisaje); las que tienen obras se resaltan
      var PV=[["Azuay",0.5666,0.5805,0.407,0.627],["Bolívar",0.5623,0.4136,0.4116,0.4725],["Cañar",0.5729,0.5116,0.4234,0.5635],["Carchi",0.6572,0.1261,0.677,0.1696],["Cotopaxi",0.5876,0.3186,0.3829,0.3844],["Chimborazo",0.6008,0.4435,0.4763,0.5035],["El Oro",0.5075,0.6648,0.3044,0.6931],["Esmeraldas",0.5424,0.1441,0.3433,0.2086],["Guayas",0.4903,0.4462,0.2841,0.4985],["Imbabura",0.6162,0.1456,0.5489,0.214],["Loja",0.5398,0.7539,0.3542,0.7703],["Los Ríos",0.5252,0.3933,0.3485,0.4497],["Manabí",0.4893,0.2751,0.2892,0.3378],["Morona Santiago",0.6751,0.513,0.6041,0.5615],["Napo",0.6608,0.299,0.657,0.3756],["Pastaza",0.7742,0.4326,0.7885,0.4866],["Tungurahua",0.6015,0.356,0.4851,0.42],["Pichincha",0.5816,0.2644,0.4561,0.3321],["Zamora Chinchipe",0.602,0.7096,0.4622,0.7329],["Sucumbíos",0.7928,0.2273,0.8486,0.2913],["Orellana",0.8363,0.3243,0.9144,0.3851],["Santo Domingo",0.5418,0.2359,0.3362,0.3023],["Santa Elena",0.4446,0.476,0.2021,0.5259]];
      var provsEl=$('sat-provs'),conObra={};OBRAS.forEach(function(o){o.prov.split(' / ').forEach(function(p){conObra[p]=1})});
      PV.forEach(function(p){var e=document.createElement('span');e.className='sat-prov'+(conObra[p[0]]?' has':'');e.textContent=p[0];provsEl.appendChild(e);p.el=e});
      var mq=matchMedia('(max-width:760px)'),flt='all',cur=0,shown=-1,hov=0,fijo=false,stage=$('sat-stage'),cardHome=card.parentNode,clk=null,CL={};
      // en el celular, las obras de una misma ciudad se juntan en un círculo con el número
      CITIES.forEach(function(c){var b=document.createElement('button');b.type='button';b.className='sat-pin sat-cl';b.innerHTML='<span class="n"></span>';
        pinsEl.appendChild(b);CL[c.k]={c:c,el:b,m:[],xy:[0,0]};b.addEventListener('click',function(e){e.preventDefault();showCl(c.k)})});
      OBRAS.forEach(function(o,i){var b=document.createElement('button');b.type='button';b.className='sat-pin';b.dataset.i=i;b.innerHTML='<span class="g"></span><span class="h"></span>';
        b.setAttribute('aria-label',o.es.t+' · '+o.city);pinsEl.appendChild(b);o.satEl=b;
        // con el mouse: el punto se muestra si te quedas un momento encima; tras un clic la ficha queda fija
        // (así, al ir hacia "Ver proyecto" pasando por otros puntos, la ficha no cambia)
        b.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'&&!fijo){clearTimeout(hov);hov=setTimeout(function(){show(i);box.classList.add('used')},180)}});
        b.addEventListener('pointerleave',function(){clearTimeout(hov)});
        b.addEventListener('focus',function(){if(!fijo)show(i)});
        b.addEventListener('click',function(e){e.preventDefault();clearTimeout(hov);fijo=true;show(i);box.classList.add('used')})});
      function vis(o){return flt==='all'||o.s===flt}
      function layout(){var c=mq.matches?PT.mob:PT.desk,W=pinsEl.clientWidth,H=pinsEl.clientHeight,PW=c===PT.mob?PV.map(function(p){return p.el.offsetWidth}):[],s=Math.max(W/c.w,H/c.h),x0=(W-c.w*s)*c.ox,y0=(H-c.h*s)*c.oy;
        var base=OBRAS.map(function(o){var p=c.p[o.id];return[x0+p[0]*c.w*s,y0+p[1]*c.h*s]}),mob=c===PT.mob,M=mob?40:26,un=[];
        // celular: las obras visibles de una misma ciudad forman un solo círculo; escritorio: cada obra su punto
        for(var k in CL)CL[k].m=[];
        OBRAS.forEach(function(o,i){if(mob&&vis(o))CL[o.cg].m.push(i)});
        OBRAS.forEach(function(o,i){var g=CL[o.cg];if(mob&&vis(o)&&g.m.length>1){if(g.m[0]===i)un.push({g:g,m:g.m})}else un.push({m:[i]})});
        un.forEach(function(u){var x=0,y=0;u.m.forEach(function(i){x+=base[i][0];y+=base[i][1]});u.p=[x/u.m.length,y/u.m.length]});
        // lo que queda muy junto se aparta lo justo para poder tocarlo
        for(var it=0;it<40;it++)for(var i=0;i<un.length;i++)for(var j=i+1;j<un.length;j++){var P1=un[i].p,P2=un[j].p,a=P2[0]-P1[0],b=P2[1]-P1[1],dd=Math.hypot(a,b);
          if(dd<M){if(dd<.01){a=Math.cos(i+j);b=Math.sin(i+j);dd=1}var q=(M-dd)/2/dd;P1[0]-=a*q;P1[1]-=b*q;P2[0]+=a*q;P2[1]+=b*q}}
        for(k in CL)CL[k].el.style.display='none';
        un.forEach(function(u){u.m.forEach(function(i){var o=OBRAS[i];o.satXY=[u.p[0],u.p[1]];o.satEl.classList.toggle('cl-in',!!u.g);o.satEl.style.transform='translate('+u.p[0]+'px,'+u.p[1]+'px)'});
          if(u.g){u.g.xy=u.p;u.g.el.style.display='';u.g.el.firstChild.textContent=u.m.length;u.g.el.style.transform='translate('+u.p[0]+'px,'+u.p[1]+'px)';
            u.g.el.setAttribute('aria-label',u.g.c.n+' · '+u.m.length+(TR(' obras',' projects')))}});
        if(clk&&!(CL[clk].m.length>1&&mob))clk=null;
        PV.forEach(function(p,pi){var x=x0+(mob?p[3]:p[1])*c.w*s,y=y0+(mob?p[4]:p[2])*c.h*s;
          // celular: si el nombre queda bajo un punto, se corre a un lado para que se lea entero
          if(mob){var hw=PW[pi]/2+22;un.forEach(function(u){var ux=u.p[0],uy=u.p[1]-(u.g?0:14);if(Math.abs(uy-y)<20&&Math.abs(ux-x)<hw)x=x<ux?ux-hw:ux+hw})}p.el.style.transform='translate('+x+'px,'+y+'px) translate(-50%,-50%)'});place()}
      function fill(i){var o=OBRAS[i],t=ZO(o),u=o.img||(o.pr&&PRODS[o.pr]&&PRODS[o.pr].img[0]),lbl=TR('Ver proyecto','View project');
        var arrow='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';
        card.style.setProperty('--c',SECT[o.s].c);
        card.innerHTML='<div class="ph">'+(u?'<img src="'+VI(u,640)+'" alt="'+esc(t.t)+'" decoding="async" onload="this.classList.add(\'ok\')" onerror="this.remove()">':'')+'<span class="badge"><i></i>'+ZO(SECT[o.s])+'</span></div>'+
          '<button type="button" class="x" aria-label="'+(TR('Cerrar','Close'))+'">×</button><div class="bd">'+(o.satEl.classList.contains('cl-in')&&mq.matches?'<button type="button" class="bk" data-k="'+o.cg+'">‹ '+(TR('Todas en ','All in '))+esc(CL[o.cg].c.n)+'</button>':'')+'<p class="tt">'+esc(t.t)+'</p><span class="loc">'+esc(o.city)+' · '+esc(o.prov)+(o.apx?(TR(' (aprox.)',' (approx.)')):'')+'</span>'+(o.pr?'<a class="go" href="/proyectos/'+PRURL[o.pr]+'">'+lbl+arrow+'</a>':'<a class="go" href="#social">'+lbl+arrow+'</a>')+'</div>';
        var im=card.querySelector('img');if(im&&im.complete&&im.naturalWidth)im.classList.add('ok')}
      function show(i){cur=i;clk=null;card.classList.remove('lst');if(i!==shown){fill(i);shown=i}OBRAS.forEach(function(o,k){o.satEl.classList.toggle('on',k===i)});
        for(var k in CL)CL[k].el.classList.toggle('on',OBRAS[i].satEl.classList.contains('cl-in')&&OBRAS[i].cg===k);card.classList.add('open');place()}
      function showCl(k){var g=CL[k],l=L();clk=k;shown=-1;card.classList.add('lst');
        card.innerHTML='<button type="button" class="x" aria-label="'+(TR('Cerrar','Close'))+'">×</button><div class="lh"><b>'+esc(g.c.n)+' · '+g.m.length+(TR(' obras',' projects'))+'</b><span>'+esc(g.c.prov)+(TR(' · toca una para verla',' · tap one to see it'))+'</span></div><ul class="ls">'+
          g.m.map(function(i){var o=OBRAS[i];return '<li><button type="button" data-i="'+i+'" style="--c:'+SECT[o.s].c+'"><i></i>'+esc(ZO(o).t)+'<em>›</em></button></li>'}).join('')+'</ul>';
        OBRAS.forEach(function(o){o.satEl.classList.remove('on')});for(var q in CL)CL[q].el.classList.toggle('on',q===k);card.classList.add('open');box.classList.add('used');place()}
      function place(){var o=OBRAS[cur];if(!o||!o.satXY)return;var XY=clk?CL[clk].xy:o.satXY;
        if(mq.matches){wire.classList.remove('on');if(card.parentNode!==stage)return;
          // globo encima del punto; si no cabe arriba, va debajo
          var Ws=stage.clientWidth,cw=card.offsetWidth,ch=card.offsetHeight,px=XY[0],py=XY[1],t=py-44-ch,below=t<8;
          if(below)t=py+16;var l=Math.max(12,Math.min(Ws-cw-12,px-cw/2));
          card.classList.toggle('below',below);card.style.setProperty('left',l+'px','important');card.style.setProperty('top',t+'px','important');card.style.setProperty('--ax',Math.max(22,Math.min(cw-22,px-l))+'px');return}
        var W=pinsEl.clientWidth,H=pinsEl.clientHeight,cw=card.offsetWidth,ch=card.offsetHeight,x=o.satXY[0],y=o.satXY[1]-14,side=1;
        // la tarjeta va a la derecha de todos los marcadores para no tapar ninguno
        var mx=Math.max.apply(null,OBRAS.map(function(q){return q.satXY[0]})),L0=Math.max(x+72,mx+56);
        if(L0+cw>W-24){var mn=Math.min.apply(null,OBRAS.map(function(q){return q.satXY[0]}));L0=Math.min(x-72,mn-56)-cw;side=-1}
        var T0=Math.max(84,Math.min(H-ch-70,y-ch*.38));card.style.left=L0+'px';card.style.top=T0+'px';
        var ex=side>0?L0:L0+cw,ey=Math.max(T0+30,Math.min(T0+ch-30,y)),ln=wire.querySelector('line'),ci=wire.querySelector('circle');
        ln.setAttribute('x1',x+side*12);ln.setAttribute('y1',y);ln.setAttribute('x2',ex);ln.setAttribute('y2',ey);ci.setAttribute('cx',ex);ci.setAttribute('cy',ey);wire.classList.add('on')}
      function chipsRender(){var X=T(),l=L(),u=[];OBRAS.forEach(function(o){if(u.indexOf(o.s)<0)u.push(o.s)});
        chips.innerHTML=[["all",X.all,null]].concat(u.map(function(k){return[k,ZO(SECT[k]),SECT[k].c]})).map(function(a){return '<button type="button" aria-pressed="'+(flt===a[0])+'" data-k="'+a[0]+'"'+(a[2]?' style="--c:'+a[2]+'"><i></i>':'>')+a[1]+'</button>'}).join('')}
      function mobCard(){if(mq.matches){if(card.parentNode!==stage){stage.appendChild(card);cerrar()}}
        else if(card.parentNode!==cardHome){cardHome.appendChild(card);card.style.removeProperty('left');card.style.removeProperty('top');show(cur)}}
      function cerrar(){card.classList.remove('open');clk=null;OBRAS.forEach(function(o){o.satEl.classList.remove('on')});for(var k in CL)CL[k].el.classList.remove('on')}
      card.addEventListener('click',function(e){var t=e.target;if(t.closest('.x,.bk,.ls button'))e.stopPropagation();if(t.closest('.x'))cerrar();else if(t.closest('.bk'))showCl(t.closest('.bk').dataset.k);else if(t.closest('.ls button'))show(+t.closest('.ls button').dataset.i)});
      stage.addEventListener('click',function(e){if(mq.matches&&!e.target.closest('.sat-pin,.sat-card'))cerrar()});
      chips.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;flt=b.dataset.k;chipsRender();
        OBRAS.forEach(function(o){o.satEl.classList.toggle('off',!vis(o))});layout();if(mq.matches&&card.classList.contains('open')&&(clk||!vis(OBRAS[cur])))cerrar();else if(!vis(OBRAS[cur])){for(var i=0;i<OBRAS.length;i++)if(vis(OBRAS[i])){show(i);break}}});
      var hint=document.querySelector('#sat-hint span'),fineP=matchMedia('(hover:hover) and (pointer:fine)').matches;if(!fineP)hint.removeAttribute('data-i18n');
      function hintTx(){if(!fineP)hint.textContent=TR('Toca un punto para ver la obra','Tap a point to see the project')}hintTx();
      chipsRender();addEventListener('resize',layout);if(mq.addEventListener)mq.addEventListener('change',function(){mobCard();layout()});
      var im=$('sat-img');if(!im.complete)im.addEventListener('load',layout);
      // versión clara: paisaje con el entorno en papel claro para que Ecuador resalte sobre fondo blanco
      var sec=$('proyectos'),src=$('sat-src'),img=$('sat-img');
      function light(){var t=document.documentElement.dataset.theme;return t?t==='light':!matchMedia('(prefers-color-scheme: dark)').matches}
      function theme(){var lt=light(),sf=lt?'-claro':'';box.classList.toggle('lt',lt);
        src.srcset='/img/paisaje-ecuador-movil-720'+sf+'.webp 720w, /img/paisaje-ecuador-movil-860'+sf+'.webp 860w, /img/paisaje-ecuador-movil'+sf+'.webp 1080w';img.srcset='/img/paisaje-ecuador-1600'+sf+'.webp 1600w, /img/paisaje-ecuador-2560'+sf+'.webp 2560w';img.src='/img/paisaje-ecuador-1600'+sf+'.webp'}
      theme();new MutationObserver(theme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
      var dm=matchMedia('(prefers-color-scheme: dark)');if(dm.addEventListener)dm.addEventListener('change',theme);
      // los sectores con obras ubicadas abren el mapa ya filtrado
      window.satFilter=function(k){flt=k;chipsRender();OBRAS.forEach(function(o){o.satEl.classList.toggle('off',!vis(o))});layout();
        for(var i=0;i<OBRAS.length;i++)if(vis(OBRAS[i])){show(i);break}box.scrollIntoView({behavior:'smooth',block:'start'})};
      document.querySelectorAll('.sector .map-link').forEach(function(b){b.addEventListener('click',function(){satFilter(b.dataset.s)})});
      layout();show(0);mobCard();
      function fromHash(){var m=/^#obra-([\w-]+)/.exec(location.hash);if(!m)return;for(var i=0;i<OBRAS.length;i++)if(OBRAS[i].id===m[1]){show(i);box.classList.add('used');box.scrollIntoView({block:'start'});break}}
      fromHash();addEventListener('hashchange',fromHash);
      if('IntersectionObserver' in window){new IntersectionObserver(function(es,ob){es.forEach(function(e){if(e.isIntersecting){box.classList.add('in');ob.disconnect()}})},{threshold:.2}).observe(box)}else box.classList.add('in');
      return function(){chipsRender();hintTx();shown=-1;var op=card.classList.contains('open');if(clk)showCl(clk);else show(cur);if(mq.matches&&!op)cerrar()};
    }
    if(!$('mo-svg'))return $('sat')?SAT():function(){};
    // retícula
    var grat=$('mo-grat'),glab=$('mo-glab');
    for(var la=1;la>=-5;la--){var y=P(-81,la)[1];el("line",{x1:-10,x2:610,y1:y,y2:y,stroke:"rgba(255,255,255,.12)","stroke-dasharray":"2 6"},grat);el("text",{"class":"mo-gl",x:596,y:y-4,"text-anchor":"end"},glab).textContent=la===0?"0° Ecuador":Math.abs(la)+"° "+(la>0?"N":"S")}
    var withObra={};OBRAS.forEach(function(o){o.prov.split(" / ").forEach(function(p){withObra[p]=1})});
    MO_PROVS.forEach(function(p){var n=ACC.hasOwnProperty(p.n)?ACC[p.n]:p.n;var e=el("path",{d:p.d,"class":"mo-prov","data-n":n},$('mo-provs'));if(n)el("title",{},e).textContent=n});
    PEAKS.forEach(function(k){var xy=P(k[3],k[2]);var g=el("g",{"class":"mo-peak",transform:"translate("+xy[0]+" "+xy[1]+")"},$('mo-peaks'));el("path",{d:"M0,-6L5,3H-5Z"},g);var t=el("text",{x:k[4]==="l"?-8:8,y:3,"text-anchor":k[4]==="l"?"end":"start"},g);t.textContent=k[0]+" ";var ts=el("tspan",{},t);ts.textContent=k[1].toLocaleString("es-EC")+" m"});
    REFS.forEach(function(r){var xy=P(r[2],r[1]);var g=el("g",{"class":"mo-ref",transform:"translate("+xy[0]+" "+xy[1]+")"},$('mo-refs'));el("circle",{r:2.6},g);el("text",{x:5,y:3.5},g).textContent=r[0]});
    // pines por obra
    var pins=$('mo-pins'),hqxy=P(HQ.lon,HQ.lat);
    var hq=el("g",{"class":"mo-pin mo-hq",transform:"translate("+(hqxy[0]+14)+" "+(hqxy[1]+12)+")"},pins);
    el("line",{"class":"mo-lead",x1:-14,y1:-12,x2:0,y2:0},hq);el("circle",{"class":"mo-true",cx:-14,cy:-12,r:2},hq);
    el("rect",{"class":"dot",x:-7,y:-7,width:14,height:14,rx:3,transform:"rotate(45)"},hq);
    var hqLbl=el("text",{"class":"lbl",x:12,y:18},hq);
    OBRAS.forEach(function(o,i){
      var xy=P(o.lon,o.lat),d=o.off||[0,0];
      if(d[0]||d[1]){el("line",{"class":"mo-lead",x1:xy[0],y1:xy[1],x2:xy[0]+d[0],y2:xy[1]+d[1]},pins);el("circle",{"class":"mo-true",cx:xy[0],cy:xy[1],r:2.2},pins)}
      var g=el("g",{"class":"mo-pin",transform:"translate("+(xy[0]+d[0])+" "+(xy[1]+d[1])+")",tabindex:0,role:"button","data-id":o.id,style:"--c:"+SECT[o.s].c},pins);
      el("circle",{"class":"halo",r:20},g);el("circle",{"class":"dot",r:12},g);el("text",{"class":"num"},g).textContent=i+1;
      var r=o.lbl!=="l";o.lblEl=el("text",{"class":"lbl",x:r?18:-18,y:5,"text-anchor":r?"start":"end"},g);o.pinEl=g;
      g.addEventListener("click",function(){showObra(o.id)});
      g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();showObra(o.id)}});
    });
    var cG=$('mo-cities');
    function vis(o){return filter==="all"||o.s===filter}
    function obrasDe(k){return OBRAS.filter(function(o){return o.cg===k&&vis(o)})}
    function byId(id){for(var i=0;i<OBRAS.length;i++)if(OBRAS[i].id===id)return OBRAS[i]}
    function cityBy(k){for(var i=0;i<CITIES.length;i++)if(CITIES[i].k===k)return CITIES[i]}
    function hiProv(list){document.querySelectorAll('.mo-prov').forEach(function(p){p.classList.toggle('on',list.indexOf(p.dataset.n)>=0)})}
    function drawCities(){
      cG.innerHTML="";
      CITIES.forEach(function(c){
        var os=obrasDe(c.k);if(!os.length)return;
        var xy=P(c.lon,c.lat),col=SECT[os[0].s].c;
        var g=el("g",{"class":"mo-city"+(sel==="c:"+c.k?" sel":""),transform:"translate("+xy[0]+" "+xy[1]+")",tabindex:0,role:"button","aria-label":c.n+", "+os.length+" "+(os.length===1?T().obra:T().obras),style:"--c:"+col},cG);
        var w=c.n.length*7.2+44,bx=c.side==="l"?-w-8:8;
        el("circle",{"class":"tip",r:4},g);el("rect",{x:bx,y:-14,width:w,height:28,rx:14},g);
        el("text",{"class":"cn",x:bx+12,y:4.5},g).textContent=c.n;
        el("circle",{"class":"cc",cx:bx+w-15,cy:0,r:10},g);el("text",{"class":"ct",x:bx+w-15,y:.5},g).textContent=os.length;
        g.addEventListener("click",function(){showCity(c.k)});
        g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();showCity(c.k)}});
      });
    }
    function photo(o,w){var u=o.img||(o.pr&&PRODS[o.pr]&&PRODS[o.pr].img[0]);return u?'<img src="'+VI(u,w||640)+'" alt="" loading="lazy" decoding="async">':''}
    function showObra(id,fromCity){
      var o=byId(id),i=OBRAS.indexOf(o),t=ZO(o),X=T();sel=id;
      OBRAS.forEach(function(x){x.pinEl.classList.toggle('sel',x.id===id)});
      document.querySelectorAll('.mo-row').forEach(function(r){r.classList.toggle('sel',r.dataset.id===id)});
      hiProv(o.prov.split(" / "));
      var where='<span><b>'+esc(o.city)+'</b>, '+esc(o.prov)+'</span><span>'+fmt(o.lat,"N","S")+' · '+fmt(o.lon,"E",TR("O","W"))+'</span>'+(o.cl?'<span>'+X.client+': <b>'+esc(o.cl)+'</b></span>':'')+(o.year?'<span>'+X.year+': <b>'+o.year+'</b></span>':'');
      var list='<h4>'+X.done+'</h4><ul>'+t.f.map(function(f){return '<li>'+esc(f)+'</li>'}).join('')+(o.more?'<li>'+X.more(o.more)+'</li>':'')+'</ul>';
      var gal=o.pr?'<button type="button" class="btn btn-accent" id="mo-gal">'+X.photos+'</button>':'<a class="btn btn-accent" href="#social">'+X.social+'</a>';
      var nav=fromCity?'':'<div class="mo-nav"><button type="button" id="mo-prev">'+X.prev+'</button><span>'+(i+1)+' / '+OBRAS.length+'</span><button type="button" id="mo-next">'+X.next+'</button></div>';
      $('mo-panel').innerHTML='<div class="mo-ph" style="--c:'+SECT[o.s].c+'">'+photo(o)+'<span class="mo-badge">'+('0'+(i+1)).slice(-2)+' · '+ZO(SECT[o.s]).toUpperCase()+'</span></div>'+
        '<div class="mo-body">'+(fromCity?'<button type="button" class="mo-back" id="mo-back">'+X.back+esc(cityBy(fromCity).n)+'</button>':'')+'<h3>'+esc(t.t)+'</h3><div class="mo-where">'+where+'</div><p>'+esc(t.d)+'</p>'+list+
        '<div class="mo-actions">'+gal+'<a class="btn btn-line" href="#contacto">'+X.quote+'</a></div></div>'+nav;
      if(o.pr)$('mo-gal').onclick=function(){openPd(o.pr)};
      if(fromCity)$('mo-back').onclick=function(){showCity(fromCity)};
      else{var step=function(dd){var v=OBRAS.filter(vis),k=v.indexOf(o);showObra(v[(k+dd+v.length)%v.length].id)};$('mo-prev').onclick=function(){step(-1)};$('mo-next').onclick=function(){step(1)}}
    }
    function showCity(k){
      var c=cityBy(k),os=obrasDe(k),X=T();sel="c:"+k;drawCities();
      document.querySelectorAll('.mo-row').forEach(function(r){r.classList.toggle('sel',r.dataset.id==="c:"+k)});
      hiProv([c.prov]);
      var col=SECT[(os[0]||OBRAS[0]).s].c;
      $('mo-panel').innerHTML='<div class="mo-ph city" style="--c:'+col+'">'+(os[0]?photo(os[0]):'')+'<span class="mo-badge">'+os.length+' '+(os.length===1?X.obra:X.obras).toUpperCase()+' · '+c.prov.toUpperCase()+'</span></div>'+
        '<div class="mo-body"><h3>'+esc(c.n)+'</h3><div class="mo-where"><span><b>'+esc(c.prov)+'</b></span><span>'+fmt(c.lat,"N","S")+' · '+fmt(c.lon,"E",TR("O","W"))+'</span></div><p>'+esc(ZO(c))+'</p><h4>'+X.here+'</h4>'+
        '<div class="mo-olist">'+os.map(function(o){return '<button type="button" class="mo-ocard" data-id="'+o.id+'"><span class="mo-n" style="--c:'+SECT[o.s].c+'">'+(OBRAS.indexOf(o)+1)+'</span><span><b>'+esc(ZO(o).t)+'</b><small>'+ZO(SECT[o.s])+' · '+esc(ZO(o).d)+'</small></span><span class="go">→</span></button>'}).join('')+'</div></div>';
      document.querySelectorAll('.mo-ocard').forEach(function(b){b.onclick=function(){showObra(b.dataset.id,k)}});
    }
    function used(){var u=[];OBRAS.forEach(function(o){if(u.indexOf(o.s)<0)u.push(o.s)});return u}
    function render(){
      var X=T(),l=L();
      hqLbl.textContent=X.hq;$('mo-ocean').textContent=X.ocean;$('mo-peru').textContent=TR('PERÚ','PERU');
      OBRAS.forEach(function(o){o.lblEl.textContent=ZO(o).t;o.pinEl.setAttribute('aria-label',ZO(o).t)});
      $('mo-chips').innerHTML=[["all",X.all,null]].concat(used().map(function(k){return[k,ZO(SECT[k]),SECT[k].c]})).map(function(a){return '<button type="button" class="mo-chip" aria-pressed="'+(filter===a[0])+'" data-k="'+a[0]+'">'+(a[2]?'<i style="background:'+a[2]+'"></i>':'')+a[1]+'</button>'}).join('');
      $('mo-legend').innerHTML=used().map(function(k){return '<span><i style="background:'+SECT[k].c+'"></i>'+ZO(SECT[k])+'</span>'}).join('')+'<span><i style="border:2px solid var(--accent);border-radius:2px;transform:rotate(45deg);width:9px;height:9px"></i>'+X.hqL+'</span>';
      $('mo-m-obras').setAttribute('aria-pressed',mode==="obras");$('mo-m-ciud').setAttribute('aria-pressed',mode==="ciud");
      pins.toggleAttribute('hidden',mode!=="obras");cG.toggleAttribute('hidden',mode==="obras");$('mo-refs').toggleAttribute('hidden',mode==="obras");
      var list=$('mo-list');
      if(mode==="obras"){
        OBRAS.forEach(function(o){o.pinEl.classList.toggle('off',!vis(o))});
        var v=OBRAS.filter(vis),pv={};v.forEach(function(o){o.prov.split(" / ").forEach(function(p){pv[p]=1})});
        $('mo-stats').innerHTML='<b>'+v.length+'</b> '+X.works+' · <b>'+Object.keys(pv).length+'</b> '+X.provs;
        list.innerHTML=OBRAS.map(function(o,i){return '<button type="button" class="mo-row'+(vis(o)?'':' off')+'" data-id="'+o.id+'"><span class="mo-n" style="--c:'+SECT[o.s].c+'">'+(i+1)+'</span><div><b>'+esc(ZO(o).t)+'</b><small>'+esc(o.city)+' · '+esc(o.prov)+'</small></div></button>'}).join('');
        list.querySelectorAll('.mo-row').forEach(function(r){r.onclick=function(){showObra(r.dataset.id)}});
        var cur=byId(sel);showObra(cur&&vis(cur)?cur.id:(v[0]||OBRAS[0]).id);
      }else{
        var vc=CITIES.filter(function(c){return obrasDe(c.k).length});
        $('mo-stats').innerHTML='<b>'+vc.length+'</b> '+X.cities+' · <b>'+vc.reduce(function(a,c){return a+obrasDe(c.k).length},0)+'</b> '+X.obras;
        list.innerHTML=CITIES.map(function(c){var os=obrasDe(c.k),all=OBRAS.filter(function(o){return o.cg===c.k});return '<button type="button" class="mo-row'+(os.length?'':' off')+'" data-id="c:'+c.k+'"><span class="mo-n" style="--c:'+SECT[all[0].s].c+'">'+all.length+'</span><div><b>'+c.n+'</b><small>'+c.prov+' · '+all.length+' '+(all.length===1?X.obra:X.obras)+'</small></div></button>'}).join('');
        list.querySelectorAll('.mo-row').forEach(function(r){r.onclick=function(){showCity(r.dataset.id.slice(2))}});
        var ck=sel.indexOf("c:")===0?sel.slice(2):null;
        showCity(ck&&obrasDe(ck).length?ck:(vc[0]||CITIES[0]).k);
      }
    }
    $('mo-chips').addEventListener('click',function(e){var b=e.target.closest('.mo-chip');if(!b)return;filter=b.dataset.k;render()});
    $('mo-m-obras').addEventListener('click',function(){mode="obras";render()});
    $('mo-m-ciud').addEventListener('click',function(){mode="ciud";render()});
    render();
    return render;
  })();
  document.getElementById('pdx').addEventListener('click',closePd);
  document.getElementById('pdsub').addEventListener('click',function(e){
    var b=e.target.closest('[data-pdf],[data-go]');if(!b)return;
    if(b.dataset.go){openPd(b.dataset.go);return}
    closePd();openCv(1,b.dataset.pdf,(TR('Catálogo · ','Catalog · '))+b.dataset.title);
  });
  pd.addEventListener('click',function(e){if(e.target===pd)closePd()});

  // Catálogos: visor propio con PDF.js (los PDF están en este mismo sitio, así que se dibujan aquí
  // y se puede saltar a cualquier página, también en celular)
  var PDF='/catalogos/alcantarillas.pdf',PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  var cv=document.getElementById('cv'),cvLast,cvTitle=document.getElementById('cvt'),cvTitle0=cvTitle.textContent;
  var pagesEl=document.getElementById('cvpages'),thEl=document.getElementById('cvth'),msg=document.getElementById('cvmsg'),num=document.getElementById('cvnum');
  var cvDoc=null,cvUrl='',cvZoom=1,cvCur=1,cvWant=1,cvTask=0,libP=null,pgIO=null;
  function lib(){
    if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
    if(!libP)libP=new Promise(function(ok,ko){var sc=document.createElement('script');sc.src=PDFJS+'pdf.min.js';
      sc.onload=function(){pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.js';ok(pdfjsLib)};sc.onerror=ko;document.head.appendChild(sc)});
    return libP;
  }
  function fitW(){return Math.min(pagesEl.clientWidth-32,1100)}
  function drawPage(div,force){
    if(!cvDoc||(div.dataset.done&&!force))return;
    var n=+div.dataset.n,task=cvTask;div.dataset.done=1;
    cvDoc.getPage(n).then(function(pg){
      if(task!==cvTask)return;
      var v=pg.getViewport({scale:1}),w=div.clientWidth,dpr=Math.min(window.devicePixelRatio||1,2),sc=w/v.width*dpr;
      var vp=pg.getViewport({scale:sc}),c=div.querySelector('canvas')||div.insertBefore(document.createElement('canvas'),div.firstChild);
      c.width=vp.width;c.height=vp.height;pg.render({canvasContext:c.getContext('2d'),viewport:vp});
    });
  }
  function layout(){
    var w=fitW()*cvZoom;
    pagesEl.querySelectorAll('.cv-pg').forEach(function(d){d.style.width=w+'px';d.style.height=(w*d.dataset.ar)+'px';delete d.dataset.done});
    pagesEl.querySelectorAll('.cv-pg').forEach(function(d){var r=d.getBoundingClientRect(),h=pagesEl.getBoundingClientRect();if(r.bottom>h.top-400&&r.top<h.bottom+400)drawPage(d)});
  }
  function setCur(n){
    cvCur=n;num.textContent=n+' / '+(cvDoc?cvDoc.numPages:1);
    thEl.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',+b.dataset.n===n)});
    var best=0;cv.querySelectorAll('.cv-nav .chap').forEach(function(c){if(+c.dataset.page<=n)best=+c.dataset.page});
    cv.querySelectorAll('.cv-nav .chap').forEach(function(c){var on=+c.dataset.page===best;if(on&&!c.classList.contains('on')&&c.offsetParent){var nv=c.closest('.cv-nav');nv.scrollTo({left:c.offsetLeft-nv.offsetLeft-16,behavior:'auto'})}c.classList.toggle('on',on)});
  }
  // Página actual = la que ocupa la parte de arriba del visor
  var scT=0;pagesEl.addEventListener('scroll',function(){if(scT)return;scT=requestAnimationFrame(function(){scT=0;if(!cvDoc)return;
    var y=pagesEl.scrollTop+pagesEl.clientHeight*.25,n=1;pagesEl.querySelectorAll('.cv-pg').forEach(function(d){if(d.offsetTop<=y)n=+d.dataset.n});if(n!==cvCur)setCur(n)})},{passive:true});
  function goPage(n,smooth){
    var d=pagesEl.querySelector('.cv-pg[data-n="'+n+'"]');if(!d){cvWant=n;return}
    pagesEl.scrollTo({top:d.offsetTop-16,behavior:smooth&&!reduce?'smooth':'auto'});setCur(n);
  }
  function build(doc,task){
    pagesEl.innerHTML='';thEl.innerHTML='';
    var ps=[];for(var i=1;i<=doc.numPages;i++)ps.push(doc.getPage(i));
    Promise.all(ps).then(function(list){
      if(task!==cvTask)return;
      if(pgIO)pgIO.disconnect();
      pgIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)drawPage(e.target)})},{root:pagesEl,rootMargin:'600px 0px'});
      list.forEach(function(pg,ix){
        var v=pg.getViewport({scale:1}),ar=v.height/v.width,n=ix+1;
        var d=document.createElement('div');d.className='cv-pg';d.dataset.n=n;d.dataset.ar=ar;d.innerHTML='<span>'+n+'</span>';
        pagesEl.appendChild(d);pgIO.observe(d);
        var t=document.createElement('button');t.type='button';t.dataset.n=n;t.style.setProperty('--ar',1/ar);t.setAttribute('aria-label',(TR('Página ','Page '))+n);
        var tc=document.createElement('canvas');t.appendChild(tc);t.insertAdjacentHTML('beforeend','<b>'+n+'</b>');thEl.appendChild(t);
        t.addEventListener('click',function(){goPage(n,true)});
        if(getComputedStyle(thEl).display!=='none'){var tv=pg.getViewport({scale:180/v.width});tc.width=tv.width;tc.height=tv.height;pg.render({canvasContext:tc.getContext('2d'),viewport:tv})}
      });
      layout();msg.textContent='';goPage(cvWant,false);
    });
  }
  function cvLoad(url,title,n){
    cv.classList.toggle('solo',url!==PDF);
    url=CATU(url);
    cvTitle.textContent=title||TR(cvTitle0,'Metal culvert catalog');
    cv.querySelectorAll('.cvl').forEach(function(a){a.href=url;if(a.hasAttribute('download'))a.setAttribute('download',CATN(url))});
    cvWant=n||1;
    if(cvUrl===url&&cvDoc){goPage(cvWant,true);return}
    cvUrl=url;cvDoc=null;cvZoom=1;var task=++cvTask;pagesEl.innerHTML='';thEl.innerHTML='';
    msg.textContent=TR('Cargando catálogo…','Loading catalog…');
    lib().then(function(L){return L.getDocument(url).promise}).then(function(doc){if(task!==cvTask)return;cvDoc=doc;build(doc,task)})
      .catch(function(){if(task!==cvTask)return;cvUrl='';msg.innerHTML=(TR('No se pudo mostrar el catálogo aquí. ','The catalog could not be shown here. '))+'<a href="'+url+'" target="_blank" rel="noopener">'+(TR('Abrir el PDF','Open PDF'))+'</a>'});
  }
  function cvPage(n){cvLoad(PDF,null,n)}
  function openCv(n,url,title){cvLast=document.activeElement;cv.hidden=false;document.body.style.overflow='hidden';if(url)cvLoad(url,title,1);else cvPage(n);document.getElementById('cvx').focus()}
  function closeCv(){cv.hidden=true;document.body.style.overflow='';if(cvLast)cvLast.focus()}
  document.querySelectorAll('[data-page]').forEach(function(b){
    b.addEventListener('click',function(){var n=+b.dataset.page;if(cv.hidden)openCv(n);else cvPage(n)});
  });
  document.getElementById('cvx').addEventListener('click',closeCv);
  // Abrir el catálogo interactivo desde otra página: /#catalogo-<archivo> (p. ej. desde las fichas de producto)
  (function(){function fromHash(){var m=/^#catalogo-([a-z0-9-]+)$/.exec(location.hash);if(!m)return;
    try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
    if(m[1]==='alcantarillas')openCv(1);else{var T={'postes':['Postes metálicos','Steel poles'],'grating-tramex':['Grating y tramex','Grating'],'pernos-bronce-silicio':['Pernos bronce-silicio','Silicon-bronze bolts'],'resina-de-anclaje':['Resina de anclaje','Anchoring resin'],'accesorios-para-tuberia':['Accesorios para tubería','Pipe fittings']}[m[1]];openCv(1,'/catalogos/'+m[1]+'.pdf',TR('Catálogo · ','Catalog · ')+(T?TR(T[0],T[1]):m[1]))}}
    setTimeout(fromHash,0);addEventListener('hashchange',fromHash)})();
  document.getElementById('cvprev').addEventListener('click',function(){if(cvCur>1)goPage(cvCur-1,true)});
  document.getElementById('cvnext').addEventListener('click',function(){if(cvDoc&&cvCur<cvDoc.numPages)goPage(cvCur+1,true)});
  function zoom(f){var keep=cvCur;cvZoom=Math.min(3,Math.max(.5,cvZoom*f));layout();goPage(keep,false)}
  document.getElementById('cvzi').addEventListener('click',function(){zoom(1.25)});
  document.getElementById('cvzo').addEventListener('click',function(){zoom(.8)});
  addEventListener('resize',function(){if(!cv.hidden&&cvDoc){var keep=cvCur;layout();goPage(keep,false)}});
  addEventListener('keydown',function(e){if(cv.hidden||!cvDoc)return;if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();if(cvCur<cvDoc.numPages)goPage(cvCur+1,true)}if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();if(cvCur>1)goPage(cvCur-1,true)}});

  // Videos: el reproductor de YouTube se carga sólo al pulsar
  document.querySelectorAll('.vid button').forEach(function(b){
    b.addEventListener('click',function(){
      var f=document.createElement('iframe');
      f.src='https://www.youtube-nocookie.com/embed/'+b.dataset.yt+'?autoplay=1&rel=0';
      f.title=b.querySelector('b').textContent;
      f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;
      b.replaceWith(f);
    });
  });

  // Carrusel de sectores
  var rail=document.getElementById('rail');
  function step(){var c=rail.querySelector('.sector');return c?c.getBoundingClientRect().width+18:320}
  document.getElementById('prev').addEventListener('click',function(){rail.scrollBy({left:-step(),behavior:reduce?'auto':'smooth'})});
  document.getElementById('next').addEventListener('click',function(){rail.scrollBy({left:step(),behavior:reduce?'auto':'smooth'})});

  // Entradas al hacer scroll y contadores
  if('IntersectionObserver' in window&&!reduce){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting)return;e.target.classList.add('in');io.unobserve(e.target);
      e.target.querySelectorAll('.count').forEach(function(c){
        var to=+c.dataset.to,t0=performance.now();
        (function tick(t){var p=Math.min((t-t0)/1400,1);c.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(tick)})(t0);
      });
    })},{threshold:.15});
    document.querySelectorAll('.rv').forEach(function(el){
      if(el.getBoundingClientRect().top<innerHeight&&!el.querySelector('.count'))return;io.observe(el);
    });
  }

  // Idiomas
  var EN={
    "nav.sectors":"Solutions","nav.products":"Products","mm.s0":"Metal floors","mm.s1":"Poles","mm.s2":"Grates","mm.s3":"Plates","mm.s4":"Tunnel arches","mm.s5":"Formwork","mm.s6":"Energy dissipators","mm.s7":"Pipe fittings","mm.s8":"Steel structures","mm.s9":"Anchor bolts","mm.s10":"Anchor plates","mm.s11":"Industrial sheds","mm.s12":"Stairs","mm.s13":"Handrails and walkways","mm.s14":"Special orders","mm.c0":"Metal infrastructure","mm.c1":"High-reliability special bolts","mm.c2":"Metal culverts","mm.c3":"Grating \u2013 Tramex","mm.c4":"Formwork","mm.c5":"Pipe fittings","mm.c6":"Rock support","mm.c7":"Parts manufacturing and repair","mm.c8":"Welding machines","mm.infra":"Metal infrastructure","mm.all":"All products","nav.culverts":"Culverts","nav.projects":"Projects","nav.about":"About","nav.contact":"Contact",
    "hero.k":"Engineering & materials · Ecuador","hero.title":"Experience and <span class=\"grad\">quality</span><span class=\"vh\">: steel infrastructure, bolts and culverts in Ecuador</span>",
    "hero.lead":"Engineering, consulting, manufacturing and import of steel structures, bolts, culverts and grating for hydropower, mining, cement, power utilities and road works. More than 25 years of experience taking part in the country's landmark engineering projects.",
    "cta.start":"Start a project","cta.projects":"See our work","hero.now":"Now showing",
    "v.years":"years of experience","v.projects":"projects completed","v.landmark":"landmark projects","v.people":"people reached",
    "pl1.t":"Quality","pl1.d":"High standards in every process: materials to AASHTO and ASTM, traceable from plant to site.",
    "pl2.t":"Personalized service","pl2.d":"Engineering and consulting tailored to each client, with our own Sangolquí plant for special parts and custom structures.",
    "pl3.t":"Innovation and continuous improvement","pl3.d":"We plan every order around the project schedule and improve every process, project after project.",
    "sec.k":"Solutions by sector","sec.t":"Where the work <span class=\"grad\">demands more</span>","sec.swipe":"Swipe to explore",
    "s1.t":"Hydropower plants","s1.d":"Climbing formwork, tunnel arches, rock anchoring and inclined penstocks.",
    "s2.t":"Mining","s2.d":"Anchor bolts, tunnel arches and steel screens.",
    "s3.t":"Cement industry","s3.d":"Drilling platforms, bollards and circular, conical and slip formwork.",
    "s4.t":"Power industry","s4.d":"Towers, high and low voltage hardware, fiber optics and substation grating.",
    "s5.t":"Road projects","s5.d":"Tunnel arches, metro platforms, stairs and handrails.",
    "s6.t":"Steel structures","s6.d":"Warehouses, trusses and industrial building structures.",
    "s7.t":"Street furniture","s7.d":"Playgrounds, sculptures, stainless fountains, benches and bins.",
    "s8.t":"Special orders","s8.d":"Custom parts, such as aircraft boarding stairs.",
    "prod.k":"Products","prod.t":"Engineering, materials and consulting for <span class=\"grad\">your project</span>","prod.lead":"Infrastructure solutions, services and consulting: made in our Sangolquí plant and imported under international standards.",
    "p1.t":"Steel infrastructure","p1.d":"Structures, warehouses, stairs, walkways, poles, plates, energy dissipators and tunnel arches.","p1.c1":"Warehouses","p1.c2":"Poles","p1.c3":"Arches","p1.c4":"Walkways",
    "p2.t":"High-reliability bolts","p2.d":"Forged, silicon bronze and anchor bolts.",
    "p3.t":"Steel culverts","p3.d":"Corrugated galvanized steel, MP 68 and MP 152.",
    "p4.t":"Grating and tramex","p4.d":"Industrial grating floors and grilles.",
    "p5.t":"Formwork","p5.d":"Vertical, climbing, circular and slip.",
    "p6.t":"Pipe fittings","p6.d":"For steel pipelines.",
    "p7.t":"Rock support","p7.d":"Helical bar and anchoring resin.",
    "p8.t":"Special parts","p8.d":"Manufacture and repair of parts for strategic sectors.",
    "p9.t":"Welding machines","p9.d":"Welding equipment for workshop and site, with technical advice.",
    "cul.t":"TMC <span class=\"grad\">culverts</span>","cul.lead":"Corrugated hot-dip galvanized steel, bolted together on site with no specialized labor.",
    "t.corr":"Corrugation","t.diam":"Diameters","t.thick":"Thickness","t.shape":"Shapes","t.load":"Loads","t.std":"Standards","t.span":"Long span (152.S)","t.use":"Uses",
    "t.shape68":"Circular · arched","t.shape152":"Circular · vault · ellipse · underpass · arch","t.span152":"High and low profile arch · ellipse · egg shape","t.use152":"Pedestrian and vehicle underpasses · drainage",
    "mo.k":"Projects in Ecuador","mo.t":"Wherever the country <span class=\"grad\">is being built</span>","mo.lead":"From the coast to the Amazon, across the Andes. Tap a point on the map to see the project, where it is and the work we did.","mo.byWork":"By project","mo.byCity":"By city",
    "proj.k":"Projects","sat.lead":"Explore our projects across Ecuador: from the coast to the Amazon, across the Andes.","sat.hint":"Hover over a point to explore","map.hidro":"See the 3 projects on the map","map.trans":"See the project on the map","sat.credit":"Imagery: Copernicus Sentinel-2 (2019–2024) · relief: Terrain Tiles","proj.t":"Our track record is <span class=\"grad\">our calling card</span>",
    "proj.transport":"Public transport","proj.hydro":"Hydropower","proj.steel":"Steel structure","proj.res":"Residential",
    "mo.other":"Other projects · location to be confirmed","proj.metro":"Quito Metro","proj.agoyan":"Agoyán plant","proj.manduriacu":"Manduriacu plant","proj.sanfrancisco":"San Francisco plant","proj.cadeco":"Cadeco warehouse","proj.funival":"Funvivalt · Monserrat complex","proj.tunel":"Roadworks","proj.tunelt":"Baños tunnel",
    "about.k":"About us","about.t":"A <span class=\"grad\">multidisciplinary</span> team","about.mk":"Our mission",
    "about.m":"“To provide our clients with innovative solutions for infrastructure projects, with punctuality and responsibility in delivery, allowing us to be the best option in the market through the full commitment of our team.”",
    "about.v":"<b>Vision:</b> to be an indispensable company in every area of construction and production, focused on meeting our clients' needs through personalized, guaranteed service.","about.more":"See our social work","crumb.p":"Products","pd.page":"Full product page","masprod":"More products","fichas.k":"Product pages (Spanish)","cul.ficha":"Full technical sheet","cul.k":"Metal culverts","more":"Learn more","more.all":"See all","pd.h":"Ask for a quote","pd.wa":"Quote on WhatsApp","pd.cat":"View catalog","pd.subs":"Product line","pd.adv":"Benefits","t.tables":"Technical tables","cul.view":"View catalog","cul.view2":"Interactive culvert catalog","cul.pdf":"Download PDF","cat.k":"Technical catalog","cat.t":"Metal culvert TMC","cat.meta":"13 pages · PDF · Spanish","cat.g":"What you will find","cat.hint":"Pick a chapter and the catalog opens right on that page.","cv.t":"Metal culvert catalog","cv.open":"Open in a new tab","cv.dl":"Download","about.lead":"Experience and quality in every project.","ab1.k":"Our services","ab1.d":"We distribute high-reliability fasteners for industry. We manufacture metal parts and components for each business area and set a strategy to fully satisfy all parties.","ab2.k":"Our method","ab2.d":"We run a diagnosis gathering information from everyone involved, then plan to achieve the highest productivity and satisfaction for all parties.","ab3.k":"Our engine","ab3.d":"We believe in continuous improvement and a clear purpose. We develop the talent of the whole team, which makes us stronger for new projects.","vid.k":"Video","vid.more":"More videos on YouTube","vid.t":"JOCE <span class=\"grad\">in video</span>","vid.lead":"See our work in the plant and on site.","v0.k":"Introduction","v1.k":"Plant and site","v2.k":"Plant and site","v3.k":"Plant and site","v1.t":"Multiple jobs and services","v2.t":"Jobs and services · part 1","v3.t":"Jobs and services · part 2","g0":"Community bakery in Esmeraldas","g1":"JOCE social work","g2":"Working with the community","g3":"JOCE donations","ch0":"Cover","ch1":"What is a CSP culvert?","ch2":"MP 68: material and properties","ch3":"MP 68: structures and loads","ch4":"MP 68: bolts and nuts","ch5":"MP 152 & 152.S: material","ch6":"MP 152: starter channels","ch7":"MP 152: ASTM A761 bolts",
    "m1.t":"Assessment","m1.d":"We gather information from everyone involved.","m2.t":"Planning","m2.d":"We define the technical solution, schedule and resources.",
    "m3.t":"Manufacture or supply","m3.d":"We produce in our plant or import to standard.","m4.t":"Delivery and support","m4.d":"We deliver on time and support the assembly.",
    "soc.k":"Social responsibility","soc.t":"Committed to <span class=\"grad\">communities</span>",
    "soc1.t":"San Rafael de la Laguna","soc1.d":"Training on solid waste and wastewater, biodigester donation and an entrepreneurship network for the community in Otavalo.",
    "soc2.t":"Christmas giving","soc2.d":"Donation of 100 bags of sweets to the Acción y Esperanza Foundation.",
    "soc3.t":"Bakery in Esmeraldas","soc3.d":"Roof donated and installed for a community bakery, with the AMU NGO's Sunrise+ project.",
    "soc4.t":"Pandemic support","soc4.d":"Disinfection trays and personal protective equipment for the 10D02 Otavalo – Antonio Ante District Health Office.",
    "ct.k":"Contact","ct.t":"Shall we talk about your next project?","ct.lead":"Tell us what you need manufactured or supplied and an engineer will get back to you.",
    "ct.wa":"Message us on WhatsApp","ct.map":"Get directions","ct.addr":"Plant","ct.phones":"Phones","ct.fixed":"Landlines","ct.cell":"Mobile and WhatsApp","ct.cwa":"WhatsApp","ct.ccall":"Calls","ct.mail":"Email by department","ct.m1":"Sales: bolts, culverts, fittings, grating, parts, resin and formwork","ct.m2":"Engineering: infrastructure solutions, services and consulting","ct.m3":"General management","ct.hours.t":"Hours","ct.hours":"Monday to Friday, 08:00 – 17:00","ct.follow":"Follow us",
    "job.k":"Careers","job.t":"Let's build <span class=\"grad\">together</span>","job.lead":"We are looking for welders, fitters, engineers, and sales and admin staff. Leave your details and résumé: our HR team reviews it and contacts you if your profile is a fit.",
    "job.s1":"Fill in the form","job.s1d":"Name, contact details and the area you are applying to.","job.s2":"Attach your résumé","job.s2d":"PDF or Word, up to 5 MB.","job.s3":"We get in touch","job.s3d":"Your application goes straight to the company's inbox.",
    "job.name":"Full name","job.phone":"Phone / WhatsApp","job.mail":"Email","job.area":"Area you are applying to","job.role":"Position","job.opt":"(optional)",
    "job.a0":"Choose an area","job.a1":"Plant production (welding, fitting, painting)","job.a2":"On-site assembly and installation","job.a3":"Engineering and projects","job.a4":"Sales and customer service","job.a5":"Administration and finance","job.a6":"Warehouse and logistics","job.a7":"Other area / open application",
    "job.cv":"Résumé (PDF or Word, max. 5 MB)","job.pick":"Choose file","job.msg":"Tell us about your experience","job.ok":"I authorize José Cevallos JOCE Cía. Ltda. to process my personal data only for this hiring process.","job.send":"Send application","nav.jobs":"Careers","ct.jobs":"Careers","ct.jobsl":"Send us your résumé here",
    "tagline":"Engineering & Materials","footer.demo":"Redesign demo, not the official site"
  };
  var nodes=document.querySelectorAll('[data-i18n],[data-i18n-html]'),es={};
  nodes.forEach(function(el){es[el.dataset.i18n||el.dataset.i18nHtml]=el.innerHTML});
  function setLang(l){
    if(l==='zh'&&!window.ZHOK){loadZH(function(){setLang('zh')});return}
    lang=l;
    nodes.forEach(function(el){
      var k=el.dataset.i18n||el.dataset.i18nHtml,v=l==='en'?EN[k]:l==='zh'?(EN[k]!=null?ZT(EN[k]):null):es[k];
      if(v==null)return;
      if(l==='es'||el.dataset.i18nHtml)el.innerHTML=v;else el.textContent=v;
    });
    root.lang=l==='zh'?'zh-CN':l;
    cap.textContent=TR(slides[cur].dataset.cap,slides[cur].dataset.capEn);
    if(typeof MO==='function')MO();
    ['es','en','zh'].forEach(function(x){document.getElementById('lang-'+x).setAttribute('aria-pressed',l===x)});
    try{localStorage.setItem('joce-lang',l)}catch(e){}
  }
  document.getElementById('lang-es').addEventListener('click',function(){setLang('es')});
  document.getElementById('lang-en').addEventListener('click',function(){setLang('en')});
  document.getElementById('lang-zh').addEventListener('click',function(){setLang('zh')});

  // Tema claro / oscuro
  function isDark(){var t=root.dataset.theme;return t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches}
  document.getElementById('theme').addEventListener('click',function(){
    var t=isDark()?'light':'dark';
    function apply(){root.dataset.theme=t}
    if(document.startViewTransition&&!reduce)document.startViewTransition(apply);else apply();
    try{localStorage.setItem('joce-theme',t)}catch(e){}
  });

  // Menú móvil
  // Secciones oscuras (vidrio) solo en modo oscuro; en modo claro siguen el tema
  (function(){var R=document.documentElement,dm=matchMedia('(prefers-color-scheme: dark)');
    function fx(){var t=R.dataset.theme,dark=t?t==='dark':dm.matches;document.querySelectorAll('[data-fx]').forEach(function(e){e.classList.toggle('fx-dark',dark)})}
    fx();new MutationObserver(fx).observe(R,{attributes:true,attributeFilter:['data-theme']});if(dm.addEventListener)dm.addEventListener('change',fx)})();
  var menu=document.getElementById('menu'),nav=document.getElementById('nav');
  menu.addEventListener('click',function(){var o=nav.classList.toggle('open');menu.setAttribute('aria-expanded',o)});
  nav.addEventListener('click',function(e){var l=e.target.closest('a');if(l){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');if(document.activeElement)document.activeElement.blur()}});

  try{
    var sl=localStorage.getItem('joce-lang');if(sl==='en'||sl==='zh')setLang(sl);
    var st=localStorage.getItem('joce-theme');if(st==='dark'||st==='light')root.dataset.theme=st;
  }catch(e){}
})();
