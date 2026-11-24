# Formulario "Trabaja con nosotros"

La web es estática (Vercel hoy, S3 + CloudFront después), así que el envío del
formulario lo hace `postular.php`, que vive en el cPanel de Jocecia y manda el
correo con el servidor de correo de la propia empresa. Los CV no pasan por
ningún servicio externo.

## Cómo activarlo

1. En `postular.php`, revisar `DESTINO` y `REMITENTE` (hoy ambos talentohumano@jocecia.com,
   una cuenta que ya existe en su servidor) y la lista `ORIGENES`.
2. (Sin paso: no hace falta crear cuentas nuevas.)
3. Subir `postular.php` a `public_html/` con el Administrador de archivos.
4. En `index.html`, poner la URL en el formulario:
   `<form ... id="jobform" data-endpoint="https://jocecia.com/postular.php">`
5. Enviar una postulación de prueba y revisar que llegue (y que no caiga en spam).

Mientras `data-endpoint` esté vacío, el formulario valida todo pero muestra un
aviso de "vista previa" en vez de enviar.

Esta carpeta no se publica en Vercel (ver `.vercelignore`).

## Redirecciones al lanzar en www

- `htaccess-raiz.txt` → contenido de `public_html/.htaccess` en el cPanel: todo jocecia.com (sin www)
  va a https://www.jocecia.com con 301, menos postular.php, .well-known, oilpower, correo y la
  verificación de Google.
- `htaccess-portal.txt` → se pega ARRIBA de `public_html/portal/.htaccess`: las páginas del
  WordPress viejo van a su página nueva (misma tabla que `herramientas/cloudfront-urls-limpias.js`,
  que hace lo mismo para quien entre por www).
