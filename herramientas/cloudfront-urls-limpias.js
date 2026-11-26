// CloudFront Function (runtime cloudfront-js-2.0), evento "Solicitud del visor".
// Hace lo que hacía vercel.json: URLs sin .html y las redirecciones de proyectos.
// También manda las direcciones de la web vieja (WordPress en /portal/) a su página nueva,
// con 301 para que Google pase el posicionamiento. La misma tabla está en
// servidor/htaccess-raiz.txt para quien entre por jocecia.com (sin www).
var REDIR = {
  '/proyectos/proyecto-funival': '/#proyectos',
  '/proyectos/funvivalt-monserrat': '/#proyectos'
};
var PORTAL = {
  '': '/',
  '/about': '/#nosotros',
  '/contact': '/#contacto',
  '/productos-postes': '/productos/postes-metalicos',
  '/venta-de-maquinaria': '/productos/venta-de-soldadoras',
  '/pernos-bronce-silicio': '/productos/pernos-bronce-silicio',
  '/pernos-a-la-forja': '/productos/pernos-a-la-forja',
  '/fabricacion-de-partes-y-piezas': '/productos/partes-y-piezas-especiales',
  '/encofrados': '/productos/encofrados',
  '/grating-2': '/productos/grating-tramex',
  '/accesorios-para-tuberias': '/productos/accesorios-para-tuberias',
  '/perno-de-barra-helicoidal': '/productos/pernos-de-barra-helicoidal',
  '/pernos-rocas': '/productos/soporte-en-roca',
  '/alcantarilla-tmc-minimultiplate-sp-mp-68': '/productos/alcantarilla-mp-68',
  '/alcantarilla-multiplate-sp-mp-152-mp-152-s': '/productos/alcantarilla-mp-152',
  '/resina-de-anclaje': '/productos/resina-de-anclaje',
  '/productos-infraestructura-metalica': '/productos/infraestructura-metalica',
  '/productos-alcantarillas-metalicas': '/productos/alcantarillas-metalicas',
  '/productos/productos-pernos': '/productos/pernos-de-alta-fiabilidad',
  '/project/central-hidroelectirca-san-francisco': '/proyectos/central-san-francisco',
  '/project/central-hidroelectrica-manduriacu': '/proyectos/central-manduriacu',
  '/project/galpon-industrial-cadeco': '/proyectos/galpon-cadeco',
  '/project/hidroelectrica-agoyan': '/proyectos/central-agoyan',
  '/project/metro-de-quito': '/proyectos/metro-de-quito',
  '/project/proyecto-residencial-funival': '/#proyectos',
  '/portfolio-category/destacados': '/#proyectos'
};
function mover(dest, code) {
  return { statusCode: code, statusDescription: code === 301 ? 'Moved Permanently' : 'Found',
           headers: { location: { value: dest } } };
}
function handler(event) {
  var req = event.request;
  var uri = req.uri;
  // La dirección técnica de CloudFront no debe aparecer en Google como copia: salta a www
  var host = req.headers.host ? req.headers.host.value : '';
  if (host.indexOf('.cloudfront.net') > 0) {
    var qs = Object.keys(req.querystring).map(function (k) {
      var v = req.querystring[k];
      return v.value ? k + '=' + v.value : k;
    }).join('&');
    return mover('https://www.jocecia.com' + uri + (qs ? '?' + qs : ''), 301);
  }
  var sin = uri.replace(/\/+$/, '');
  if (sin === '/portal' || sin.indexOf('/portal/') === 0) {
    var resto = sin.slice(7);
    if (resto.indexOf('/wp-content/uploads/') === 0) return mover('/img/wp/' + resto.slice(20), 301);
    return mover(PORTAL[resto] || '/', 301);   // cualquier otra página vieja va a la portada
  }
  // una sola dirección por página (Google marcaba /index.html como copia de la portada):
  // /x.html -> /x y /carpeta/index.html -> /carpeta/
  if (/\.html$/.test(uri) && uri !== '/404.html') return mover(uri.replace(/(index)?\.html$/, ''), 301);
  // la carpeta de catálogos no tiene página propia: a la sección de productos
  if (sin === '/catalogos' || sin === '/catalogos/en' || sin === '/catalogos/zh') return mover('/#productos', 301);
  var dest = REDIR[sin];
  if (dest) return mover(dest, 302);
  if (uri.endsWith('/')) {
    req.uri = uri + 'index.html';
  } else if (uri.lastIndexOf('.') <= uri.lastIndexOf('/')) {
    req.uri = uri + '.html';           // /productos/encofrados -> /productos/encofrados.html
  }
  return req;
}
