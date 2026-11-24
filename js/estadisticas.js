/* Estadísticas (Umami): cuenta los clics que son contactos o interés real, además de las visitas.
   Eventos: WhatsApp, Llamar, Correo, Descargar catálogo, Ver catálogo. "Postulación enviada" se
   registra en trabaja.js. Si Umami no cargó (bloqueador, vista local), no hace nada. */
(function(){
  function track(nombre,datos){try{if(window.umami)window.umami.track(nombre,datos)}catch(e){}}
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
