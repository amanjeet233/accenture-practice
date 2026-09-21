import pypdf
import sys

sys.stdout.reconfigure(encoding='utf-8')

r = pypdf.PdfReader('Accenture mock OA -2 .pdf')
p = r.pages[2]

text_elements = []

def visitor_body(text, cm, tm, font_dict, font_size):
    if text.strip():
        # tm[4] is x, tm[5] is y
        text_elements.append((tm[4], tm[5], text.strip()))

p.extract_text(visitor_text=visitor_body)

for x, y, t in sorted(text_elements, key=lambda item: -item[1]):
    print(f"y={y:.1f}, x={x:.1f}: {t}")
