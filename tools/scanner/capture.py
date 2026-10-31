"""Export the poster and web model from the local CAD studio."""
from pathlib import Path
from io import BytesIO
import base64
import os
from playwright.sync_api import sync_playwright
from PIL import Image

with sync_playwright() as p:
    browsers = Path(os.environ.get('LOCALAPPDATA', '')) / 'ms-playwright'
    executable = next(browsers.glob('chromium-*/chrome-win*/chrome.exe'), None)
    browser = p.chromium.launch(executable_path=str(executable) if executable else None, headless=True,
        args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--js-flags=--max-old-space-size=4096'])
    page = browser.new_page(viewport={'width': 1600, 'height': 1266})
    page.goto('http://127.0.0.1:8014', wait_until='domcontentloaded', timeout=120_000)
    page.wait_for_function('window.studio?.ready', timeout=180_000)
    data = page.evaluate('window.studio.render({width:1600,height:1266,yaw:-1.6})')
    image = Image.open(BytesIO(base64.b64decode(data.split(',', 1)[1])))
    image.save('public/scanner/assembly.webp', 'WEBP', quality=92, method=6)
    print('Poster saved. Model:', page.evaluate('window.studio.exportModel()'))
    browser.close()
