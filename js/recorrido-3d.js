/* Recorrido de productos (#ptour): capítulos por aplicación, piezas 3D con three.js (se carga solo cuando la sección se acerca a la pantalla). */
(function(){
const tour=document.getElementById('ptour');if(!tour)return;
const $=s=>document.getElementById(s);
const gl=$('pt-gl'),panel=$('pt-panel'),rail=$('pt-rail');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const L=()=>JL();
const C=[
 {s:'pernos-de-alta-fiabilidad',m:'pernos',bg:'tunel',
  es:{k:'Fijación y anclaje',t:'Pernos de alta fiabilidad',d:'Pernos a la forja, pernos bronce-silicio y pernos de anclaje para molinos, minería, construcción y vía férrea.',v:['Todos','A la forja','Bronce-silicio','De anclaje','Barra helicoidal'],vs:['pernos-de-alta-fiabilidad','pernos-a-la-forja','pernos-bronce-silicio','pernos-de-alta-fiabilidad','pernos-de-barra-helicoidal'],f:[['A la forja','9 tipos'],['Bronce-silicio','1 % a 5 % de silicio, resiste agua dulce y salada'],['Barra helicoidal','Para sostenimiento en roca']],bc:'Fondo: Túnel de Baños, pernos de anclaje de Jocecia'},
  en:{k:'Fastening & anchoring',t:'High-reliability bolts',d:'Forged bolts, silicon-bronze bolts and anchor bolts for mills, mining, construction and railways.',v:['All','Forged','Silicon-bronze','Anchor','Helical bar'],f:[['Forged','9 types'],['Silicon-bronze','1–5 % silicon, resists fresh and salt water'],['Helical bar','For rock support']],bc:'Background: Baños tunnel, Jocecia anchor bolts'}},
 {s:'alcantarillas-metalicas',m:'alc',bg:'alc',
  es:{k:'Drenaje y tuberías',t:'Alcantarillas metálicas',d:'Alcantarillas TMC de acero corrugado galvanizado, en tubo o en bóveda para pasos de mayor luz, y accesorios para tubería metálica.',v:['MP 68','MP 152','Accesorios para tubería'],vs:['alcantarilla-mp-68','alcantarilla-mp-152','accesorios-para-tuberias'],f:[['Modelos','MP 68 · MP 152 · MP 152.S'],['Material','Acero corrugado galvanizado'],['Extra','Catálogo interactivo y PDF']],bc:'Fondo: alcantarilla instalada en obra'},
  en:{k:'Drainage & piping',t:'Metal culverts',d:'Galvanized corrugated steel culverts, as pipes or as arches for wider spans, plus fittings for steel pipe.',v:['MP 68','MP 152','Pipe fittings'],f:[['Models','MP 68 · MP 152 · MP 152.S'],['Material','Galvanized corrugated steel'],['Extra','Interactive catalog and PDF']],bc:'Background: culvert installed on site'}},
 {s:'grating-tramex',m:'grat',bg:'metro',
  es:{k:'Pisos industriales',t:'Grating y tramex',d:'Rejillas de acero galvanizado o inoxidable para pisos industriales, almacenes y plataformas de trabajo.',v:['De barra','Antideslizante'],f:[['De barra','Para alta carga'],['Antideslizante','Zonas con humedad y aceite'],['Ya lo usó','Metro de Quito']],bc:'Fondo: rejillas en el Metro de Quito'},
  en:{k:'Industrial floors',t:'Grating',d:'Galvanized or stainless steel grating for industrial floors, warehouses and work platforms.',v:['Bar','Anti-slip'],f:[['Bar','For heavy loads'],['Anti-slip','Wet and oily areas'],['Used at','Quito Metro']],bc:'Background: grating at the Quito Metro'}},
 {s:'postes-metalicos',m:'poste',bg:'postes',
  es:{k:'Alumbrado y redes',t:'Postes metálicos',d:'Postes para alumbrado público, sujeción de cables y anclaje de estructuras.',v:['Alumbrado','Sujeción de cables'],f:[['Acabado','Galvanizado'],['Catálogo','PDF postes']],bc:'Fondo: postes galvanizados en patio'},
  en:{k:'Lighting & networks',t:'Steel poles',d:'Poles for street lighting, cable support and structural anchoring.',v:['Lighting','Cable support'],f:[['Finish','Galvanized'],['Catalog','Poles PDF']],bc:'Background: galvanized poles in the yard'}},
 {s:'encofrados',m:'enc',bg:'tunel',
  es:{k:'Obra civil',t:'Encofrados metálicos',d:'Estructuras temporales de acero que moldean y sostienen el hormigón fresco hasta que se endurece. En varios tamaños y configuraciones, para obras pequeñas y grandes infraestructuras.',v:['Paneles con puntales','Circulares','Muros altos'],f:[['Material','Acero'],['Instalación','Rápida y sencilla'],['Medidas','Varios tamaños y configuraciones']]},
  en:{k:'Civil works',t:'Steel formwork',d:'Temporary steel structures that shape and hold fresh concrete until it hardens. In many sizes and configurations, for small works and large infrastructure.',v:['Braced panels','Circular','Tall walls'],f:[['Material','Steel'],['Installation','Quick and simple'],['Sizes','Many sizes and configurations']]}},
 {s:'infraestructura-metalica',m:'infra',bg:'metro',
  es:{k:'Estructura',t:'Infraestructura metálica',d:'Galpones, estructuras metálicas, cerchas para túneles, escaleras, pasamanos y pasarelas. También placas, placas de anclaje, disipadores de energía y tubería metálica.',v:['Galpones','Cerchas para túneles','Escaleras','Pasamanos y pasarelas','Estructuras metálicas'],f:[['Taller','Sangolquí'],['Ya lo usó','Metro de Quito']]},
  en:{k:'Structure',t:'Steel infrastructure',d:'Warehouses, steel structures, tunnel arches, stairs, handrails and walkways. Also plates, anchor plates, energy dissipators and steel pipe.',v:['Warehouses','Tunnel arches','Stairs','Handrails & walkways','Steel structures'],f:[['Plant','Sangolquí'],['Used at','Quito Metro']]}},
 {s:'soporte-en-roca',m:'roca',bg:'tunel',
  es:{k:'Túneles y roca',t:'Resina y pernos para soporte de rocas',d:'Resina y pernos de barra helicoidal para el sostenimiento de túneles y galerías, el refuerzo de pilares en minería y la consolidación de taludes.',v:['Barra helicoidal','Resina en cartuchos'],vs:['pernos-de-barra-helicoidal','resina-de-anclaje'],f:[['Barra helicoidal','BAHE A615-G75, norma ASTM A615 grado 75'],['Usos','Minería · Túneles · Taludes'],['Ya lo usó','Túnel de Baños']]},
  en:{k:'Tunnels & rock',t:'Resin and bolts for rock support',d:'Resin and helical bar bolts to support tunnels and galleries, reinforce mine pillars and stabilize slopes.',v:['Helical bar','Resin cartridges'],f:[['Helical bar','BAHE A615-G75, ASTM A615 grade 75'],['Uses','Mining · Tunnels · Slopes'],['Used at','Baños tunnel']]}},
 {s:'partes-y-piezas-especiales',m:'pieza',bg:'sanfco',
  es:{k:'Sectores estratégicos',t:'Piezas especiales',d:'Fabricación y reparación de partes y piezas especiales: diseño y prototipado, corte y conformado, soldadura y ensamblaje, y acabados superficiales.',v:['Fabricación','Reparación'],f:[['Corte','Láser, plasma y agua'],['Soldadura','MIG, TIG y por puntos'],['Acabados','Pintura electroestática, galvanizado y anodizado']]},
  en:{k:'Strategic sectors',t:'Special parts',d:'Manufacturing and repair of special parts: design and prototyping, cutting and forming, welding and assembly, and surface finishing.',v:['Manufacturing','Repair'],f:[['Cutting','Laser, plasma and waterjet'],['Welding','MIG, TIG and spot'],['Finishes','Powder coating, galvanizing and anodizing']]}},
 {s:'venta-de-soldadoras',eq:['rx-520','invertec-v275s','invertec-v350-pro','tomahawk-625','lf-72','linc-405-sa'],
  es:{k:'Equipos en venta',t:'Soldadoras Lincoln Electric',d:'Venta de soldadoras y equipos de corte Lincoln Electric, además de motosoldadoras reparadas con overhaul.',v:['RX 520','Invertec V275-S','Invertec V350 PRO','Tomahawk 625','LF-72','Linc 405-SA'],
   vf:[[['Tipo','Motosoldadora reparada con overhaul'],['Corriente','CA y CD, monofásica y trifásica, 220/440 V 60 Hz'],['Salida','55–110 A CD']],
       [['Entrada','400 V ±15 %, trifásica 50/60 Hz, apta para generador'],['Peso','14,3 kg'],['Procesos','SMAW manual, sinérgico y pulsado']],
       [['Entrada','400 V ±15 %, trifásica 50/60 Hz, apta para generador'],['Eficiencia','Más de 85 %, 19 W en vacío'],['Procesos','SMAW manual, sinérgico y pulsado']],
       [['Tipo','Cortadora de plasma'],['Antorcha','Manual de 6,1 m (20 pies)'],['Arranque','Sin alta frecuencia']],
       [['Tipo','Alimentador de alambre'],['Rodillos','2 rodillos impulsores, cambio sin herramientas'],['Conexión','Pistola de latón a latón']],
       [['Medidores','Digitales de corriente'],['Ajustes','Hot Start y fuerza de arco'],['Taller','Dos ruedas grandes y tiradores']]],f:[]},
  en:{k:'Equipment for sale',t:'Lincoln Electric welders',d:'Lincoln Electric welding and cutting equipment, plus engine-driven welders rebuilt with an overhaul.',v:['RX 520','Invertec V275-S','Invertec V350 PRO','Tomahawk 625','LF-72','Linc 405-SA'],
   vf:[[['Type','Engine-driven welder, overhauled'],['Current','AC and DC, single and three phase, 220/440 V 60 Hz'],['Output','55–110 A DC']],
       [['Input','400 V ±15 %, three phase 50/60 Hz, generator-ready'],['Weight','14.3 kg'],['Processes','SMAW manual, synergic and pulsed']],
       [['Input','400 V ±15 %, three phase 50/60 Hz, generator-ready'],['Efficiency','Over 85 %, 19 W idle'],['Processes','SMAW manual, synergic and pulsed']],
       [['Type','Plasma cutter'],['Torch','Manual, 6.1 m (20 ft)'],['Start','No high frequency']],
       [['Type','Wire feeder'],['Rolls','2 drive rolls, tool-free change'],['Connection','Brass-to-brass gun']],
       [['Meters','Digital current'],['Settings','Hot Start and arc force'],['Shop','Two large wheels and handles']]],f:[]}},
];
const UI={es:{t3:'3D',tf:'Foto',drag:'Arrastre para girar · Ctrl + rueda o dos dedos para acercar',dragm:'Arrastre para girar',photo:'Toque la foto para acercarse',wa:'Cotizar por WhatsApp',more:'Ver ficha ›',q:'Hola, quisiera cotizar: '},
          en:{t3:'3D',tf:'Photo',drag:'Drag to rotate · Ctrl + wheel or pinch to zoom',dragm:'Drag to rotate',photo:'Tap the photo to zoom in',wa:'Quote on WhatsApp',more:'View product ›',q:'Hello, I would like a quote for: '}};
let R=null,S,cam,root,env,mats={},cur=-1,vari=0;
const st={ry:.6,rx:.18,vry:0,dist:1,tdist:1,auto:!reduce,lastUser:0,base:6,ty:0};
function initGL(){
  if(!window.THREE)return false;
  try{R=new THREE.WebGLRenderer({canvas:gl,antialias:true,alpha:true});}catch(e){return false}
  R.setPixelRatio(Math.min(devicePixelRatio,2));
  R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
  R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
  S=new THREE.Scene();cam=new THREE.PerspectiveCamera(32,1,.05,200);
  // Entorno de estudio para reflejos del metal
  const es=new THREE.Scene();
  const sg=new THREE.SphereGeometry(20,32,16);const col=[];const p=sg.attributes.position;
  for(let i=0;i<p.count;i++){const y=p.getY(i)/20;const c=new THREE.Color().lerpColors(new THREE.Color(0x0a1424),new THREE.Color(0x9fb6d6),Math.max(0,y*.5+.5));col.push(c.r,c.g,c.b)}
  sg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  es.add(new THREE.Mesh(sg,new THREE.MeshBasicMaterial({side:THREE.BackSide,vertexColors:true})));
  const box=(x,y,z,w,h,c)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);es.add(m)};
  box(-8,9,6,9,5,0xffffff);box(9,4,-4,3,10,0xbcd4ee);box(4,-2,9,10,2,0x9ad8ff);
  const pm=new THREE.PMREMGenerator(R);env=pm.fromScene(es,.04).texture;S.environment=env;
  S.add(new THREE.HemisphereLight(0xdbe8ff,0x0b1320,.5));
  const key=new THREE.DirectionalLight(0xffffff,1.6);key.position.set(-4,8,6);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:.5,far:30});key.shadow.radius=6;S.add(key);
  const rim=new THREE.DirectionalLight(0x8db5db,1.4);rim.position.set(5,3,-6);S.add(rim);
  const fill=new THREE.DirectionalLight(0x3cc8e8,.35);fill.position.set(6,1,5);S.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({opacity:.35}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.name='floor';S.add(floor);
  const M=(c,me,ro)=>new THREE.MeshStandardMaterial({color:c,metalness:me,roughness:ro,envMapIntensity:1.1});
  mats.steel=M(0x2b2f35,.85,.42);mats.steelL=M(0x3a3f46,.8,.5);mats.bronze=M(0xb07a45,1,.32);
  mats.galv=M(0xc9d0d8,.9,.36);mats.galvD=M(0xa7b0ba,.9,.45);mats.inox=M(0xe3e7ec,1,.2);
  mats.lamp=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xfff1d6,emissiveIntensity:1.6});
  mats.ins=M(0x7a4a2a,.1,.35);mats.blackS=M(0x050506,.45,.55);mats.blackS.envMapIntensity=.4;mats.bronze=M(0x7a3d18,1,.3);mats.encR=M(0x5a6472,.75,.45);
  const ML=(c,me,ro)=>{const m=M(c,me,ro);m.color.convertSRGBToLinear();return m};
  mats.yel=ML(0xe0a800,.2,.5);mats.yelF=ML(0xb08a4a,.05,.75);mats.red=ML(0xb23a2c,.15,.55);mats.redO=ML(0xe0552a,.15,.45);mats.blk=ML(0x2a2d31,.5,.55);
  root=new THREE.Group();S.add(root);
  return true;
}
const sh=m=>{m.castShadow=true;m.receiveShadow=true;return m};
function threadOn(g,r,y0,y1,mat){
  const pitch=r*.42,turns=(y1-y0)/pitch,pts=[];const n=Math.ceil(turns*24);
  for(let i=0;i<=n;i++){const a=i/24*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*r,y0+i/n*(y1-y0),Math.sin(a)*r))}
  g.add(sh(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),n*2,r*.11,6,false),mat)));
}
// Pernos según las fotos originales: cabeza hexagonal ancha con tuerca y arandela; los de acero forjado en negro
function hexNut(r,h,mat){const g=new THREE.Group();
  const n=sh(new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,6),mat));g.add(n);
  [-1,1].forEach(s=>{const c=sh(new THREE.Mesh(new THREE.CylinderGeometry(s>0?r*.86:r*.97,s>0?r*.97:r*.86,h*.12,24),mat));c.position.y=s*h*.5;g.add(c)});
  return g}
function boltHex(mat,len,o){o=o||{};const g=new THREE.Group(),r=.11;
  const sk=sh(new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,24),mat));sk.position.y=len/2;g.add(sk);
  const hh=r*1.5,hd=hexNut(r*2.15,hh,mat);hd.position.y=hh/2;g.add(hd);
  threadOn(g,r*.97,len*(o.full?.18:.45),len-.02,mat);
  if(o.nut!==false){const ny=o.ny||len*.66;
    const w=sh(new THREE.Mesh(new THREE.CylinderGeometry(r*2.5,r*2.5,r*.22,40),mat));w.position.y=ny-r*.9;g.add(w);
    const nut=hexNut(r*2.15,r*1.6,mat);nut.position.y=ny;g.add(nut)}
  return g}
function boltForged(mat,len){const g=new THREE.Group(),r=.12;
  // perno de molino: cabeza cónica ancha (avellanada) forjada, con tuerca pesada
  const head=sh(new THREE.Mesh(new THREE.CylinderGeometry(r,r*2.7,r*1.9,32),mat));head.position.y=r*.95;g.add(head);
  const s=sh(new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,24),mat));s.position.y=len/2+r*1.9;g.add(s);
  threadOn(g,r*.97,len*.45,len+r*1.8,mat);
  const w=sh(new THREE.Mesh(new THREE.CylinderGeometry(r*2.5,r*2.5,r*.22,40),mat));w.position.y=len*.68-r*.9;g.add(w);
  const nut=hexNut(r*2.2,r*1.7,mat);nut.position.y=len*.68;g.add(nut);
  return g}
function boltAnchor(mat){const g=new THREE.Group(),r=.09;
  const path=new THREE.CurvePath();
  path.add(new THREE.LineCurve3(new THREE.Vector3(0,2.1,0),new THREE.Vector3(0,.45,0)));
  path.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,.45,0),new THREE.Vector3(0,0,0),new THREE.Vector3(.4,0,0)));
  path.add(new THREE.LineCurve3(new THREE.Vector3(.4,0,0),new THREE.Vector3(.62,0,0)));
  g.add(sh(new THREE.Mesh(new THREE.TubeGeometry(path,80,r,20,false),mat)));
  threadOn(g,r*.97,1.5,2.08,mat);
  const nut=hexNut(r*2.15,r*1.6,mat);nut.position.y=1.74;g.add(nut);
  const pl=sh(new THREE.Mesh(new THREE.BoxGeometry(.46,.05,.46),mat));pl.position.y=1.63;g.add(pl);
  g.position.y=r;return g}
function buildPernos(v){const g=new THREE.Group();const m=v===2?mats.bronze:mats.blackS,K=mats.blackS;
  const lay=(o,x,rz)=>{o.position.x=x;o.rotation.y=rz||0;g.add(o)};
  if(v===0){lay(boltHex(K,1.9),-1.05,.3);lay(boltHex(mats.bronze,1.6,{full:1}),0,-.2);lay(boltAnchor(K),.9,-.6)}
  else if(v===1){lay(boltHex(m,2.1),-.75,.3);lay(boltForged(m,1.6),0,-.4);const n=hexNut(.26,.2,m);n.position.set(.75,.1,.2);g.add(n)}
  else if(v===2){lay(boltHex(m,1.9,{full:1}),-.4,.2);lay(boltHex(m,1.35,{full:1}),.45,-.3);
    [[.95,.1],[1.1,-.35]].forEach(([x,z],i)=>{const w=sh(new THREE.Mesh(new THREE.TorusGeometry(.2,.06,8,32),m));w.rotation.x=Math.PI/2;w.scale.z=.4;w.position.set(x,.025,z);g.add(w)})}
  else if(v===3){lay(boltAnchor(m),-.3,.2);lay(boltAnchor(m),.45,-1)}
  else{lay(barHelical(),-.35,0);const b2=barHelical();b2.scale.setScalar(.8);lay(b2,.5,.6)}
  return v===4?{g,size:3.1,y:1.25}:{g,size:2.6,y:1}}
function barHelical(){const g=new THREE.Group(),r=.085,L=2.4,mat=mats.steel;
  const b=sh(new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,24),mat));b.position.y=L/2;g.add(b);
  const pts=[],pitch=.16,n=Math.ceil(L/pitch*24);for(let i=0;i<=n;i++){const a=i/24*Math.PI*2;pts.push(new THREE.Vector3(Math.cos(a)*r,.03+i/n*(L-.06),Math.sin(a)*r))}
  g.add(sh(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),n*2,.022,6,false),mat)));
  const pl=sh(new THREE.Mesh(new THREE.CylinderGeometry(.34,.3,.06,4),mats.steelL));pl.rotation.y=Math.PI/4;pl.position.y=L*.78;g.add(pl);
  const dome=sh(new THREE.Mesh(new THREE.SphereGeometry(.13,20,10,0,Math.PI*2,0,Math.PI/2),mats.steelL));dome.position.y=L*.78+.03;g.add(dome);
  const nut=sh(new THREE.Mesh(new THREE.CylinderGeometry(r*1.9,r*1.9,r*1.6,6),mat));nut.position.y=L*.78+.18;g.add(nut);
  return g}
function corr(R0,L,P,A,phi){const pts=[],n=Math.round(L/P*14);
  for(let i=0;i<=n;i++){const y=-L/2+L*i/n;pts.push(new THREE.Vector2(R0+A*Math.sin(y/P*Math.PI*2),y))}
  const geo=new THREE.LatheGeometry(pts,phi?72:96,0,phi||Math.PI*2);geo.computeVertexNormals();
  const m=sh(new THREE.Mesh(geo,mats.galv.clone()));m.material.side=THREE.DoubleSide;return m}
function buildAlc(v){const g=new THREE.Group();
  if(v===2){const R0=.2,m=mats.galv,fl=(x,y,z,rx,rz)=>{const f=sh(new THREE.Mesh(new THREE.CylinderGeometry(R0*1.75,R0*1.75,.07,32),mats.galvD));f.position.set(x,y,z);f.rotation.set(rx||0,0,rz||0);g.add(f);
      for(let i=0;i<8;i++){const a=i/8*Math.PI*2,b=sh(new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.1,8),mats.steel));b.position.set(Math.cos(a)*R0*1.45,0,Math.sin(a)*R0*1.45);f.add(b)}};
    // codo de 90°
    const el=sh(new THREE.Mesh(new THREE.TorusGeometry(.55,R0,24,48,Math.PI/2),m));el.position.set(-1.1,.75,0);g.add(el);
    fl(-.55,.75,0);fl(-1.1,1.3,0,0,Math.PI/2);
    // tee
    const tm=sh(new THREE.Mesh(new THREE.CylinderGeometry(R0,R0,1.1,32),m));tm.rotation.z=Math.PI/2;tm.position.set(.55,R0*1.75,0);g.add(tm);
    const tb=sh(new THREE.Mesh(new THREE.CylinderGeometry(R0,R0,.55,32),m));tb.position.set(.55,R0*1.75+.27,0);g.add(tb);
    fl(0,R0*1.75,0,0,Math.PI/2);fl(1.1,R0*1.75,0,0,Math.PI/2);fl(.55,R0*1.75+.55,0);
    // reducción
    const rd=sh(new THREE.Mesh(new THREE.CylinderGeometry(R0*.6,R0,.45,32),m));rd.rotation.z=Math.PI/2;rd.position.set(-.35,R0,.95);rd.rotation.y=.5;g.add(rd);
    return {g,size:3.2,y:.6}}
  if(v===0){const t=corr(.62,3.2,.12,.022);t.rotation.z=Math.PI/2;t.position.y=.64;g.add(t);
    [-1.6,1.6].forEach(x=>{const ring=sh(new THREE.Mesh(new THREE.TorusGeometry(.62,.025,10,64),mats.galvD));ring.rotation.y=Math.PI/2;ring.position.set(x,.64,0);g.add(ring)});
    return {g,size:3.4,y:.64}}
  const a=corr(1.25,3,.22,.05,Math.PI);a.rotation.z=Math.PI/2;a.rotation.y=0;g.add(a);
  [-1.5,1.5].forEach(x=>{const ring=sh(new THREE.Mesh(new THREE.TorusGeometry(1.25,.04,10,64,Math.PI),mats.galvD));ring.rotation.y=Math.PI/2;ring.position.x=x;g.add(ring)});
  [-1,1].forEach(z=>{const f=sh(new THREE.Mesh(new THREE.BoxGeometry(3.1,.12,.3),mats.galvD));f.position.set(0,.06,z*1.27);g.add(f)});
  return {g,size:3.6,y:.7}}
function buildGrat(v){const g=new THREE.Group(),W=2.6,D=1.7,H=.12,sp=.08,t=.014;const mat=mats.galv;
  const nb=Math.floor(W/sp);const bar=new THREE.BoxGeometry(t,H,D);
  const ib=new THREE.InstancedMesh(bar,mat,nb+1);const o=new THREE.Object3D();
  for(let i=0;i<=nb;i++){o.position.set(-W/2+i*sp,H/2,0);o.updateMatrix();ib.setMatrixAt(i,o.matrix)}ib.castShadow=ib.receiveShadow=true;g.add(ib);
  const nc=Math.floor(D/.1);const cr=new THREE.CylinderGeometry(.009,.009,W,8);cr.rotateZ(Math.PI/2);
  const ic=new THREE.InstancedMesh(cr,mat,nc+1);for(let i=0;i<=nc;i++){o.position.set(0,H-.012,-D/2+i*.1);o.updateMatrix();ic.setMatrixAt(i,o.matrix)}ic.castShadow=true;g.add(ic);
  if(v===1){const nt=Math.floor(D/.035);const tooth=new THREE.ConeGeometry(.012,.022,4);const it=new THREE.InstancedMesh(tooth,mat,(nb+1)*nt);let k=0;
    for(let i=0;i<=nb;i++)for(let j=0;j<nt;j++){o.position.set(-W/2+i*sp,H+.01,-D/2+j*.035+.017);o.updateMatrix();it.setMatrixAt(k++,o.matrix)}g.add(it)}
  [[W+.03,H,t*2,0,-D/2],[W+.03,H,t*2,0,D/2]].forEach(([a,b,c,x,z])=>{const f=sh(new THREE.Mesh(new THREE.BoxGeometry(a,b,c),mats.galvD));f.position.set(x,H/2,z);g.add(f)});
  g.rotation.x=-.0;g.position.y=.02;
  // Segundo panel apoyado, para leer el espesor
  const g2=new THREE.Group();g2.add(g);const c2=g.clone();c2.position.set(.5,.62,-.35);c2.rotation.set(-1.05,0,.0);g2.add(c2);
  return {g:g2,size:2.9,y:.45}}
function buildPoste(v){const g=new THREE.Group(),Hh=4.6;
  const p=sh(new THREE.Mesh(new THREE.CylinderGeometry(.07,.14,Hh,8),mats.galv));p.position.y=Hh/2+.05;g.add(p);
  const base=sh(new THREE.Mesh(new THREE.BoxGeometry(.6,.05,.6),mats.galvD));base.position.y=.025;g.add(base);
  for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;
    const gu=sh(new THREE.Mesh(new THREE.BoxGeometry(.012,.22,.16),mats.galvD));gu.position.set(Math.cos(a)*.2,.15,Math.sin(a)*.2);gu.rotation.y=-a;g.add(gu);
    const b=sh(new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.14,10),mats.steel));b.position.set(Math.cos(a+Math.PI/4)*.24,.1,Math.sin(a+Math.PI/4)*.24);g.add(b);
    const n=sh(new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.03,6),mats.steel));n.position.copy(b.position);n.position.y=.07;g.add(n)}
  if(v===0){const arm=new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,Hh-.25,0),new THREE.Vector3(0,Hh+.3,0),new THREE.Vector3(1.2,Hh+.35,0));
    g.add(sh(new THREE.Mesh(new THREE.TubeGeometry(arm,40,.035,10,false),mats.galv)));
    const lum=sh(new THREE.Mesh(new THREE.BoxGeometry(.55,.08,.22),mats.galvD));lum.position.set(1.35,Hh+.33,0);g.add(lum);
    const led=new THREE.Mesh(new THREE.BoxGeometry(.42,.01,.15),mats.lamp);led.position.set(1.35,Hh+.285,0);g.add(led);}
  else{const cr=sh(new THREE.Mesh(new THREE.BoxGeometry(1.4,.07,.07),mats.galvD));cr.position.y=Hh-.15;g.add(cr);
    [-.6,-.2,.2,.6].forEach(x=>{const ins=sh(new THREE.Mesh(new THREE.CylinderGeometry(.04,.055,.16,12),mats.ins));ins.position.set(x,Hh-.03,0);g.add(ins)})}
  g.rotation.y=-.5;return {g,size:5.2,y:2.5}}
// Encofrados: según las fotos de la web original (paneles amarillos con puntales, circulares rojos y negros, muros altos con andamio)
function encPanel(W,H,fm,face){const g=new THREE.Group(),d=.09,t=.02;fm=fm||mats.yel;
  const f=sh(new THREE.Mesh(new THREE.BoxGeometry(W,H,t),face||mats.yelF));f.position.set(0,H/2,0);g.add(f);
  const fr=(w,h,x,y)=>{const b=sh(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),fm));b.position.set(x,y,-d/2-t/2);g.add(b)};
  fr(W,.06,0,.03);fr(W,.06,0,H-.03);fr(.06,H,-W/2+.03,H/2);fr(.06,H,W/2-.03,H/2);
  const n=Math.max(2,Math.round(H/.55));for(let i=1;i<n;i++)fr(W-.1,.05,0,H*i/n);
  fr(.05,H-.1,0,H/2);
  return g}
function encProp(g,x,y0,z0,len,m){const p=sh(new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,len,12),m||mats.yel));
  const a=Math.PI/4;p.position.set(x,y0-Math.cos(a)*len/2,z0-Math.sin(a)*len/2);p.rotation.x=a;g.add(p);
  const bp=sh(new THREE.Mesh(new THREE.BoxGeometry(.2,.03,.2),m||mats.yel));bp.position.set(x,.015,z0-Math.sin(a)*len);g.add(bp)}
function encShell(R,H,m){const g=new THREE.Group();
  const f=sh(new THREE.Mesh(new THREE.CylinderGeometry(R,R,H,48,1,true,0,Math.PI),m.clone()));f.material.side=THREE.DoubleSide;f.position.y=H/2;g.add(f);
  for(let i=0;i<=3;i++){const y=.03+i*(H-.06)/3;const r=sh(new THREE.Mesh(new THREE.CylinderGeometry(R+.08,R+.08,.025,48,1,true,0,Math.PI),m.clone()));r.material.side=THREE.DoubleSide;r.position.y=y;g.add(r);}
  for(let i=0;i<=4;i++){const a=i/4*Math.PI;const b=sh(new THREE.Mesh(new THREE.BoxGeometry(.012,H,.08),m));b.position.set(Math.sin(a)*(R+.04),H/2,Math.cos(a)*(R+.04));b.rotation.y=a;g.add(b)}
  [0,Math.PI].forEach(a=>{const fl=sh(new THREE.Mesh(new THREE.BoxGeometry(.012,H,.1),m));fl.position.set(Math.sin(a)*(R+.05),H/2,Math.cos(a)*(R+.05));fl.rotation.y=Math.PI/2;g.add(fl)});
  return g}
function buildEnc(v){const g=new THREE.Group();
  if(v===1){const a=encShell(.95,1.6,mats.red);a.rotation.y=Math.PI/2;a.position.set(-.6,0,0);g.add(a);
    const b=encShell(.95,1.6,mats.blk);b.rotation.y=-Math.PI/2+.25;b.position.set(1.15,0,.35);g.add(b);
    g.rotation.y=.4;return {g,size:3.6,y:.8}}
  if(v===2){const H=4.2;const p=encPanel(1.6,H);g.add(p);const p2=encPanel(1.6,H);p2.position.x=-1.62;g.add(p2);
    // andamio rojo detrás
    const sc=mats.red,z0=-.75,z1=-1.65;
    [-2.3,-.8,.7].forEach(x=>[z0,z1].forEach(z=>{const c=sh(new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,H+.2,8),sc));c.position.set(x,(H+.2)/2,z);g.add(c)}));
    for(let y=.9;y<H;y+=1.05){[z0,z1].forEach(z=>{const r=sh(new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,3,8),sc));r.rotation.z=Math.PI/2;r.position.set(-.8,y,z);g.add(r)});
      [-2.3,-.8,.7].forEach(x=>{const r=sh(new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.9,8),sc));r.rotation.x=Math.PI/2;r.position.set(x,y,(z0+z1)/2);g.add(r)});
      const pl=sh(new THREE.Mesh(new THREE.BoxGeometry(3,.04,.85),mats.galvD));pl.position.set(-.8,y-.03,(z0+z1)/2);g.add(pl)}
    for(let y=.4;y<H;y+=1.05){const t=sh(new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.7,8),mats.galvD));t.rotation.x=Math.PI/2;t.position.set(-.8,y+.3,-.42);g.add(t)}
    const w=new THREE.Group();g.position.x=.8;w.add(g);w.rotation.y=Math.PI*.8;return {g:w,size:4.8,y:2.1}}
  const p=encPanel(1.9,2.2);g.add(p);const p2=encPanel(1.9,2.2);p2.position.x=-1.92;g.add(p2);
  [-2.5,-1.35,-.6,.6].forEach(x=>encProp(g,x,1.7,-.12,2.38));
  g.position.x=.96;const w=new THREE.Group();w.add(g);w.rotation.y=Math.PI*.8;return {g:w,size:3.6,y:1.1}}
// Infraestructura metálica: líneas de la web original (galpones, cerchas para túneles, escaleras, pasamanos y pasarelas, estructuras)
const bx=(g,w,h,d,x,y,z,m,rx,ry,rz)=>{const o=sh(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m));o.position.set(x,y,z);o.rotation.set(rx||0,ry||0,rz||0);g.add(o);return o};
const rod=(g,a,b,r,m)=>{const d=new THREE.Vector3().subVectors(b,a),L=d.length();const o=sh(new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,8),m));
  o.position.copy(a).addScaledVector(d,.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(o);return o};
function archTruss(g,z,S,H,R0,m){const n=18,top=[],bot=[];
  for(let i=0;i<=n;i++){const t=i/n,a=Math.PI*(1-t);const k=Math.sin(Math.PI*t);
    top.push(new THREE.Vector3(Math.cos(a)*S/2,H+Math.sin(a)*R0,z));bot.push(new THREE.Vector3(Math.cos(a)*(S/2-.02),H-.22*(.3+.7*k)+Math.sin(a)*R0*.93,z))}
  for(let i=0;i<n;i++){rod(g,top[i],top[i+1],.03,m);rod(g,bot[i],bot[i+1],.03,m);rod(g,i%2?top[i]:bot[i],i%2?bot[i+1]:top[i+1],.015,m)}
  [-1,1].forEach(s=>{bx(g,.12,H,.12,s*S/2,H/2,z,m);bx(g,.3,.03,.3,s*S/2,.015,z,mats.galvD)})}
function cercha(g,z,R,m){const sh2=new THREE.Shape();const W=.16,T=.022,Hh=.2;
  sh2.moveTo(-W/2,-Hh/2);sh2.lineTo(W/2,-Hh/2);sh2.lineTo(W/2,-Hh/2+T);sh2.lineTo(T/2,-Hh/2+T);sh2.lineTo(T/2,Hh/2-T);sh2.lineTo(W/2,Hh/2-T);sh2.lineTo(W/2,Hh/2);
  sh2.lineTo(-W/2,Hh/2);sh2.lineTo(-W/2,Hh/2-T);sh2.lineTo(-T/2,Hh/2-T);sh2.lineTo(-T/2,-Hh/2+T);sh2.lineTo(-W/2,-Hh/2+T);sh2.closePath();
  const pts=[];const n=40;for(let i=0;i<=n;i++){const a=-.15*Math.PI+i/n*1.3*Math.PI;pts.push(new THREE.Vector3(Math.cos(a)*R,Math.sin(a)*R+R*.46,z))}
  pts[0].y=0;pts[n].y=0;
  const geo=new THREE.ExtrudeGeometry(sh2,{steps:120,bevelEnabled:false,extrudePath:new THREE.CatmullRomCurve3(pts)});
  g.add(sh(new THREE.Mesh(geo,m)));[pts[0],pts[n]].forEach(p=>bx(g,.4,.03,.4,p.x,.015,z,m));return pts}
function railG(g,x0,x1,y0,y1,z,H,m){const n=Math.max(2,Math.round(Math.abs(x1-x0)/.6));
  for(let i=0;i<=n;i++){const t=i/n;bx(g,.04,H,.04,x0+(x1-x0)*t,y0+(y1-y0)*t+H/2,z,m)}
  rod(g,new THREE.Vector3(x0,y0+H,z),new THREE.Vector3(x1,y1+H,z),.025,m);rod(g,new THREE.Vector3(x0,y0+H*.5,z),new THREE.Vector3(x1,y1+H*.5,z),.018,m)}
function buildInfra(v){const g=new THREE.Group();
  if(v===0){const S=4,H=1.3;[-1.6,-.53,.53,1.6].forEach(z=>archTruss(g,z,S,H,1.05,mats.blk));
    for(let i=1;i<9;i++){const a=Math.PI*i/9;rod(g,new THREE.Vector3(Math.cos(a)*S/2,H+Math.sin(a)*1.05,-1.6),new THREE.Vector3(Math.cos(a)*S/2,H+Math.sin(a)*1.05,1.6),.022,mats.galvD)}
    [-1,1].forEach(s=>rod(g,new THREE.Vector3(s*S/2,H,-1.6),new THREE.Vector3(s*S/2,H,1.6),.03,mats.blk));
    g.rotation.y=.6;return {g,size:4.8,y:1.1}}
  if(v===1){const R=1.25;[-.6,.6].forEach(z=>cercha(g,z,R,mats.blk));
    for(let i=1;i<8;i++){const a=-.15*Math.PI+i/8*1.3*Math.PI;rod(g,new THREE.Vector3(Math.cos(a)*R,Math.sin(a)*R+R*.46,-.6),new THREE.Vector3(Math.cos(a)*R,Math.sin(a)*R+R*.46,.6),.025,mats.galvD)}
    g.rotation.y=.7;return {g,size:3.6,y:1.25}}
  if(v===2){const n=11,rh=.2,rd=.26,W=.9,m=mats.yel,L=n*rd,Ht=n*rh;
    [-W/2,W/2].forEach(z=>{const a=new THREE.Vector3(-L/2,0,z),b=new THREE.Vector3(L/2,Ht,z);const d=new THREE.Vector3().subVectors(b,a);
      const s1=bx(g,d.length(),.2,.06,(a.x+b.x)/2,(a.y+b.y)/2,z,m,0,0,Math.atan2(d.y,d.x))});
    for(let i=0;i<n;i++)bx(g,rd+.02,.03,W-.06,-L/2+(i+.5)*rd,(i+1)*rh-.02,0,mats.galvD);
    bx(g,.8,.04,W+.06,L/2+.4,Ht-.02,0,mats.galvD);
    [-W/2-.03,W/2+.03].forEach(z=>{railG(g,-L/2+.1,L/2,.1,Ht,z,.9,m);railG(g,L/2,L/2+.8,Ht,Ht,z,.9,m)});
    g.rotation.y=-.5;return {g,size:3.6,y:1.15}}
  if(v===3){const m=mats.yel,L=3.2,W=1.1,y=.9;
    bx(g,L,.12,.08,0,y,-W/2,m);bx(g,L,.12,.08,0,y,W/2,m);for(let x=-L/2;x<=L/2+.01;x+=L/6)bx(g,.06,.1,W,x,y,0,m);
    const gr=bx(g,L,.03,W,0,y+.07,0,mats.galv);
    [-L/2+.1,0,L/2-.1].forEach(x=>[-W/2,W/2].forEach(z=>{bx(g,.1,y,.1,x,y/2,z,m);bx(g,.25,.02,.25,x,.01,z,mats.galvD)}));
    [-W/2,W/2].forEach(z=>railG(g,-L/2,L/2,y+.08,y+.08,z,1,m));
    g.rotation.y=-.45;return {g,size:3.6,y:1.05}}
  const m=mats.blk,H=1.6;
  [[-1.2,-.8],[-1.2,.8],[.2,-.8],[.2,.8]].forEach(([x,z])=>{bx(g,.14,H*2,.14,x,H,z,m);bx(g,.35,.03,.35,x,.015,z,mats.galvD)});
  [H,H*2].forEach(y=>{[-.8,.8].forEach(z=>bx(g,2.6,.16,.1,.1,y,z,m));[-1.2,.2].forEach(x=>bx(g,.1,.16,1.7,x,y,0,m));
    for(let x=-.9;x<=1.4;x+=.35)bx(g,.06,.1,1.6,x,y+.05,0,mats.galvD)});
  [-.8,.8].forEach(z=>rod(g,new THREE.Vector3(.2,H*2-.2,z),new THREE.Vector3(1.4,H*2,z),.03,m));
  g.rotation.y=.55;return {g,size:3.8,y:1.5}}
// Soporte en roca: barra helicoidal BAHE con placa y tuerca, y cartuchos de resina (colores de las fotos originales)
function buildRoca(v){const g=new THREE.Group();
  if(v===1){const cols=[0x222326,0xc0392b,0x2f7fc1,0x1f9a6e,0xcdb98a];
    cols.forEach((c,i)=>{const L=2.6-i*.18,r=.085;const m=new THREE.MeshStandardMaterial({color:new THREE.Color(c).convertSRGBToLinear(),metalness:0,roughness:.5,envMapIntensity:.8});
      const t=sh(new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,24),m));t.rotation.z=Math.PI/2;t.position.set(0,r+i*.2,(i-2)*.03);
      const e1=sh(new THREE.Mesh(new THREE.SphereGeometry(r*.6,12,8),mats.galv));e1.position.y=L/2+.03;t.add(e1);const e2=e1.clone();e2.position.y=-L/2-.03;t.add(e2);
      const w=new THREE.Group();w.add(t);w.rotation.y=i*.06;w.position.set(i*.08,0,-.5+i*.24);g.add(w)});
    g.rotation.y=.35;return {g,size:3,y:.45}}
  const b=barHelical();b.rotation.y=.6;g.add(b);
  return {g,size:2.8,y:1.2}}
// Piezas especiales: carcasa roja con bandas negras (foto de fabricación) y cilindro en reparación
function buildPieza(v){const g=new THREE.Group();
  if(v===1){const R=.85,L=2.4;const c=sh(new THREE.Mesh(new THREE.CylinderGeometry(R,R,L,64,1,true),mats.steelL.clone()));c.material.side=THREE.DoubleSide;c.rotation.z=Math.PI/2;c.position.y=R+.1;g.add(c);
    [-L/2,L/2].forEach(x=>{const f=sh(new THREE.Mesh(new THREE.TorusGeometry(R+.04,.06,12,64),mats.steel));f.rotation.y=Math.PI/2;f.position.set(x,R+.1,0);g.add(f)});
    [-.6,0,.6].forEach(x=>{const h=sh(new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.08,24),mats.blk));h.position.set(x,2*R+.12,0);g.add(h)});
    const wl=sh(new THREE.Mesh(new THREE.TorusGeometry(R+.005,.012,6,64),mats.bronze));wl.rotation.y=Math.PI/2;wl.position.set(.3,R+.1,0);g.add(wl);
    [-.8,.8].forEach(x=>{bx(g,.2,.35,1.4,x,.17,0,mats.blk)});
    g.rotation.y=.5;return {g,size:3,y:.9}}
  const m=mats.redO,R=.9,W=.75;
  [-.5,.5].forEach((z,k)=>{const sg=new THREE.Group();
    const sh1=sh(new THREE.Mesh(new THREE.CylinderGeometry(R,R,W,48,1,true,0,Math.PI*1.25),m.clone()));sh1.material.side=THREE.DoubleSide;sh1.rotation.x=Math.PI/2;sg.add(sh1);
    [-W/2,W/2].forEach(dz=>{const s=sh(new THREE.Mesh(new THREE.CircleGeometry(R,48,0,Math.PI*1.25),m.clone()));s.material.side=THREE.DoubleSide;s.position.z=dz;s.rotation.x=0;sg.add(s);
      const band=sh(new THREE.Mesh(new THREE.TorusGeometry(R,.05,8,48,Math.PI*1.25),mats.blk));band.position.z=dz;sg.add(band)});
    sg.rotation.z=Math.PI*.62;sg.position.set(0,R+.05,z*1.9);g.add(sg)});
  const p=sh(new THREE.Mesh(new THREE.CylinderGeometry(.33,.33,1.2,32),m));p.rotation.x=Math.PI/2;p.position.set(0,R*1.25,0);g.add(p);
  const fl=sh(new THREE.Mesh(new THREE.CylinderGeometry(.48,.48,.06,32),m));fl.rotation.x=Math.PI/2;
  [-.6,.6].forEach(z=>{const f=fl.clone();f.position.set(0,R*1.25,z);g.add(f)});
  const n=sh(new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.6,32),m));n.position.set(.55,.3,0);g.add(n);
  const nf=fl.clone();nf.rotation.set(0,0,0);nf.position.set(.55,.03,0);g.add(nf);
  g.rotation.y=-.7;return {g,size:3.4,y:.95}}
const BUILD={pernos:buildPernos,alc:buildAlc,grat:buildGrat,poste:buildPoste,enc:buildEnc,infra:buildInfra,roca:buildRoca,pieza:buildPieza};
let built=null;
function setModel(m,v){if(!R)return;
  while(root.children.length){const c=root.children.pop();c.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
  built=BUILD[m](v);root.add(built.g);root.scale.setScalar(.001);st.grow=0;st.ty=built.y;st.tdist=1;st.dist=1.25;
  resize()}
function resize(){if(!R)return;const w=gl.clientWidth,h=gl.clientHeight;if(!w||!h)return;R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
addEventListener('resize',resize);
let run=false,visible=true;
function loop(t){if(!run)return;requestAnimationFrame(loop);
  if(st.auto&&performance.now()-st.lastUser>2500)st.ry+=.004;
  st.ry+=st.vry;st.vry*=.92;st.dist+=(st.tdist-st.dist)*.08;
  if(st.grow<1){st.grow=Math.min(1,st.grow+.04);const e=1-Math.pow(1-st.grow,3);root.scale.setScalar(.6+.4*e)}
  root.rotation.y=st.ry;
  const narrow=innerWidth<761,W=gl.clientWidth||innerWidth;const tn=Math.tan(THREE.MathUtils.degToRad(cam.fov/2));
  // Hueco a la derecha del panel, dentro del ancho de 1240 px de la página
  const wl=Math.max(10,(W-1240)/2),pr=wl+18+Math.min(440,W-36),cx=narrow?W/2:(pr+W-wl-60)/2,fr=narrow?1:Math.max(.3,(W-wl-60-pr)/W);
  const fit=Math.max(built.size/(2*tn)*1.3,built.size/(2*tn*cam.aspect*fr)*1.08);const d=fit*st.dist;
  const ndc=cx/W*2-1,off=-ndc*fit*tn*cam.aspect; // objeto centrado en ese hueco
  if(st.cx!==cx){st.cx=cx;tour.style.setProperty('--ox',(cx/W*100).toFixed(1)+'%')}
  const ly=st.ty-built.size*(narrow?.12:.07);cam.position.set(off,ly+d*Math.sin(st.rx)+.2,d*Math.cos(st.rx));
  cam.lookAt(off,ly,0);
  R.render(S,cam)}
function start3D(){if(!R||run||!visible)return;run=true;requestAnimationFrame(loop)}
function stop3D(){run=false}
// Gestos
const ptr=new Map();let pd0=0;
gl.addEventListener('pointerdown',e=>{gl.setPointerCapture(e.pointerId);ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});gl.classList.add('drag');touched();
  if(ptr.size===2){const [a,b]=[...ptr.values()];pd0=Math.hypot(a.x-b.x,a.y-b.y)}});
gl.addEventListener('pointermove',e=>{const p=ptr.get(e.pointerId);if(!p)return;
  if(ptr.size===2){p.x=e.clientX;p.y=e.clientY;const [a,b]=[...ptr.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);if(pd0){st.tdist=Math.min(1.5,Math.max(.45,st.tdist*pd0/d))}pd0=d;return}
  const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;st.vry=dx*.006;st.ry+=dx*.004;st.rx=Math.min(.9,Math.max(-.05,st.rx+dy*.004));st.lastUser=performance.now()});
const up=e=>{ptr.delete(e.pointerId);if(!ptr.size)gl.classList.remove('drag');pd0=0};
gl.addEventListener('pointerup',up);gl.addEventListener('pointercancel',up);
gl.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();touched();st.tdist=Math.min(1.5,Math.max(.45,st.tdist*(1+e.deltaY*.0012)))},{passive:false});
/* ---------- Capítulos ---------- */
let idx=0,t0=0,paused=false,started=false;
const esc=s=>String(s).replace(/[&<]/g,c=>({'&':'&amp;','<':'&lt;'}[c]));
function drawRail(){const u=ZO(UI);
  rail.innerHTML=C.map((c,i)=>`<button type="button" role="tab" data-i="${i}" aria-selected="${i===idx}"><small>${c.m?u.t3:c.eq?TR("Venta","Sale"):u.tf} · ${esc(ZO(c).k)}</small><span>${esc(ZO(c).t)}</span><i></i></button>`).join('')}
function fill(i){const c=C[i],t=ZO(c),u=ZO(UI);
  $('pt-k').textContent=t.k;$('pt-n').textContent=(i+1)+' / '+C.length;$('pt-t').textContent=t.t;$('pt-d').textContent=t.d;
  $('pt-v').innerHTML=t.v?t.v.map((v,j)=>`<button type="button" data-v="${j}" aria-pressed="${j===vari}">${esc(v)}</button>`).join('')+(t.lk?`<p class="pt-lk"><span>${TR('También','Also')}</span>${t.lk.map(([a,b])=>`<a href="/productos/${b}">${esc(a)} ›</a>`).join('')}</p>`:''):`<p class="pt-tags">${esc(t.tags)}</p>`+(t.lk?`<p class="pt-lk"><span>${TR('También','Also')}</span>${t.lk.map(([a,b])=>`<a href="/productos/${b}">${esc(a)} ›</a>`).join('')}</p>`:'');
  $('pt-f').innerHTML=(t.vf?t.vf[vari]:t.f).map(([a,b])=>`<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('');
  $('pt-wa').textContent=u.wa;$('pt-wa').href='https://wa.me/593964068392?text='+encodeURIComponent(u.q+t.t);
  $('pt-l').textContent=u.more;$('pt-l').href='/productos/'+(c.es.vs?c.es.vs[vari]||c.s:c.s);
  $('pt-cap').textContent='';
  $("pt-hint").textContent=c.m?(innerWidth<761?u.dragm:u.drag):c.eq?TR("Elija un modelo","Pick a model"):u.photo}
function go(i,user){i=(i+C.length)%C.length;if(user)touched();
  const c=C[i];idx=i;vari=0;
  rail.querySelectorAll('button').forEach((b,j)=>{b.setAttribute('aria-selected',j===i);b.style.removeProperty('--p')});
  const sel=rail.children[i];requestAnimationFrame(()=>{if(sel&&rail.scrollWidth>rail.clientWidth)rail.scrollTo({left:sel.offsetLeft-rail.clientWidth/2+sel.offsetWidth/2,behavior:reduce?'auto':'smooth'})});
  panel.classList.add('out');
  setTimeout(()=>{fill(i);panel.classList.remove('out')},reduce?0:260);
  tour.querySelectorAll('.pt-ph').forEach(p=>{p.classList.toggle('on',!!c.ph&&p.id==='pt-ph-'+c.ph);p.classList.remove('zoom')});
  tour.querySelectorAll('.pt-bg').forEach(p=>p.classList.toggle('on',!c.ph&&!!c.bg&&p.id==='pt-bg-'+c.bg));
  tour.classList.toggle('photo-on',!!c.ph);
  shot(c,0);
  if(c.m&&R){gl.classList.add('on');setModel(c.m,0);start3D()}else{gl.classList.remove('on');setTimeout(()=>{if(!C[idx].m)stop3D()},600)}
  t0=performance.now()}
function touched(){paused=true;st.lastUser=performance.now();rail.querySelectorAll('button').forEach(b=>b.style.removeProperty('--p'))}
function tick(){const el=rail.children[idx];
  if(visible&&!paused&&!reduce){const p=Math.min(1,(performance.now()-t0)/9000);el&&el.style.setProperty('--p',(p*100)+'%');if(p>=1)go(idx+1)}else t0=performance.now();
  requestAnimationFrame(tick)}
rail.addEventListener('click',e=>{const b=e.target.closest('button');if(b)go(+b.dataset.i,true)});
$('pt-prev').onclick=()=>go(idx-1,true);$('pt-next').onclick=()=>go(idx+1,true);
$('pt-v').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;touched();vari=+b.dataset.v;
  $('pt-v').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));const vs=C[idx].es.vs;if(vs)$('pt-l').href='/productos/'+vs[vari];
  if(C[idx].eq){shot(C[idx],vari);$('pt-f').innerHTML=ZO(C[idx]).vf[vari].map(([a,b])=>`<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}else if(R)setModel(C[idx].m,vari)});
function shot(c,v){const box=$('pt-shot'),im=box.querySelector('img');box.classList.toggle('on',!!c.eq);if(!c.eq)return;
  const src='/img/equipos/'+c.eq[v]+'.webp';if(im.getAttribute('src')===src)return;im.classList.add('sw');setTimeout(()=>{im.onload=()=>im.classList.remove('sw');im.src=src;im.alt=ZO(c).v[v];if(im.complete)im.classList.remove('sw')},reduce?0:220)}
tour.querySelectorAll('.pt-ph').forEach(p=>p.addEventListener('click',e=>{touched();const r=p.getBoundingClientRect(),img=p.querySelector('img');
  if(!p.classList.contains('zoom'))img.style.transformOrigin=((e.clientX-r.left)/r.width*100)+'% '+((e.clientY-r.top)/r.height*100)+'%';p.classList.toggle('zoom')}));
tour.addEventListener('keydown',e=>{if(e.target.closest('.pt-rail,.pt-arrows')){if(e.key==='ArrowRight')go(idx+1,true);if(e.key==='ArrowLeft')go(idx-1,true)}});
new MutationObserver(()=>{drawRail();fill(idx)}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
// three.js se carga cuando la sección está cerca
function load3D(){if(window.THREE)return Promise.resolve();return new Promise((ok,ko)=>{const s=document.createElement('script');s.src='/vendor/three/three.min.js';s.onload=ok;s.onerror=ko;document.head.appendChild(s)})}
function boot(){if(started)return;started=true;
  load3D().then(()=>{if(initGL()&&C[idx].m){gl.classList.add('on');setModel(C[idx].m,vari);start3D()}}).catch(()=>{});
  t0=performance.now();requestAnimationFrame(tick)}
drawRail();fill(0);go(0);
if('IntersectionObserver' in window){
  new IntersectionObserver(es=>{if(es[0].isIntersecting)boot()},{rootMargin:'600px 0px'}).observe(tour);
  new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible&&C[idx].m)start3D();else stop3D()}).observe(tour);
}else boot();
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop3D();else if(visible&&C[idx].m)start3D()});
})();
