import pypdf
import zipfile
import xml.etree.ElementTree as ET
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

def analyze_pdf(path):
    r = pypdf.PdfReader(path)
    pages = len(r.pages)
    text_samples = []
    for i in [0, min(1, pages-1), min(2, pages-1), min(pages//2, pages-1)]:
        t = r.pages[i].extract_text() or ''
        text_samples.append(f"P{i+1}: " + t[:150].replace('\n', ' '))
    return pages, " | ".join(text_samples)

def analyze_pptx(path):
    z = zipfile.ZipFile(path)
    slide_files = [f for f in z.namelist() if f.startswith('ppt/slides/slide') and f.endswith('.xml')]
    def get_num(s):
        import re
        m = re.search(r'slide(\d+)\.xml', s)
        return int(m.group(1)) if m else 0
    slide_files.sort(key=get_num)
    samples = []
    for sfile in slide_files[:4]:
        root = ET.fromstring(z.read(sfile))
        texts = [e.text for e in root.iter() if e.tag.endswith('}t') and e.text]
        samples.append(" ".join(texts[:5])[:80])
    return len(slide_files), " | ".join(samples)

files = [
    'Accenture MOCK OA -1.pdf',
    'Accenture mock OA -2 .pdf',
    'Accenture MS office.pptx',
    'accenture network sec cheatsheet.pdf',
    'Accenture Networking.pptx',
    'Accenture Pseudo code.pdf',
    'Accenture_2025_Shift_Coding_Sheet_watermark.pdf',
    'Accenture_Advanced_Coding_Questions.pdf',
    'Accenture_coding_round_Cheatsheet_.pdf',
    'Accenture_Technical_Round_Resource.pdf',
    'Accenture-Coding-Questions-and-Solution-2024.pdf',
    'Cloud_Cheat_sheet.pdf',
    'Most_asked_DP_Graph_and_Grid_Problems_in_Accenture_watermark.pdf',
    'ms office cheatsheet.pdf',
]

for f in files:
    print(f"\n==================== {f} ====================")
    if f.endswith('.pdf'):
        p_cnt, samp = analyze_pdf(f)
        print(f"PDF ({p_cnt} pages): {samp[:300]}")
    elif f.endswith('.pptx'):
        s_cnt, samp = analyze_pptx(f)
        print(f"PPTX ({s_cnt} slides): {samp[:300]}")
