/* Responsabilidad social: carrusel por años (de 2021 en adelante). La foto del año activo llena el fondo,
   a la derecha van las tarjetas de los demás años y avanza solo cada 7 s (se detiene al pasar el mouse,
   al tocar, fuera de pantalla o con "reducir movimiento"). Sin JS se ve como lista. */
(function(){
  var sec=document.getElementById('social');if(!sec)return;
  var its=[].slice.call(sec.querySelectorAll('.soc-it')),cards=sec.querySelector('.soc-cards'),
      bar=sec.querySelector('.soc-bar i'),num=sec.querySelector('.soc-n'),bg=sec.querySelector('.soc-bg');
  var cur=0,T=7000,t0=0,raf=0,quieto=false,visible=false,
      reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  sec.classList.add('soc-js');
  // Fondo: una capa por año con su foto (la misma imagen que ya cargó el artículo)
  its.forEach(function(it,i){
    var img=it.querySelector('img'),l=document.createElement('div');l.className='soc-l';
    l.style.backgroundImage='url("'+(img.currentSrc||img.src)+'")';
    img.addEventListener('load',function(){l.style.backgroundImage='url("'+(img.currentSrc||img.src)+'")'});
    bg.appendChild(l);
    var c=document.createElement('button');c.type='button';c.className='soc-card';c.dataset.i=i;
    c.innerHTML='<img alt="" loading="lazy" decoding="async"><span><time></time><b></b></span>';
    c.querySelector('img').src=img.getAttribute('src');
    cards.appendChild(c);
    c.addEventListener('click',function(){ir(i)});
  });
  function textos(){its.forEach(function(it,i){var c=cards.children[i];c.querySelector('time').textContent=it.querySelector('time').textContent;c.querySelector('b').textContent=it.querySelector('h3').textContent;c.setAttribute('aria-label',it.querySelector('time').textContent+' · '+it.querySelector('h3').textContent)})}
  textos();new MutationObserver(textos).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  function pintar(){
    its.forEach(function(it,i){it.classList.toggle('on',i===cur)});
    [].forEach.call(bg.children,function(l,i){l.classList.toggle('on',i===cur)});
    // Las tarjetas muestran los años siguientes, en orden
    [].forEach.call(cards.children,function(c,i){var k=(i-cur+its.length)%its.length;c.style.order=k;c.classList.toggle('on',k===0);c.setAttribute('aria-current',k===0?'true':'false')});
    num.textContent=('0'+(cur+1)).slice(-2)+' / '+('0'+its.length).slice(-2);
    t0=performance.now();
  }
  function ir(i){cur=(i+its.length)%its.length;pintar()}
  sec.querySelectorAll('.soc-b').forEach(function(b){b.addEventListener('click',function(){ir(cur+(+b.dataset.d))})});
  function tick(now){
    raf=requestAnimationFrame(tick);
    if(quieto||!visible||reduce){t0=now-(parseFloat(bar.style.width)||0)/100*T;return}
    var p=Math.min(1,(now-t0)/T);bar.style.width=(p*100)+'%';
    if(p>=1)ir(cur+1);
  }
  sec.addEventListener('mouseenter',function(){quieto=true});sec.addEventListener('mouseleave',function(){quieto=false});
  sec.addEventListener('focusin',function(){quieto=true});sec.addEventListener('focusout',function(){quieto=false});
  new IntersectionObserver(function(e){visible=e[0].isIntersecting}).observe(sec);
  if(reduce)bar.parentNode.hidden=true;
  pintar();raf=requestAnimationFrame(tick);
})();
