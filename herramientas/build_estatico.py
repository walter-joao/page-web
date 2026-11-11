"""Construye la versión estática de la web para S3/CloudFront (sin el optimizador de Vercel).
Uso: python herramientas/build_estatico.py . _site
- Copia el repo (sin .git, servidor, herramientas, vercel.json).
- Genera las fotos de img/wp en WebP 256-1920 px dentro de _img/.
- Reemplaza las URLs /_vercel/image por esas WebP (HTML y funciones JS VI/vimg).
"""
import os,re,shutil,sys,urllib.parse
from PIL import Image,ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES=True
SRC=sys.argv[1]; OUT=sys.argv[2]
SIZES=[256,384,640,1080,1920]
if os.path.exists(OUT): shutil.rmtree(OUT)
shutil.copytree(SRC,OUT,ignore=shutil.ignore_patterns('.git','.github','servidor','vercel.json','.vercelignore','herramientas','_site'))
def slug(p): return p.strip('/').replace('img/wp/','').replace('/','-').rsplit('.',1)[0]
made=0
for root,_,fs in os.walk(os.path.join(SRC,'img/wp')):
  for f in fs:
    p=os.path.join(root,f); rel='/'+os.path.relpath(p,SRC)
    try: im=Image.open(p); im.load()
    except Exception as e: print('skip',rel,e); continue
    if im.mode not in('RGB','RGBA'): im=im.convert('RGBA' if 'A' in im.getbands() or im.mode=='P' else 'RGB')
    os.makedirs(os.path.join(OUT,'_img'),exist_ok=True)
    for w in SIZES:
      o=os.path.join(OUT,'_img',f'{slug(rel)}-{w}.webp')
      im2=im if im.width<=w else im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
      im2.save(o,'WEBP',quality=75,method=4); made+=1
print('variants',made)
pat=re.compile(r'/_vercel/image\?url=([^&"\s]+)&(?:amp;)?w=(\d+)(?:&(?:amp;)?q=\d+)?')
def rep(m):
  u=urllib.parse.unquote(m.group(1)); w=int(m.group(2)); w=min([s for s in SIZES if s>=w] or [1920])
  if u.startswith('/img/wp/'): return f'/_img/{slug(u)}-{w}.webp'
  return u
JS_OLD="function VI(u,w){return /^(https:\\/\\/jocecia\\.com\\/portal\\/|\\/img\\/wp\\/)/.test(u)?'/_vercel/image?url='+encodeURIComponent(u)+'&w='+(w||1080)+'&q=75':u}"
JS_NEW="function VI(u,w){if(!/^\\/img\\/wp\\//.test(u))return u;w=w||1080;var s=[256,384,640,1080,1920].filter(function(x){return x>=w})[0]||1920;return '/_img/'+u.slice(8).replace(/\\//g,'-').replace(/\\.[^.]+$/,'')+'-'+s+'.webp'}"
VIMG_OLD="function vimg(u,w){return '/_vercel/image?url='+encodeURIComponent(u)+'&w='+(w||640)+'&q=75'}"
VIMG_NEW="function vimg(u,w){return VI2(u,w||640)}function VI2(u,w){if(!/^\\/img\\/wp\\//.test(u))return u;var s=[256,384,640,1080,1920].filter(function(x){return x>=w})[0]||1920;return '/_img/'+u.slice(8).replace(/\\//g,'-').replace(/\\.[^.]+$/,'')+'-'+s+'.webp'}"
n=0
for root,_,fs in os.walk(OUT):
  for f in fs:
    if not f.endswith('.html'): continue
    p=os.path.join(root,f); s=open(p,encoding='utf-8').read(); o=s
    s=pat.sub(rep,s); s=s.replace(JS_OLD,JS_NEW).replace(VIMG_OLD,VIMG_NEW)
    if '_vercel/image' in s: print('LEFT',p)
    if s!=o: open(p,'w',encoding='utf-8').write(s); n+=1
print('html changed',n)
