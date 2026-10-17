import os
from PIL import Image, ImageDraw

def ensure_vault_dir():
    if not os.path.exists('vault'):
        os.makedirs('vault')

def generate_vault_icon():
    # 512x512 exact bounding for standard Android Icon
    size = (512, 512)
    img = Image.new('RGB', size, color='#1e2124') # Deep slate gray
    draw = ImageDraw.Draw(img)
    
    # Clean geometry (Base Waste Harvester symbol)
    points = [(256, 120), (412, 392), (100, 392)]
    draw.polygon(points, fill='#282b30', outline='#ffffff', width=8) 
    
    img.save('vault/icon.png')
    print("[True] Vault icon generated.")

def generate_vault_presplash():
    # 1080x1920 splash geometry
    size = (1080, 1920)
    img = Image.new('RGB', size, color='#1e2124')
    draw = ImageDraw.Draw(img)
    
    cx, cy = int(size[0]/2), int(size[1]/2)
    points = [(cx, cy-250), (cx+220, cy+150), (cx-220, cy+150)]
    draw.polygon(points, fill='#282b30', outline='#ffffff', width=12)
    
    img.save('vault/presplash.png')
    print("[True] Vault presplash generated.")

if __name__ == "__main__":
    ensure_vault_dir()
    generate_vault_icon()
    generate_vault_presplash()
