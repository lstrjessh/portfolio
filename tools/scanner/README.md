# Scanner assets

The web model comes from the supplied `assembly.stp`. The mesh-only sample object comes from `cat v1.3mf`, which is omitted by the STEP export. Component placements remain in the original millimetre coordinates. The displayed materials are styled for the portfolio.

From the portfolio root:

```powershell
npm ci --prefix tools/scanner
node tools/scanner/import-step.cjs "<source-folder>/assembly.stp"
python tools/scanner/prepare-reference.py "<source-folder>/cat v1.3mf"
node tools/scanner/server.mjs
# In another terminal, with Playwright, Chromium, and Pillow installed:
python tools/scanner/capture.py
```

Source CAD and intermediate geometry stay outside version control. Only `public/scanner/assembly.webp` and `model.glb.gz` are served. Meshoptimizer reduces reference detail for the browser; original CAD files remain untouched. Exploded offsets are illustrative separations, stored as glTF component metadata.

The Designs collection is defined in `app/designs/items.ts`. Each entry has a poster and a compressed GLB. The viewer loads as it approaches the viewport and renders on interaction. Models with `userData.explode` vectors also get the assembly control.
