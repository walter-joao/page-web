// CloudFront Function (runtime cloudfront-js-2.0), evento "Solicitud del visor".
// Hace lo que hacía vercel.json: URLs sin .html y las redirecciones de proyectos.
var REDIR = {
  '/proyectos/proyecto-funival': '/#proyectos',
  '/proyectos/funvivalt-monserrat': '/#proyectos'
};
function handler(event) {
  var req = event.request;
  var uri = req.uri;
  var dest = REDIR[uri.replace(/\/$/, '')];
  if (dest) {
    return { statusCode: 302, statusDescription: 'Found', headers: { location: { value: dest } } };
  }
  if (uri.endsWith('/')) {
    req.uri = uri + 'index.html';
  } else if (uri.lastIndexOf('.') <= uri.lastIndexOf('/')) {
    req.uri = uri + '.html';           // /productos/encofrados -> /productos/encofrados.html
  }
  return req;
}
