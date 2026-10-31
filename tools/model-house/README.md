# Model House assets

Uses the supplied `Model+House.stp`. The source stays outside the repository.

```powershell
npm ci --prefix tools/scanner
node tools/scanner/import-step.cjs "<source-folder>/Model+House.stp" .cache/model-house
python tools/model-house/recover-colors.py "<source-folder>/Model+House.stp"
node tools/model-house/export.mjs
# With the portfolio running locally:
python tools/capture-design-posters.py --title "Model House"
```

All 46 imported meshes retain their placements. `recover-colors.py` restores body and face colours from the original STEP styles, validating face counts against the imported topology. Component assignments in `export.mjs` follow the imported hierarchy and geometry. Dense solar-panel and fixture meshes are simplified for the browser. The architecture is preserved. No smart home hardware or behavior is added.

The STEP's empty Kitchen Sink node has no mesh to export. The exploded view uses illustrative component offsets: the roof and solar panels lift together, the upper floor and its door move together, and the side wall moves aside. Ground-floor fixtures and the staircase retain their assembled positions. The downloadable GLB keeps the original assembled geometry with explode offsets stored as metadata.

The roof and building retain their source white finish. Solar modules use a dark blue cell material and clear covers to replace their missing textured appearance. These are display materials; original geometry is preserved.
