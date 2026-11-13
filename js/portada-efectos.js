/* Muestra de estilo: luz que sigue al cursor en las tarjetas y texto que se ilumina con el scroll */
(function(){
  if(matchMedia('(hover:hover)').matches){document.querySelectorAll('.fx-dark .tile').forEach(function(t){t.addEventListener('pointermove',function(e){var r=t.getBoundingClientRect();t.style.setProperty('--mx',(e.clientX-r.left)+'px');t.style.setProperty('--my',(e.clientY-r.top)+'px')})})}
  var lit=[].slice.call(document.querySelectorAll('.lit'));if(!lit.length)return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){lit.forEach(function(el){el.style.setProperty('--p','100%')});return}
  var q=false;function upd(){q=false;var h=innerHeight;lit.forEach(function(el){var r=el.getBoundingClientRect();var v=(h*.9-r.top)/(h*.55);v=Math.max(0,Math.min(1,v));el.style.setProperty('--p',(v*106-6).toFixed(1)+'%')})}
  addEventListener('scroll',function(){if(!q){q=true;requestAnimationFrame(upd)}},{passive:true});addEventListener('resize',upd);upd();
})();
