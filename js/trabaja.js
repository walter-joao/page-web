/* Trabaja con nosotros: valida y envía el formulario (con la hoja de vida) al endpoint de data-endpoint */
(function(){
  var f=document.getElementById('jobform');if(!f)return;
  var msg=document.getElementById('jobmsg'),btn=document.getElementById('jobsend'),drop=document.getElementById('jobdrop'),fileL=document.getElementById('jobfile'),cv=f.elements.cv;
  var MAX=5*1024*1024,OK=/\.(pdf|docx?)$/i;
  var T={es:{req:'Complete los campos marcados.',mail:'Revise el correo electrónico.',cv:'Adjunte su hoja de vida en PDF o Word.',big:'El archivo pesa más de 5 MB.',chk:'Debe aceptar el tratamiento de datos.',sending:'Enviando…',ok:'¡Gracias! Recibimos su postulación. Le contactaremos si su perfil encaja.',fail:'No se pudo enviar. Intente de nuevo o escriba por WhatsApp.',demo:'Por ahora envíe su hoja de vida a talentohumano@jocecia.com',pick:'Elegir archivo',captcha:'No pudimos comprobar que es una persona. Espere unos segundos e intente de nuevo.'},
         en:{req:'Please fill in the highlighted fields.',mail:'Please check your email address.',cv:'Attach your résumé as PDF or Word.',big:'The file is larger than 5 MB.',chk:'Please accept the data processing terms.',sending:'Sending…',ok:'Thank you! We received your application and will contact you if your profile is a fit.',fail:'Could not send. Please try again or message us on WhatsApp.',demo:'For now, please send your résumé to talentohumano@jocecia.com',pick:'Choose file',captcha:'We could not verify that you are human. Please wait a few seconds and try again.'},
         zh:{req:'请填写标出的字段。',mail:'请检查电子邮箱地址。',cv:'请以 PDF 或 Word 格式附上简历。',big:'文件超过 5 MB。',chk:'请同意个人数据处理条款。',sending:'正在发送…',ok:'谢谢！我们已收到您的申请，如您的背景合适，我们会与您联系。',fail:'发送失败。请重试或通过 WhatsApp 联系我们。',demo:'目前请将简历发送至 talentohumano@jocecia.com',pick:'选择文件',captcha:'无法验证您是真人。请稍等几秒后重试。'}};
  function t(k){var l=(document.documentElement.lang||'es').slice(0,2);return (T[l]||T.es)[k]}
  var last=null;
  // Captcha invisible Cloudflare Turnstile. La site key (pública) sale de datos/sitio.json -> data-turnstile.
  // El script de Cloudflare se carga solo cuando el formulario se acerca a la pantalla, para no frenar la página.
  // Turnstile agrega dentro del formulario un campo oculto cf-turnstile-response, que viaja en el FormData.
  var KEY=f.dataset.turnstile,cap=document.getElementById('jobcaptcha'),wid=null;
  function capLoad(){
    if(!KEY||!cap||window.__tsLoad)return;window.__tsLoad=1;
    window.__tsListo=function(){wid=turnstile.render(cap,{sitekey:KEY,language:(document.documentElement.lang||'es').slice(0,2),'refresh-expired':'auto',appearance:'interaction-only'})};
    var s=document.createElement('script');s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__tsListo';s.async=true;s.defer=true;document.head.appendChild(s);
  }
  if(KEY){
    if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting})){io.disconnect();capLoad()}},{rootMargin:'600px'});io.observe(f)}else capLoad();
    f.addEventListener('focusin',capLoad);
  }
  function capToken(){return KEY&&window.turnstile&&wid!==null?turnstile.getResponse(wid):''}
  function say(k,cls){last=k;msg.textContent=t(k);msg.className='job-msg'+(cls?' '+cls:'')}
  function showFile(){var x=cv.files&&cv.files[0];drop.classList.toggle('has',!!x);fileL.textContent=x?x.name:t('pick');drop.classList.remove('bad')}
  cv.addEventListener('change',showFile);
  ['dragenter','dragover'].forEach(function(e){drop.addEventListener(e,function(ev){ev.preventDefault();drop.classList.add('over')})});
  ['dragleave','drop'].forEach(function(e){drop.addEventListener(e,function(ev){ev.preventDefault();drop.classList.remove('over')})});
  drop.addEventListener('drop',function(ev){if(ev.dataTransfer&&ev.dataTransfer.files.length){cv.files=ev.dataTransfer.files;showFile()}});
  f.addEventListener('input',function(e){if(e.target.classList)e.target.classList.remove('bad')});
  function check(){
    var first=null,why='req';
    ['nombre','telefono','correo','area'].forEach(function(n){var el=f.elements[n];var bad=!el.value.trim();if(n==='correo'&&!bad&&!el.checkValidity()){bad=true;if(!first)why='mail'}el.classList.toggle('bad',bad);if(bad&&!first)first=el});
    var x=cv.files&&cv.files[0];
    if(!first&&(!x||!OK.test(x.name))){drop.classList.add('bad');first=cv;why='cv'}
    else if(!first&&x.size>MAX){drop.classList.add('bad');first=cv;why='big'}
    if(!first&&!f.elements.acepto.checked){first=f.elements.acepto;why='chk'}
    if(first){say(why,'err');first.focus();return false}
    return true;
  }
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(!check())return;
    var url=f.dataset.endpoint;
    if(!url){say('demo');return}
    if(KEY&&!capToken()){capLoad();say('captcha','err');return}
    btn.setAttribute('aria-busy','true');say('sending');
    var fd=new FormData(f);fd.append('idioma',document.documentElement.lang);
    fetch(url,{method:'POST',body:fd}).then(function(r){return r.json().catch(function(){return {}}).then(function(j){if(!r.ok||!j.ok)throw (j.error||0)})})
      .then(function(){try{if(window.registrarEvento)registrarEvento('Postulación enviada',{area:fd.get('area')});else if(window.umami)umami.track('Postulación enviada',{area:fd.get('area')})}catch(e){}f.reset();showFile();say('ok','ok')})
      .catch(function(e){say(e==='captcha'?'captcha':'fail','err')})
      .then(function(){btn.removeAttribute('aria-busy');if(window.turnstile&&wid!==null)turnstile.reset(wid)});  // cada pase del captcha sirve una sola vez
  });
  // Al cambiar de idioma, el nombre del archivo y el último mensaje (error, enviando, etc.) se traducen también
  new MutationObserver(function(){showFile();if(last)msg.textContent=t(last)}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
