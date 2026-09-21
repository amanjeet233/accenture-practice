import pypdf

r = pypdf.PdfReader('Accenture MOCK OA -1.pdf')
# Let's inspect pages 2 and 3
p2 = r.pages[1]
p3 = r.pages[2]

print("P2 images:", list(p2.images.keys()) if hasattr(p2, 'images') else None)
print("P3 images:", list(p3.images.keys()) if hasattr(p3, 'images') else None)

for name, img in p2.images.items():
    print("P2 img:", name, len(img.data))

for name, img in p3.images.items():
    print("P3 img:", name, len(img.data))
