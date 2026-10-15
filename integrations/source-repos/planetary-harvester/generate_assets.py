from PIL import Image, ImageDraw

def construct_asset(filename, size, color):
    img = Image.new('RGB', size, color=color)
    d = ImageDraw.Draw(img)
    # Draw secure perimeter frame
    d.rectangle([size[0]*0.1, size[1]*0.1, size[0]*0.9, size[1]*0.9], outline="white", width=8)
    img.save(filename)
    print(f"Verified generation: {filename}")

# Generate Kivy required assets
construct_asset("icon.png", (512, 512), (10, 10, 10))
construct_asset("presplash.png", (1080, 1920), (10, 10, 10))
