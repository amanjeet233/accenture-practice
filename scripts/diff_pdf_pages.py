import pypdf
import sys

sys.stdout.reconfigure(encoding='utf-8')

r = pypdf.PdfReader('Accenture MOCK OA -1.pdf')
p2 = r.pages[1] # 0-indexed page 2
p3 = r.pages[2] # 0-indexed page 3

print("P2 images:", len(p2.images))
print("P3 images:", len(p3.images))
print("P2 text:\n", p2.extract_text())
print("P3 text:\n", p3.extract_text())

# Check visitor for colors or check contents
print("P2 contents len:", len(p2.get_contents().get_data()))
print("P3 contents len:", len(p3.get_contents().get_data()))

d2 = p2.get_contents().get_data()
d3 = p3.get_contents().get_data()
# Let's see what diff is in the stream
import difflib
s2_lines = d2.decode('latin1', errors='ignore').splitlines()
s3_lines = d3.decode('latin1', errors='ignore').splitlines()
diff = [l for l in difflib.unified_diff(s2_lines, s3_lines) if l.startswith('+') or l.startswith('-')]
print("Diff lines count:", len(diff))
print("\n".join(diff[:25]))
