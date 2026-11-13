"""Construye la versión estática de la web para S3/CloudFront (sin el optimizador de Vercel).
Uso: python herramientas/build_estatico.py . _site
- Copia el repo (sin .git, servidor, herramientas, vercel.json).
- Genera las fotos de img/wp e img/obras en WebP 256-1920 px dentro de _img/.
- Reemplaza las URLs /_vercel/image por esas WebP (HTML, /js/*.js y funciones JS VI/vimg).
"""
import os,re,shutil,sys,urllib.parse
from PIL import Image,ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES=True
SRC=sys.argv[1]; OUT=sys.argv[2]
SIZES=[256,384,640,1080,1920]
if os.path.exists(OUT): shutil.rmtree(OUT)
shutil.copytree(SRC,OUT,ignore=shutil.ignore_patterns('.git','.github','.claude','servidor','datos','vercel.json','.vercelignore','herramientas','_site'))
def slug(p):
  p=p.strip('/'); p=p[7:] if p.startswith('img/wp/') else p[4:]  # img/wp/2021/08/x.jpg -> 2021-08-x ; img/obras/x.webp -> obras-x
  return p.replace('/','-').rsplit('.',1)[0]
made=0
for root,_,fs in [w for d in ('img/wp','img/obras') for w in os.walk(os.path.join(SRC,d))]:
  for f in fs:
    p=os.path.join(root,f); rel='/'+os.path.relpath(p,SRC)
    try: im=Image.open(p); im.load()
    except Exception as e: print('skip',rel,e); continue
    if im.mode not in('RGB','RGBA'): im=im.convert('RGBA' if 'A' in im.getbands() or im.mode=='P' else 'RGB')
    os.makedirs(os.path.join(OUT,'_img'),exist_ok=True)
    for w in SIZES:
      o=os.path.join(OUT,'_img',f'{slug(rel)}-{w}.webp')
      im2=im if im.width<=w else im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
      im2.save(o,'WEBP',quality=72,method=6); made+=1
print('variants',made)
pat=re.compile(r'/_vercel/image\?url=([^&"\s]+)&(?:amp;)*w=(\d+)(?:&(?:amp;)*q=\d+)?')
def rep(m):
  u=urllib.parse.unquote(m.group(1)); w=int(m.group(2)); w=min([s for s in SIZES if s>=w] or [1920])
  if u.startswith(('/img/wp/','/img/obras/')): return f'/_img/{slug(u)}-{w}.webp'
  return u
JS_OLD="function VI(u,w){return /^(https:\\/\\/jocecia\\.com\\/portal\\/|\\/img\\/(wp|obras)\\/)/.test(u)?'/_vercel/image?url='+encodeURIComponent(u)+'&w='+(w||1080)+'&q=75':u}"
JS_NEW="function VI(u,w){if(!/^\\/img\\/(wp|obras)\\//.test(u))return u;w=w||1080;var s=[256,384,640,1080,1920].filter(function(x){return x>=w})[0]||1920;return '/_img/'+u.slice(/^\\/img\\/wp\\//.test(u)?8:5).replace(/\\//g,'-').replace(/\\.[^.]+$/,'')+'-'+s+'.webp'}"
VIMG_OLD="function vimg(u,w){return '/_vercel/image?url='+encodeURIComponent(u)+'&w='+(w||640)+'&q=75'}"
VIMG_NEW="function vimg(u,w){return VI2(u,w||640)}function VI2(u,w){if(!/^\\/img\\/(wp|obras)\\//.test(u))return u;var s=[256,384,640,1080,1920].filter(function(x){return x>=w})[0]||1920;return '/_img/'+u.slice(/^\\/img\\/wp\\//.test(u)?8:5).replace(/\\//g,'-').replace(/\\.[^.]+$/,'')+'-'+s+'.webp'}"
n=0
for root,_,fs in os.walk(OUT):
  for f in fs:
    if not f.endswith(('.html','.js')): continue
    p=os.path.join(root,f); s=open(p,encoding='utf-8').read(); o=s
    s=pat.sub(rep,s); s=s.replace(JS_OLD,JS_NEW).replace(VIMG_OLD,VIMG_NEW)
    if '_vercel/image' in s: print('LEFT',p)
    if s!=o: open(p,'w',encoding='utf-8').write(s); n+=1
print('html/js changed',n)
