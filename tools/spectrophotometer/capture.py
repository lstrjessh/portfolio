"""Export the instrument-only poster and compressed GLB from the local OBJ studio."""
from pathlib import Path
from io import BytesIO
import base64
import os
from playwright.sync_api import sync_playwright
from PIL import Image, ImageOps

destination = Path('.cache/spectrophotometer')
destination.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    browsers = Path(os.environ.get('LOCALAPPDATA', '')) / 'ms-playwright'
    executable = next(browsers.glob('chromium-*/chrome-win*/chrome.exe'), None)
    browser = p.chromium.launch(executable_path=str(executable) if executable else None,
        args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    page = browser.new_page(viewport={'width': 1600, 'height': 1266})
    page.on('pageerror', lambda error: print(error, flush=True))
    page.goto('http://127.0.0.1:8015', wait_until='networkidle')
    page.wait_for_function('window.studio?.ready', timeout=90_000)
    data = page.evaluate('studio.render({ids: studio.instrumentIds})')
    image = Image.open(BytesIO(base64.b64decode(data.split(',', 1)[1]))).convert('RGBA')
    cropped = image.crop(image.getbbox())
    cropped = ImageOps.contain(cropped, (1400, 1100), Image.Resampling.LANCZOS)
    poster = Image.new('RGBA', (1600, 1266))
    poster.alpha_composite(cropped, ((1600-cropped.width)//2, (1266-cropped.height)//2))
    poster.save(destination/'source-preview.webp', 'WEBP', quality=92, method=6)
    print('Source preview saved. Model:', page.evaluate('studio.exportModel()'), flush=True)
    browser.close()
