/* Estadísticas: Umami (sin cookies, cuenta todas las visitas) + Google Analytics 4 (solo si la persona acepta
   cookies en el aviso de abajo; la elección se guarda en el navegador).
   Eventos: WhatsApp, Llamar, Correo, Descargar catálogo, Ver catálogo. "Postulación enviada" se
   registra en trabaja.js. Si un servicio no cargó (bloqueador, vista local), no hace nada. */
(function(){
  // ===== Google Analytics 4 =====
  var GA='G-XW8GYRE3BQ';   // ID de medición (cuenta "Jocecia", flujo "Web Jocecia")
  var CLAVE='cookies-ga';  // 'si' / 'no' en localStorage
  var T={es:{txt:'Usamos cookies de Google Analytics para saber cómo se usa esta web y mejorarla.',si:'Aceptar',no:'Rechazar'},
         en:{txt:'We use Google Analytics cookies to understand how this website is used and improve it.',si:'Accept',no:'Decline'},
         zh:{txt:'我们使用 Google Analytics Cookie 了解本网站的使用情况并加以改进。',si:'接受',no:'拒绝'}};
  function leer(){try{return localStorage.getItem(CLAVE)}catch(e){return null}}
  function guardar(v){try{localStorage.setItem(CLAVE,v)}catch(e){}}
  function cargarGA(){
    if(window.gtag)return;
    window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};
    gtag('js',new Date());gtag('config',GA);
    var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+GA;document.head.appendChild(s);
  }
  function aviso(){
    var l=function(){return T[(document.documentElement.lang||'es').slice(0,2)]||T.es};
    var d=document.createElement('div');d.className='ck';d.setAttribute('role','region');d.setAttribute('aria-label','Cookies');
    d.innerHTML='<p></p><div class="ck-act"><button type="button" class="btn btn-accent ck-si"></button><button type="button" class="btn ck-no"></button></div>';
    function textos(){var t=l();d.querySelector('p').textContent=t.txt;d.querySelector('.ck-si').textContent=t.si;d.querySelector('.ck-no').textContent=t.no}
    textos();new MutationObserver(textos).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    d.querySelector('.ck-si').onclick=function(){guardar('si');d.remove();cargarGA()};
    d.querySelector('.ck-no').onclick=function(){guardar('no');d.remove()};
    document.body.appendChild(d);
  }
  var eleccion=leer();
  if(eleccion==='si')cargarGA();
  else if(eleccion!=='no')setTimeout(function(){(window.requestIdleCallback||setTimeout)(aviso)},1500);   // el aviso aparece después de cargar, sin frenar la página

  // Nombre para GA: sin tildes ni espacios (Descargar catálogo -> descargar_catalogo)
  function nombreGA(n){return n.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,'_')}
  function track(nombre,datos){
    try{if(window.umami)window.umami.track(nombre,datos)}catch(e){}
    try{if(window.gtag)gtag('event',nombreGA(nombre),datos||{})}catch(e){}
  }
  window.registrarEvento=track;   // para trabaja.js y otros
  function archivo(h){return (/([^\/?#]+)\.pdf(?:$|[?#])/i.exec(h)||[])[1]||h}
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('a[href],[data-pdf]');if(!b)return;
    if(b.dataset.pdf){track('Ver catálogo',{catalogo:archivo(b.dataset.pdf)});return}
    var h=b.getAttribute('href');
    if(/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(h))track('WhatsApp');
    else if(/^tel:/.test(h))track('Llamar',{numero:h.slice(4)});
    else if(/^mailto:/.test(h))track('Correo',{correo:h.slice(7).split('?')[0]});
    else if(/\.pdf(?:$|[?#])/i.test(h))track('Descargar catálogo',{catalogo:archivo(h)});
    else if(/#catalogo-/.test(h))track('Ver catálogo',{catalogo:h.split('#catalogo-')[1]});
  },true);
})();
