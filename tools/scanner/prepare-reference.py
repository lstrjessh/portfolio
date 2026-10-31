"""Restore the mesh-only sample object omitted by the STEP export."""
from pathlib import Path
import argparse
import json
import zipfile
import xml.etree.ElementTree as ET

parser = argparse.ArgumentParser()
parser.add_argument("input", type=Path, help="The original cat v1.3mf export")
args = parser.parse_args()
ns = {"m": "http://schemas.microsoft.com/3dmanufacturing/core/2015/02"}
with zipfile.ZipFile(args.input) as archive:
    root = ET.fromstring(archive.read("3D/3dmodel.model"))
mesh = root.find(".//m:mesh", ns)
if mesh is None:
    raise ValueError("The reference file contains no mesh")
positions = [float(vertex.attrib[axis]) for vertex in mesh.findall("m:vertices/m:vertex", ns) for axis in ("x", "y", "z")]
indices = [int(triangle.attrib[axis]) for triangle in mesh.findall("m:triangles/m:triangle", ns) for axis in ("v1", "v2", "v3")]
destination = Path(".cache/scanner/cat.json")
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text(json.dumps({"name": "cat", "attributes": {"position": {"array": positions}}, "index": {"array": indices}}), encoding="utf-8")
