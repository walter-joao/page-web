# Formulario "Trabaja con nosotros"

La web es estática (S3 + CloudFront), así que el envío del
formulario lo hace `postular.php`, que vive en el cPanel de Jocecia y manda el
correo con el servidor de correo de la propia empresa. Los CV no pasan por
ningún servicio externo.

## Cómo activarlo

1. En `postular.php`, revisar `DESTINO` y `REMITENTE` (hoy ambos talentohumano@jocecia.com,
   una cuenta que ya existe en su servidor) y la lista `ORIGENES`.
2. (Sin paso: no hace falta crear cuentas nuevas.)
3. Subir `postular.php` a `public_html/` con el Administrador de archivos.
4. (Ya hecho) El formulario de `herramientas/plantillas/contenido/trabaja-con-nosotros.html` apunta a
   `https://jocecia.com/postular.php` (`data-endpoint`).
5. Enviar una postulación de prueba y revisar que llegue (y que no caiga en spam).

Mientras `data-endpoint` esté vacío, el formulario valida todo pero muestra un
aviso de "vista previa" en vez de enviar.

Esta carpeta no se publica en Vercel (ver `.vercelignore`).

## Captcha invisible (Cloudflare Turnstile)

Frena a los robots que mandan formularios basura. Es gratis y no necesita que el dominio esté en Cloudflare.

1. Crear el sitio en https://dash.cloudflare.com → Turnstile → *Add widget*. Dominios: `www.jocecia.com`
   y `jocecia.com`. Modo: *Managed*. `js/trabaja.js` lo dibuja con `appearance: 'interaction-only'`, así que no se ve nada
   salvo que Cloudflare dude y pida un clic. (El modo *Invisible* obliga a citar el Turnstile Privacy
   Addendum de Cloudflare en una política de privacidad, que la web no tiene.)
   Widget creado el 2026-11-27 en la cuenta Cloudflare del desarrollador, nombre "Jocecia".
2. Cloudflare entrega dos claves:
   - **Site key (pública)** → va en `datos/sitio.json`, campo `turnstile_site_key`. Luego
     `python3 herramientas/generar_paginas.py` y subir a main.
   - **Secret key (secreta)** → NUNCA en el repo (es público). En el cPanel, crear el archivo
     `turnstile-secreto.php` en la carpeta de la cuenta, **un nivel arriba de `public_html`**
     (junto a `public_html`, no dentro), con una sola línea:
     `<?php return 'AQUÍ-LA-CLAVE-SECRETA';`
3. Mientras ese archivo no exista, `postular.php` no pide captcha (así se puede subir el PHP antes que la
   web). Apenas existe, toda postulación sin captcha válido recibe el error `captcha`.
4. Orden recomendado: primero publicar la web con la site key, después crear el archivo secreto.

`postular.php` además rechaza envíos sin cabecera `Origin` o desde otras webs (solo www.jocecia.com y
jocecia.com).

## Redirecciones al lanzar en www

- `htaccess-raiz.txt` → contenido de `public_html/.htaccess` en el cPanel: todo jocecia.com (sin www)
  va a https://www.jocecia.com con 301, menos postular.php, .well-known, oilpower, correo y la
  verificación de Google.
- `htaccess-portal.txt` → se pega ARRIBA de `public_html/portal/.htaccess`: las páginas del
  WordPress viejo van a su página nueva (misma tabla que `herramientas/cloudfront-urls-limpias.js`,
  que hace lo mismo para quien entre por www).
