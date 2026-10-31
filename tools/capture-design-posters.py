"""Capture posters from the live viewer's exact default camera and materials.

Run with Playwright, Chromium, and Pillow installed while the portfolio runs locally.
"""
from pathlib import Path
from io import BytesIO
from urllib.parse import urlparse, parse_qs
import argparse
import base64
import os
from PIL import Image
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--url', default='http://localhost:3000/designs')
parser.add_argument('--title', help='Capture a single design by its title')
args = parser.parse_args()
with sync_playwright() as p:
    browsers = Path(os.environ.get('LOCALAPPDATA', ''))/'ms-playwright'
    executable = next(browsers.glob('chromium-*/chrome-win*/chrome.exe'), None)
    browser = p.chromium.launch(executable_path=str(executable) if executable else None,
        args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    page.goto(args.url, wait_until='networkidle')
    for title, folder in [('3D Scanner', 'scanner'), ('Portable Spectrophotometer', 'spectrophotometer'), ('Model House', 'model-house')]:
        if args.title and args.title != title:
            continue
        entry = page.locator('.design-entry').filter(has=page.get_by_role('heading', name=title, exact=True))
        viewer = entry.locator('.design-viewer')
        viewer.scroll_into_view_if_needed()
        viewer.get_by_role('button', name='Reset view').wait_for(timeout=60_000)
        viewer.evaluate("e=>{e.style.boxSizing='content-box';e.style.width='1600px';e.style.height='1280px'}")
        page.wait_for_function('(label)=>[...document.querySelectorAll("canvas")].find(c=>c.getAttribute("aria-label").startsWith(label))?.width===1600', arg=entry.locator('canvas').get_attribute('aria-label'))
        # Capture immediately after render, before the browser clears the WebGL drawing buffer.
        data = viewer.evaluate("e=>{[...e.querySelectorAll('button')].find(b=>b.textContent.includes('Reset view')).click();return e.querySelector('canvas').toDataURL('image/png')}")
        image = Image.open(BytesIO(base64.b64decode(data.split(',', 1)[1]))).convert('RGBA')
        if not image.getbbox():
            raise ValueError(f'Empty capture: {title}')
        image_src = urlparse(viewer.locator('img').get_attribute('src'))
        poster_path = parse_qs(image_src.query).get('url', [image_src.path])[0]
        destination = Path('public')/urlparse(poster_path).path.lstrip('/')
        if not destination.resolve().is_relative_to(Path('public').resolve()):
            raise ValueError('Poster path is outside public/')
        image.save(destination, 'WEBP', quality=94, method=6)
        print('Saved', title, image.size, flush=True)
        viewer.evaluate("e=>{e.style.boxSizing='';e.style.width='';e.style.height=''}")
    browser.close()
