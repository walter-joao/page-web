/* JS de las páginas interiores (fichas de productos, proyectos y Trabaja con nosotros).
   1) Tema claro/oscuro: botón #theme, se guarda en localStorage 'joce-theme'.
   2) Idiomas es/en/zh: cada texto traducible lleva data-en y data-zh; el título y la descripción, data-title-en/zh y data-desc-en/zh en <html>.
      CN = nombres de descarga de los catálogos PDF por idioma. Se comparte localStorage 'joce-lang' con la portada. */
(function(){var r=document.documentElement;try{var t=localStorage.getItem('joce-theme');if(t)r.dataset.theme=t}catch(e){}
var top=document.getElementById('top');function s(){top.classList.add('solid')}s();
document.getElementById('theme').addEventListener('click',function(){var d=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;r.dataset.theme=d?'light':'dark';try{localStorage.setItem('joce-theme',r.dataset.theme)}catch(e){}});})();
(function(){
var CN={"alcantarillas": ["CATALOGO-ALCANTARILLAS-METALICAS", "CATALOG-METAL-CULVERTS", "金属涵管目录"], "postes": ["CATALOGO-POSTES-METALICOS", "CATALOG-STEEL-POLES", "金属电线杆目录"], "grating-tramex": ["CATALOGO-GRATING-Y-TRAMEX", "CATALOG-GRATING", "钢格板目录"], "pernos-bronce-silicio": ["CATALOGO-PERNOS-BRONCE-SILICIO", "CATALOG-SILICON-BRONZE-BOLTS", "硅青铜螺栓目录"], "resina-de-anclaje": ["CATALOGO-RESINA-DE-ANCLAJE", "CATALOG-ANCHORING-RESIN", "岩石锚固树脂药卷目录"], "accesorios-para-tuberia": ["CATALOGO-ACCESORIOS-PARA-TUBERIA", "CATALOG-PIPE-FITTINGS", "管道配件目录"]};
var R=document.documentElement,K='joce-lang',T=document.title,M=document.querySelector('meta[name="description"]'),D=M&&M.content,L=['es','en','zh'];
function set(l){
  document.querySelectorAll('[data-en]').forEach(function(e){if(e.dataset.es==null)e.dataset.es=e.innerHTML;e.innerHTML=l==='es'?e.dataset.es:l==='zh'&&e.dataset.zh!=null?e.dataset.zh:e.dataset.en});
  R.lang=l==='zh'?'zh-CN':l;var d=R.dataset,tt=l==='zh'?d.titleZh||d.titleEn:l==='en'?d.titleEn:0,dd=l==='zh'?d.descZh||d.descEn:l==='en'?d.descEn:0;
  document.title=tt||T;if(M)M.content=dd||D;
  L.forEach(function(x){var b=document.getElementById('lang-'+x);if(b)b.setAttribute('aria-pressed',l===x)});
  document.querySelectorAll('a[href^="/catalogos/"]').forEach(function(e){var h=e.getAttribute('href').replace(/\/catalogos\/(en|zh)\//,'/catalogos/');e.setAttribute('href',l!=='es'?h.replace('/catalogos/','/catalogos/'+l+'/'):h);var n=CN[(/([a-z0-9-]+)\.pdf$/.exec(h)||[])[1]];if(n&&e.hasAttribute('download'))e.setAttribute('download',n[L.indexOf(l)]+'-JOCECIA.pdf')});
  try{localStorage.setItem(K,l)}catch(e){}}
L.forEach(function(x){var b=document.getElementById('lang-'+x);if(b)b.addEventListener('click',function(){set(x)})});
try{var s=localStorage.getItem(K);if(s==='en'||s==='zh')set(s)}catch(e){}
})();
