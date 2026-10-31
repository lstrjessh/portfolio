"""Recover STEP body/face appearances omitted by the tessellator.

The face order and face counts are checked against each imported B-rep mesh.
"""
from pathlib import Path
import argparse
import json
import re

parser = argparse.ArgumentParser()
parser.add_argument('input', type=Path)
args = parser.parse_args()
entities = {int(i): value.strip() for i, value in re.findall(r'#(\d+)\s*=\s*(.*?);', args.input.read_text(), re.S)}
refs = lambda value: list(map(int, re.findall(r'#(\d+)', value)))
colors = {}
for entity, value in entities.items():
    if value.startswith('COLOUR_RGB'):
        colors[entity] = list(map(float, value.rstrip(')').rsplit(',', 3)[1:]))

def appearance(entity, visited=None):
    if entity in colors:
        return colors[entity]
    visited = set() if visited is None else visited
    if entity in visited:
        return None
    visited.add(entity)
    for reference in refs(entities.get(entity, '')):
        color = appearance(reference, visited)
        if color is not None:
            return color
    return None

styles = {}
for value in entities.values():
    if value.startswith('STYLED_ITEM'):
        references = refs(value)
        color = appearance(references[0])
        if color is not None:
            styles[references[-1]] = color

def faces(entity):
    value = entities[entity]
    if value.startswith('ADVANCED_FACE'):
        return [entity]
    if not value.startswith(('MANIFOLD_SOLID_BREP', 'BREP_WITH_VOIDS', 'SHELL_BASED_SURFACE_MODEL', 'CLOSED_SHELL', 'OPEN_SHELL', 'ORIENTED_CLOSED_SHELL')):
        raise ValueError(f'Unexpected topology: {entity}: {value[:80]}')
    return [face for reference in refs(value) for face in faces(reference)]

sources = [180083, 180084, 33] + [34, 35, 36, 37, 24] * 6 + list(range(38, 51))
assembly = json.loads(Path('.cache/model-house/assembly.json').read_text())
assert len(sources) == len(assembly['meshes'])
output = []
for mesh, source in zip(assembly['meshes'], sources):
    face_ids = faces(source)
    assert len(face_ids) == len(mesh['brep_faces']), f'Face count changed for source {source}'
    body_color = styles.get(source)
    assert body_color is not None, f'Missing source appearance: {source}'
    output.append({'source': source, 'body': body_color, 'faces': [styles.get(face, body_color) for face in face_ids]})
Path('.cache/model-house/colors.json').write_text(json.dumps(output), encoding='utf-8')
print(f'Recovered original body and face colors for {len(output)} meshes.')
