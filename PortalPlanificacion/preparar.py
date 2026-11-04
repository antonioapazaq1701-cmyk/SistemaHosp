"""Publica una copia de lectura; nunca modifica los documentos de planificación.
Uso: python PortalPlanificacion/preparar.py
"""
from pathlib import Path
import hashlib, json, re, shutil, unicodedata, xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs'
PLAN = ROOT / 'Planificación'
OUT.mkdir(exist_ok=True)
(OUT/'assets').mkdir(exist_ok=True)
(OUT/'diagramas').mkdir(exist_ok=True)

def slug(text):
    return re.sub(r'[^a-zA-Z0-9.-]+', '-', unicodedata.normalize('NFKD', text).encode('ascii','ignore').decode()).strip('-').lower()

def copy(src, target):
    dest = OUT / target
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
    return target

info = [
('El problema y la propuesta', 'Investigación del problema y delimitación', '¿Qué queremos mejorar y por qué?', 'Definimos una propuesta académica para organizar pacientes, citas y seguimiento en el contexto universitario.', ['Problema, justificación y objetivos', 'Alcance y exclusiones del prototipo', 'Supuestos, entrevista e incorporación de IA'], 'El contexto del hospital requiere entrevista y validación institucional.'),
('Personas y necesidades', 'Obtención de requisitos y actores', '¿Quién utilizará el sistema?', 'Identificamos a los usuarios, sus responsabilidades y las reglas que guían la atención simulada.', ['Actores y permisos propuestos', 'Diez necesidades y veinticinco reglas', 'Cuestionario académico y cambios de alcance'], 'El cuestionario del equipo no equivale a una entrevista oficial aplicada.'),
('Lo que debe cumplir', 'Catálogo de requisitos', '¿Qué hará el sistema y cómo se comprobará?', 'Convertimos las necesidades en requisitos con códigos, prioridades y criterios que luego podrán verificarse.', ['49 requisitos funcionales y 16 de calidad', '130 criterios de aceptación', 'Origen y dependencias de cada requisito'], '57 requisitos propuestos y ocho pendientes de aclaración; no son funciones implementadas.'),
('Recorridos de los usuarios', 'Modelo de casos de uso', '¿Cómo se relaciona cada persona con el sistema?', 'Describimos las acciones de los usuarios y sus caminos normales, alternativos y excepcionales.', ['36 casos de uso documentados', 'Siete vistas UML editables', 'Relación entre casos y requisitos'], '32 casos propuestos y cuatro pendientes de aclaración.'),
('Las reglas en detalle', 'Especificación de requisitos de software', '¿Qué condiciones debe respetar cada función?', 'Reunimos la especificación del sistema, sus restricciones y las condiciones para evaluar su funcionamiento.', ['ERS con 65 requisitos y 130 criterios', 'Matriz de trazabilidad y verificaciones previstas', 'Decisiones pendientes y guía de sustentación'], 'Las 65 verificaciones y los 16 escenarios históricos de IA son futuros, no pruebas ejecutadas.'),
('Los conceptos del sistema', 'Diagrama de clases de análisis', '¿Qué información y relaciones necesitamos entender?', 'Representamos los conceptos del hospital y sus relaciones antes de elegir tablas o tecnologías.', ['42 clases conceptuales', '57 asociaciones y ocho dependencias', 'Diez vistas temáticas en Draw.io'], 'Las clases conceptuales todavía no son tablas de una base de datos.'),
('El análisis integrado', 'Documento de análisis', '¿Cómo encaja todo lo analizado?', 'Consolidamos el problema, los actores, los procesos y los modelos en un documento para revisión y sustentación.', ['Documento Word de 46 páginas', 'Doce procesos y diez figuras UML', 'Trazabilidad de requisitos, casos y clases'], 'Los 130 criterios completos se conservan en la ERS del paso 5.'),
('Del análisis al diseño', 'Diagrama de clases de diseño', '¿Cómo se repartirán las responsabilidades del software?', 'Precisamos atributos, métodos, interfaces y servicios, manteniendo el alcance de los pasos anteriores.', ['23 pestañas nativas en Draw.io', '42 clases refinadas; 91 clasificadores únicos', 'Correspondencia análisis–diseño y decisiones'], 'Lenguaje, framework, base de datos y proveedor de IA se definirán en arquitectura.'),
('Arquitectura y capas', 'Arquitectura y capas del sistema', '¿Con qué tecnologías y estructura se construirá?', 'Definimos escritorio WPF, API y MySQL locales, portal MVC externo y sincronización con confirmación local.', ['Seis vistas de despliegue, capas y flujos', 'CC 03 y decisiones técnicas justificadas', 'Trazabilidad y 18 verificaciones previstas'], 'CC 03: ingreso por Medicina General, apartados de tres horas y página 503 tras dos horas sin respuesta. IA generativa sin acceso clínico; proveedor y pruebas pendientes.'),
('Pantallas e interacción', 'Diseño de interfaz de usuario', '¿Cómo será la experiencia de cada usuario?', 'Diseñaremos navegación, pantallas, formularios y estados de uso para computadoras y celulares.', ['Mapa de navegación por roles', 'Wireframes y mockups', 'Guía visual y evaluación de uso'], 'Este portal muestra la planificación; no es el diseño de las pantallas del sistema hospitalario.'),
('Los datos y sus relaciones', 'Modelo de datos y diagrama ER', '¿Cómo se organizarán los datos?', 'Organizamos 59 tablas propuestas en dos bases, con claves, relaciones e integridad para la arquitectura híbrida.', ['Diez vistas ER editables y diccionario de 419 atributos', '49 tablas locales y diez del portal; 98 FK sin cruzar bases', 'Trazabilidad de 42 clases y 18 verificaciones futuras'], 'P11 se adelantó dejando P10 pendiente. Sin SQL ni base creada; las pruebas del sistema siguen No ejecutadas.'),
('Diseño y cierre', 'Documento de diseño y cierre', '¿Está la planificación lista para construir?', 'Integraremos los diseños y revisaremos los acuerdos necesarios para comenzar la implementación.', ['Documento de diseño consolidado', 'Trazabilidad y decisiones de cierre', 'Revisión de preparación para Construcción'], 'La etapa de Construcción comenzará cuando se cierre la planificación.')
]
primary = ['Problema_justificacion_y_objetivos', 'Actores_y_levantamiento_de_requisitos', 'Catalogo_de_Requisitos_CR', 'Modelo_de_Casos_de_Uso', 'Especificacion_de_Requisitos_ERS', 'Modelo_de_Clases_de_Analisis', 'Documento_de_Analisis', 'Modelo_de_Clases_de_Diseno', 'Arquitectura_y_Capas', None, 'Modelo_de_Datos']
descriptions = {
'Problema_justificacion_y_objetivos':'Explica el problema, la justificación, los objetivos y los límites del proyecto.',
'Evaluacion_y_actualizacion_IA':'Registra la incorporación del asistente y las condiciones de su uso.',
'Guia_de_entrevista':'Preguntas para contrastar los supuestos con representantes del servicio médico.',
'Actores_y_levantamiento_de_requisitos':'Quiénes participarán, qué necesitan y qué permisos se proponen.',
'Cuestionario_resuelto_2026-10-21':'Respuestas originales del equipo usadas para elaborar el paso 2.',
'Catalogo_de_Requisitos_CR':'Lista organizada de funcionalidades, calidad y criterios de aceptación.',
'Matriz_de_trazabilidad':'Conecta las necesidades y reglas con los requisitos del catálogo.',
'Modelo_de_Casos_de_Uso':'Recorridos de los usuarios, precondiciones, alternativas y resultados esperados.',
'Matriz_requisitos_casos_de_uso':'Permite seguir cada requisito hasta los casos de uso que lo desarrollan.',
'Especificacion_de_Requisitos_ERS':'Especificación completa de requisitos, condiciones y restricciones.',
'Matriz_de_trazabilidad_ERS':'Relaciona requisitos, criterios, casos y verificaciones futuras.',
'Decisiones_pendientes_ERS':'Siete grupos de decisiones que todavía deben aclararse.',
'Guia_de_sustentacion_CR_y_ERS':'Apoyo para explicar y sustentar el catálogo y la especificación.',
'Modelo_de_Clases_de_Analisis':'Conceptos, atributos, responsabilidades y relaciones del dominio.',
'Matriz_requisitos_casos_clases':'Recorrido desde cada requisito hasta sus casos y clases conceptuales.',
'Documento_de_Analisis':'Consolida el contexto, los procesos y el modelo conceptual para sustentación.',
'Modelo_de_Clases_de_Diseno':'Clases refinadas, métodos, interfaces y responsabilidades de diseño.',
'Matriz_analisis_diseno':'Justifica la transformación de las clases conceptuales al diseño.',
'Arquitectura_y_Capas':'Capas, despliegues, sincronización, seguridad e IA del diseño híbrido.',
'Control_de_cambios_CC03':'Acuerdos vigentes y efecto sobre los antecedentes de P1 a P8.',
'Decisiones_tecnicas':'Elecciones de arquitectura, condiciones y pendientes de comprobación.',
'Matriz_arquitectura_requisitos':'Traza los 65 requisitos y añade 18 verificaciones futuras de P9.',
'Modelo_de_Datos':'Diseño de dos bases, normalización, reglas de integridad y concurrencia.',
'Diccionario_de_Datos':'59 tablas propuestas con atributos, tipos, nulabilidad y claves.',
'Matriz_requisitos_clases_datos':'Relaciona las 42 clases, 65 requisitos y 130 criterios con los datos.',
'Verificaciones_previstas':'18 escenarios futuros de datos, todos No ejecutado.',
'README':'Guía del paso: entregables, estado, límites y forma de consulta.',
}
titles = {
'Problema_justificacion_y_objetivos':'Problema, justificación y objetivos',
'Actores_y_levantamiento_de_requisitos':'Actores y levantamiento de requisitos',
'Catalogo_de_Requisitos_CR':'Catálogo de requisitos',
'Modelo_de_Casos_de_Uso':'Modelo de casos de uso',
'Especificacion_de_Requisitos_ERS':'Especificación de requisitos (ERS)',
'Modelo_de_Clases_de_Analisis':'Modelo de clases de análisis',
'Documento_de_Analisis':'Documento de análisis',
'Modelo_de_Clases_de_Diseno':'Modelo de clases de diseño',
'Matriz_analisis_diseno':'Matriz de análisis a diseño',
'Arquitectura_y_Capas':'Arquitectura y capas del sistema',
'Control_de_cambios_CC03':'Cambios de arquitectura CC 03',
'Decisiones_tecnicas':'Decisiones técnicas',
'Matriz_arquitectura_requisitos':'Matriz de arquitectura y verificaciones',
'Evaluacion_y_actualizacion_IA':'Evaluación e incorporación de IA',
'Guia_de_entrevista':'Guía de entrevista',
'Decisiones_pendientes_ERS':'Decisiones pendientes',
'Guia_de_sustentacion_CR_y_ERS':'Guía de sustentación del CR y la ERS',
'Matriz_de_trazabilidad_ERS':'Matriz de trazabilidad de la ERS',
'Matriz_de_trazabilidad':'Matriz de trazabilidad',
'Matriz_requisitos_casos_de_uso':'Matriz de requisitos y casos',
'Matriz_requisitos_casos_clases':'Matriz de requisitos, casos y clases',
'Cuestionario_resuelto_2026-10-21':'Cuestionario del equipo',
'Modelo_de_Datos':'Modelo de datos del sistema hospitalario',
'Diccionario_de_Datos':'Diccionario de datos',
'Matriz_requisitos_clases_datos':'Matriz de requisitos clases y datos',
'Verificaciones_previstas':'Verificaciones previstas del modelo',
'README':'Guía del paso',
}
steps=[]; documents=[]; manifest=[]; source_map={}
for i, meta in enumerate(info,1):
    folder=next(PLAN.glob(f'{i:02}_*'))
    step=dict(zip(['title','formal','question','description','items','note'],meta))
    step.update(id=i, status='Documentado' if i<=9 or i==11 else 'Pendiente', group='Comprender' if i<=3 else 'Analizar' if i<=7 else 'Diseñar', folder=folder.name, documents=[], diagrams=[])
    for file in sorted(folder.iterdir(),key=lambda f:(f.stem!=primary[i-1] if i<=len(primary) and primary[i-1] else True, f.name)):
        if not file.is_file() or file.suffix not in ['.md','.txt','.docx','.drawio']: continue
        doc_id=f'p{i:02}-{slug(file.stem)}'
        source_map[str(file.relative_to(ROOT)).replace('\\','/')]=doc_id
        manifest.append({'source':str(file.relative_to(ROOT)), 'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
        if file.suffix not in ['.md','.txt']: continue
        doc={'id':doc_id,'step':i, 'title':titles.get(file.stem,file.stem.replace('_',' ')), 'description':descriptions.get(file.stem,'Documento de apoyo del paso.'), 'markdown':file.read_text('utf-8-sig'), 'source':str(file.relative_to(ROOT)).replace('\\','/'), 'primary':i<=len(primary) and file.stem==primary[i-1]}
        if file.suffix=='.txt': doc['markdown']='# '+doc['title']+'\n\n'+doc['markdown']
        documents.append(doc); step['documents'].append(doc['id'])
    for draw in folder.glob('*.drawio'):
        for diagram in ET.parse(draw).getroot().findall('diagram'):
            code=re.match(r'[A-Z]\d{2}',diagram.attrib.get('name',''))
            if not code: code=re.match(r'[A-Z]\d{2}',diagram.attrib.get('id',''))
            if not code: raise ValueError(diagram.attrib)
            code=code.group(0)
            svg=folder/'Diagramas'/(code+'.svg')
            if not svg.exists(): raise FileNotFoundError(svg)
            path=copy(svg,f'diagramas/p{i:02}/{code}.svg')
            name=diagram.attrib['name']
            step['diagrams'].append({'id':f'p{i:02}-{code}', 'code':code,'title':name,'path':path})
            source_map[str(svg.relative_to(ROOT)).replace('\\','/')]=path
            source_map[str(svg.with_suffix('.png').relative_to(ROOT)).replace('\\','/')]=path
            manifest.append({'source':str(svg.relative_to(ROOT)), 'file':path,'sha256':hashlib.sha256(svg.read_bytes()).hexdigest()})
    steps.append(step)

for name, title, desc in [('Planificacion_Base_Sistema_Hospitalario.md','Plan general del proyecto','Ruta de trabajo, alcance y criterios para pasar a Construcción.'), ('Planificación/README.md','Índice de la planificación','Estado y entregables de cada paso documentado.')]:
    f=ROOT/name; doc_id='plan-general' if name.startswith('Planificacion') else 'indice'; source_map[name]=doc_id
    documents.append({'id':doc_id,'step':0,'title':title,'description':desc,'markdown':f.read_text('utf-8-sig'),'source':name,'primary':False})
    manifest.append({'source':name,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()})

# P7 incorpora diez figuras del modelo de P6; publicar sus vistas SVG existentes.
for i in range(1,11):
    source_map[f'Planificación/{steps[6]["folder"]}/_auxiliares/figuras/D{i:02}.png']=f'diagramas/p06/D{i:02}.svg'

ers=json.loads(next(PLAN.glob('05*/_auxiliares/ers.json')).read_text('utf-8'))
data={'date':'28 de octubre de 2026','steps':steps,'documents':documents,'requirements':ers['requisitos'],'decisions':ers['decisiones'],'sourceMap':source_map,'stats':{'steps':12,'documented':sum(s['status']=='Documentado' for s in steps),'requirements':len(ers['requisitos']),'criteria':sum(len(r['aceptacion']) for r in ers['requisitos']),'cases':len(ers['casos']),'views':sum(len(s['diagrams']) for s in steps)}}
(OUT/'assets/data.js').write_text('window.PLAN_DATA = '+json.dumps(data,ensure_ascii=False).replace('</','<\\/')+';\n','utf-8')
(OUT/'.nojekyll').touch()
(ROOT/'PortalPlanificacion/manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),'utf-8')
print(json.dumps({'documents':len(documents),'views':data['stats']['views'],'requirements':len(ers['requisitos']),'assets':len(manifest)},ensure_ascii=False))
