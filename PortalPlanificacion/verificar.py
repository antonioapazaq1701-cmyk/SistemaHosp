"""Comprobaciones de publicación y contenido. No ejecuta pruebas hospitalarias."""
from pathlib import Path
import argparse, hashlib, json, re, urllib.request, xml.etree.ElementTree as ET

root=Path(__file__).resolve().parents[1]
site=root/'docs'
parser=argparse.ArgumentParser();parser.add_argument('--url');args=parser.parse_args()
text=(site/'assets/data.js').read_text('utf-8')
data=json.loads(text.removeprefix('window.PLAN_DATA = ').rstrip().removesuffix(';'))
assert len(data['steps'])==12
assert [s['status'] for s in data['steps']]==['Documentado']*8+['Pendiente']*4
assert len(data['documents'])==25
assert len(data['requirements'])==65
assert sum(len(r['aceptacion']) for r in data['requirements'])==130
assert sum(r['estado']=='Propuesto' for r in data['requirements'])==57
assert len({d['id'] for d in data['documents']})==25
assert all(r['resultado_prueba']=='No ejecutado' for r in data['requirements'])
ids={d['id'] for d in data['documents']}
assert all(i in ids for s in data['steps'] for i in s['documents'])
assert all(not s['documents'] and not s['diagrams'] for s in data['steps'][8:])
views=[d for s in data['steps'] for d in s['diagrams']]
assert len(views)==40
for d in views:
    p=site/d['path'];assert p.is_file() and p.stat().st_size>500
    svg=ET.parse(p).getroot();assert svg.tag.endswith('svg')
    assert not any(e.tag.endswith('script') for e in svg.iter())
assert len([v for k,v in data['sourceMap'].items() if '/_auxiliares/figuras/' in k])==10
html=(site/'index.html').read_text('utf-8')
assert not re.search(r'<(?:iframe|object|embed)\b|\bdownload\s*=',html)
assert not list(site.rglob('*.docx')) and not list(site.rglob('*.drawio')) and not list(site.rglob('*.pdf')) and not list(site.rglob('*.zip'))
for target in re.findall(r'data-doc="([^"]+)"',html): assert target in ids, target
for href in re.findall(r'(?:src|href)="([^"]+)"',html):
    if not href.startswith(('#','https:')): assert (site/href).is_file(),href
manifest=json.loads((root/'PortalPlanificacion/manifest.json').read_text('utf-8'))
available=[m for m in manifest if (root/m['source']).exists()]
for m in available: assert hashlib.sha256((root/m['source']).read_bytes()).hexdigest()==m['sha256'],m['source']
local=root/'PortalPlanificacion/_qa/planificacion-preservada.json'
preserved=0
if local.exists():
    before=json.loads(local.read_text('utf-8'))
    for name,sha in before.items():
        assert hashlib.sha256((root/name).read_bytes()).hexdigest()==sha,name
    preserved=len(before)
if args.url:
    for f in site.rglob('*'):
        if f.is_file():
            request=urllib.request.Request(args.url.rstrip('/')+'/'+f.relative_to(site).as_posix(),method='GET')
            with urllib.request.urlopen(request,timeout=30) as response:
                assert response.status==200
                assert hashlib.sha256(response.read()).digest()==hashlib.sha256(f.read_bytes()).digest(),str(f)
result={'documents':25,'diagrams':40,'requirements':65,'criteria':130,'originals_preserved':preserved,'original_binary_files_published':0,'file_download_buttons':0,'resources_http_verified':bool(args.url),'hospital_software_tests':0,'status':'conforme'}
print(json.dumps(result,ensure_ascii=False))
if local.exists():(local.parent/'verificacion.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf-8')
