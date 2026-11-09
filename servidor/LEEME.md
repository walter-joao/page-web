# Formulario "Trabaja con nosotros"

La web es estática (Vercel hoy, S3 + CloudFront después), así que el envío del
formulario lo hace `postular.php`, que vive en el cPanel de Jocecia y manda el
correo con el servidor de correo de la propia empresa. Los CV no pasan por
ningún servicio externo.

## Cómo activarlo

1. En `postular.php`, cambiar `DESTINO` por el correo que recibirá las postulaciones
   (por ejemplo talentohumano@jocecia.com) y revisar la lista `ORIGENES`.
2. En cPanel, crear la cuenta `no-reply@jocecia.com` (o cambiar `REMITENTE` por una que exista).
3. Subir `postular.php` a `public_html/` con el Administrador de archivos.
4. En `index.html`, poner la URL en el formulario:
   `<form ... id="jobform" data-endpoint="https://jocecia.com/postular.php">`
5. Enviar una postulación de prueba y revisar que llegue (y que no caiga en spam).

Mientras `data-endpoint` esté vacío, el formulario valida todo pero muestra un
aviso de "vista previa" en vez de enviar.

Esta carpeta no se publica en Vercel (ver `.vercelignore`).
