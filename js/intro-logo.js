/* Intro de la portada: una chispa de soldadura recorre el logo, lo deja al rojo vivo, se enfría a blanco y desaparece.
   La página se ve detrás todo el tiempo (velo oscuro suave).
   Sale una vez por visita (clave joce-intro en sessionStorage: vuelve al abrir la web otro día o en otra pestaña,
   no al recargar ni al regresar a la portada). No sale con enlaces directos (#...) ni con "reducir movimiento".
   Con ?intro en la dirección sale siempre (para mostrarla). Cualquier toque, tecla o rueda la salta. Estilos: .intro en css/portada.css. */
(function () {
  var LOGO = '/img/logo-joce.svg';
  var LENTO = 2.5; /* factor de tiempo: el usuario eligió la versión en cámara lenta (~7 s en total) */
  var CLAVE = 'joce-intro';
  var reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var forzar = /[?&]intro\b/.test(location.search);
  if (reducir || !document.body.animate) return;
  if (!forzar) {
    try { if (sessionStorage.getItem(CLAVE)) return; } catch (e) {}
    if (location.hash) return;
  }
  try { sessionStorage.setItem(CLAVE, '1'); } catch (e) {}

  /* ---- piezas ---- */
  var raiz = document.createElement('div');
  raiz.className = 'intro';
  raiz.setAttribute('aria-hidden', 'true');
  raiz.innerHTML =
    '<div class="intro-velo"></div>' +
    '<div class="intro-logo">' +
      '<img class="intro-base" src="' + LOGO + '" alt="">' +
      '<div class="intro-calor"><div class="intro-metal"></div></div>' +
      '<div class="intro-brillo"></div>' +
    '</div>' +
    '<canvas class="intro-chispas"></canvas>';
  raiz.style.setProperty('--logo', 'url("' + LOGO + '")');
  document.body.appendChild(raiz);

  var velo = raiz.querySelector('.intro-velo'), logo = raiz.querySelector('.intro-logo'),
      calor = raiz.querySelector('.intro-calor'), metal = raiz.querySelector('.intro-metal'),
      brillo = raiz.querySelector('.intro-brillo'), lienzo = raiz.querySelector('canvas'),
      ctx = lienzo.getContext('2d'), animaciones = [], chispas = [], arco = null, W = 0, H = 0, t0 = 0, idRaf = 0, fin = false;

  function medir() {
    var d = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    lienzo.width = W * d; lienzo.height = H * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  /* animación con el factor de cámara lenta aplicado */
  function animar(el, cuadros, dur, espera, curva) {
    var a = el.animate(cuadros, { duration: dur * LENTO, delay: (espera || 0) * LENTO, easing: curva || 'ease', fill: 'both' });
    animaciones.push(a);
    return a;
  }

  function soltarChispas(x, y, n) {
    for (var i = 0; i < n; i++) {
      var ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, vel = 180 + Math.random() * 420, vida = 0.35 + Math.random() * 0.45;
      chispas.push({ x: x, y: y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel, vida: vida, max: vida, tono: 25 + Math.random() * 25 });
    }
  }

  /* ---- guion (tiempos en ms a velocidad normal; se multiplican por LENTO) ---- */
  var SOLDAR = [250, 1350], ENFRIAR = 1350, BRILLO = 1900, SALIDA = 2450, TOTAL = 2900;

  animar(velo, [{ opacity: 0 }, { opacity: 1 }], 250);
  animar(logo, [{ opacity: 0 }, { opacity: 1 }], 250);
  animar(metal, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], SOLDAR[1] - SOLDAR[0], SOLDAR[0], 'cubic-bezier(.45,.1,.55,.9)');
  animar(metal, [{ backgroundColor: '#ffd27a' }, { backgroundColor: '#ff9a3c', offset: 0.3 }, { backgroundColor: '#ffffff' }], 700, ENFRIAR);
  animar(calor, [{ filter: 'drop-shadow(0 0 6px #ff9a2e) drop-shadow(0 0 18px #ff6a00)' }, { filter: 'drop-shadow(0 0 0 transparent) drop-shadow(0 0 0 transparent)' }], 700, ENFRIAR);
  animar(brillo, [{ opacity: 1, backgroundPosition: '-150% 0' }, { opacity: 1, backgroundPosition: '150% 0' }], 550, BRILLO);
  animar(logo, [{ opacity: 1, transform: 'none', filter: 'blur(0)' }, { opacity: 0, transform: 'scale(1.06)', filter: 'blur(5px)' }], 400, SALIDA, 'ease-in');
  animar(velo, [{ opacity: 1 }, { opacity: 0 }], 450, SALIDA);

  /* ---- cada cuadro: la chispa va justo en el borde del metal que se va revelando ---- */
  function cuadro(ahora) {
    if (fin) return;
    if (!t0) t0 = ahora;
    var t = (ahora - t0) / LENTO, dt = Math.min(0.05, (ahora - (cuadro.prev || ahora)) / 1000 / LENTO);
    cuadro.prev = ahora;

    arco = null;
    if (t >= SOLDAR[0] && t <= SOLDAR[1]) {
      var r = logo.getBoundingClientRect(),
          m = /inset\(\S+ ([\d.]+)%/.exec(getComputedStyle(metal).clipPath),
          avance = m ? 1 - m[1] / 100 : 0,
          p = (t - SOLDAR[0]) / (SOLDAR[1] - SOLDAR[0]);
      arco = { x: r.left + r.width * avance, y: r.top + r.height * (0.5 + 0.32 * Math.sin(p * 60)) };
      soltarChispas(arco.x, arco.y, 9);
    }

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 1.6;
    chispas = chispas.filter(function (c) {
      c.vida -= dt;
      if (c.vida <= 0) return false;
      c.vy += 900 * dt; c.x += c.vx * dt; c.y += c.vy * dt;
      var k = c.vida / c.max;
      ctx.strokeStyle = 'hsla(' + c.tono + ',100%,' + (55 + 35 * k) + '%,' + k + ')';
      ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x - c.vx * 0.025, c.y - c.vy * 0.025); ctx.stroke();
      return true;
    });
    if (arco) {
      var radio = 26 + Math.random() * 16, g = ctx.createRadialGradient(arco.x, arco.y, 0, arco.x, arco.y, radio);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,220,150,.9)'); g.addColorStop(1, 'rgba(255,120,20,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(arco.x, arco.y, radio, 0, 7); ctx.fill();
    }

    if (t < TOTAL || chispas.length) idRaf = requestAnimationFrame(cuadro);
    else terminar();
  }

  function terminar() {
    if (fin) return;
    fin = true;
    cancelAnimationFrame(idRaf);
    removeEventListener('resize', medir);
    QUITAR.forEach(function (ev) { removeEventListener(ev, saltar, true); });
    raiz.remove();
  }

  /* saltar: se desvanece rápido y deja la página lista (el gesto sigue su curso, p. ej. el desplazamiento) */
  function saltar() {
    if (fin) return;
    QUITAR.forEach(function (ev) { removeEventListener(ev, saltar, true); });
    raiz.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }).onfinish = terminar;
  }
  var QUITAR = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
  QUITAR.forEach(function (ev) { addEventListener(ev, saltar, { capture: true, passive: true }); });

  medir();
  addEventListener('resize', medir);
  idRaf = requestAnimationFrame(cuadro);
})();
