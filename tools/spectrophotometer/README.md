# Spectrophotometer assets

Uses the original Autodesk OBJ and its accompanying MTL. The source files stay outside the repository.

```powershell
npm ci --prefix tools/scanner
node tools/spectrophotometer/server.mjs "<source-folder>/Assembly.obj"
# In another terminal with Playwright, Chromium, and Pillow installed:
python tools/spectrophotometer/capture.py
# With the portfolio running locally, capture the final camera-matched previews:
python tools/capture-design-posters.py
```

`components.mjs` identifies the instrument parts by source OBJ group index. The laptop, external PSU, and their cables are omitted from both the poster and downloadable model. Component positions are preserved; explode vectors are illustrative offsets. Browser geometry is simplified from the source mesh and exported in metres from the original millimetre dimensions.

Output: `public/spectrophotometer/default-view.webp` and `model.glb.gz`.
