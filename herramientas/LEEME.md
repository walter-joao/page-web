# Cómo está armada la web y cómo cambiarla

La web es estática (HTML, CSS y JS, sin servidor). Cada push a `main` publica en Vercel y en AWS (S3 + CloudFront, ver `.github/workflows/deploy-aws.yml`).

## Mapa de archivos

| Qué | Dónde | ¿Se edita a mano? |
| --- | --- | --- |
| Datos del cliente: dominio, teléfono, correo, WhatsApp, menú, Umami | `datos/sitio.json` | Sí |
| Cada ficha de producto | `datos/productos/<slug>.json` | Sí |
| Cada proyecto | `datos/proyectos/<slug>.json` | Sí |
| Páginas sueltas (Trabaja con nosotros) | `datos/paginas/<slug>.json` + `herramientas/plantillas/contenido/<slug>.html` | Sí |
| Plantillas (diseño de las páginas interiores) | `herramientas/plantillas/` (`base.html` = cabecera, pie y `<head>`; `producto.html`, `proyecto.html`, `pagina.html`) | Solo para cambiar el diseño |
| Páginas generadas | `productos/*.html`, `proyectos/*.html`, `trabaja-con-nosotros.html`, `sitemap.xml` | **No**: se generan |
| Estilos | `css/comun.css` (todas las páginas), `css/paginas.css` (páginas interiores), `css/proyectos.css`, `css/portada-mapa.css` y `css/portada.css` (portada) | Sí |
| JS | `js/paginas.js` (tema e idiomas de las páginas interiores), `js/trabaja.js`, `js/portada.js`, `js/portada-efectos.js`, `js/recorrido-3d.js` | Sí |
| Portada | `index.html` + `css/portada*.css` + `js/portada*.js` | Sí, a mano (ver abajo) |
| Chino de la portada | `i18n/zh.json` (inglés → chino) | Sí |

## El único comando

```
python3 herramientas/generar_paginas.py            # vuelve a escribir las páginas interiores y el sitemap
python3 herramientas/generar_paginas.py --revisar  # no escribe; dice qué cambiaría (debe decir 0 antes de subir)
python3 herramientas/generar_paginas.py --revisar --diff   # además muestra las líneas
```

Necesita Python 3 con `jinja2` y `beautifulsoup4` (`pip install jinja2 beautifulsoup4`).

Regla: **nunca editar a mano** `productos/*.html`, `proyectos/*.html` ni `trabaja-con-nosotros.html`. Se cambia el JSON (o la plantilla) y se vuelve a generar. Así un cambio llega a todas las páginas y nada se pierde al regenerar.

## Tareas comunes

**Cambiar un teléfono, correo, WhatsApp o el dominio.** Editar `datos/sitio.json` y generar. Eso cubre las 27 páginas interiores (pie, botones de WhatsApp, canonical, datos para Google). La portada guarda sus contactos en `index.html` (bloque `#contacto`, JSON-LD del `<head>` y enlaces `wa.me`) y en `js/portada.js` / `js/recorrido-3d.js` (enlaces `wa.me`): buscar el dato viejo en esos archivos y cambiarlo también.

**Corregir un texto de una ficha.** Abrir `datos/productos/<slug>.json`, cambiar el texto en los 3 idiomas (`es`, `en`, `zh`) y generar.

**Agregar un producto.** Copiar el JSON de un producto parecido con el nombre nuevo (ese nombre será la URL: `/productos/<nombre>`), cambiar textos y fotos, y generar. El sitemap se actualiza solo. Para que aparezca en la portada hay que enlazarlo en `index.html` (menú de productos) o en el recorrido (`js/recorrido-3d.js`).
- `fotos`: rutas como `/img/wp/...` o `/img/obras/...`. La plantilla arma el tamaño justo, el texto alternativo y la galería.
- `cuerpo`: bloques en orden. Tipos: `h2`, `h3`, `h4`, `p`, `ul`/`ol` (con `items`) y `figura` (`{"tipo":"figura","foto":"/img/..."}`).
- `relacionados`: slugs de otras fichas. El nombre y el grupo los toma de sus JSON.
- `catalogo`: opcional. Sin catálogo, no se ponen los botones del PDF.

**Agregar un proyecto.** Igual, en `datos/proyectos/`. `otras_obras` es la lista de proyectos que salen como tarjetas al final. `mapa` es el ancla de la obra en el mapa de la portada (`obra-<id>`). Para que salga en el mapa, agregarlo también en `js/portada.js`.

**Cambiar colores o letras.** Todas las variables (`--brand`, `--accent`, `--bg`, `--f-display`...) están al principio de `css/comun.css`: un bloque para el modo claro y dos para el oscuro. Única excepción: las páginas interiores usan un fondo oscuro `#070d17` en vez del `#05090f` de la portada (al inicio de `css/paginas.css`; diferencia heredada, unificar es decisión de diseño).

**Agregar un texto traducible a una plantilla.** El español va dentro de la etiqueta; inglés y chino en `data-en` y `data-zh`. `js/paginas.js` los cambia al tocar ES / EN / 中文.

## Antes de subir

1. `python3 herramientas/generar_paginas.py --revisar` debe decir `archivos con cambios: 0`.
2. Probar la versión AWS en local: `python3 herramientas/build_estatico.py . _site` y servir `_site`.
3. Pedir el OK y subir todo en un solo push (Vercel gratis limita los despliegues).

## Usar esta base para otro cliente

1. Copiar el repo sin `datos/productos`, `datos/proyectos`, `img/` ni `catalogos/`.
2. Cambiar `datos/sitio.json` (marca, contactos, menú, Umami).
3. Colores y letras en `css/comun.css`. La portada (`index.html`) es la parte a la medida de cada cliente.
4. Crear los JSON de productos/proyectos y generar.

## Historia

`herramientas/migracion/` guarda cómo se pasó de las páginas escritas a mano a datos + plantillas (noviembre 2026): `extraer_productos.py` y `extraer_proyectos.py` leyeron las páginas y escribieron `datos/`. `fuente-wp.json` es la exportación del WordPress original (fuente de los textos de las fichas).
