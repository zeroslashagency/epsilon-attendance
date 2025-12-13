import re
import base64
import os

def extract_image_from_svg(svg_path, output_path):
    with open(svg_path, 'r') as f:
        content = f.read()
    
    # Find the base64 string
    match = re.search(r'href="data:image/jpeg;base64,([^"]+)"', content)
    if not match:
        print("No base64 image found in SVG")
        return

    base64_str = match.group(1)
    
    # Decode and save
    img_data = base64.b64decode(base64_str)
    
    with open(output_path, 'wb') as f:
        f.write(img_data)
    print(f"Successfully extracted image to {output_path}")

if __name__ == "__main__":
    extract_image_from_svg('assets/logo.svg', 'assets/logo.png')
