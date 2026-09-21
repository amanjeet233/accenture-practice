import pypdf
import sys

sys.stdout.reconfigure(encoding='utf-8')

r = pypdf.PdfReader('Accenture MOCK OA -1.pdf')
print(f"Total pages: {len(r.pages)}")

for i in range(1, 10):
    txt = r.pages[i].extract_text()
    print(f"\n=== PAGE {i+1} ===")
    print(txt[:300])
