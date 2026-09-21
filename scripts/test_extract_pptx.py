import zipfile
import xml.etree.ElementTree as ET
import re
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

def extract_pptx_mcqs(pptx_path, section_name):
    z = zipfile.ZipFile(pptx_path)
    slide_files = [f for f in z.namelist() if f.startswith('ppt/slides/slide') and f.endswith('.xml')]
    def get_num(s):
        m = re.search(r'slide(\d+)\.xml', s)
        return int(m.group(1)) if m else 0
    slide_files.sort(key=get_num)
    
    questions = []
    
    # We iterate through slides in pairs (Slide 2 & 3, Slide 4 & 5, ...)
    # Skip slide 1 (title slide)
    idx = 1
    while idx < len(slide_files):
        sfile_q = slide_files[idx]
        sfile_ans = slide_files[idx+1] if idx + 1 < len(slide_files) else None
        
        # Read question slide
        root_q = ET.fromstring(z.read(sfile_q))
        texts_q = []
        for p in root_q.iter():
            if p.tag.endswith('}p'):
                p_text = ''.join([t.text for t in p.iter() if t.tag.endswith('}t') and t.text])
                if p_text.strip():
                    texts_q.append(p_text.strip())
        
        # Read answer slide for green colored text
        green_text = ""
        if sfile_ans:
            root_ans = ET.fromstring(z.read(sfile_ans))
            for p in root_ans.iter():
                if p.tag.endswith('}r'):
                    color = None
                    for clr in p.iter():
                        if clr.tag.endswith('}srgbClr'):
                            color = clr.attrib.get('val', '')
                    if color and color.upper() in ['00B050', '00BF63', '385723', '008000', '228B22']:
                        t = ''.join([elem.text for elem in p.iter() if elem.tag.endswith('}t') and elem.text])
                        if t.strip():
                            green_text += " " + t.strip()
        
        # Parse question text and options
        full_text = '\n'.join(texts_q)
        
        # Filter title if it contains header like Accenture
        lines = [l.strip() for l in full_text.split('\n') if l.strip()]
        filtered_lines = []
        for l in lines:
            if l.lower() in ['accenture', 'common applications & ms office', 'networking, security, and cloud', 'networking, security, and cloud accenture', 'prime coding']:
                continue
            filtered_lines.append(l)
        
        if not filtered_lines:
            idx += 2
            continue
            
        # Parse question stem vs options
        stem_lines = []
        opts = {}
        for l in filtered_lines:
            opt_m = re.match(r'^([A-D])[\)\.]\s*(.*)', l, re.IGNORECASE)
            if opt_m:
                opts[opt_m.group(1).upper()] = opt_m.group(2).strip()
            elif not opts:
                stem_lines.append(l)
            else:
                # continuation of last option
                last_key = list(opts.keys())[-1]
                opts[last_key] += " " + l
                
        stem = ' '.join(stem_lines).strip()
        
        # Try to identify correct option from green_text
        correct_id = None
        correct_text = ""
        green_text = green_text.strip()
        
        # Check if green_text starts with A) or A.
        opt_g_m = re.match(r'^([A-D])[\)\.]\s*(.*)', green_text, re.IGNORECASE)
        if opt_g_m:
            correct_id = opt_g_m.group(1).upper()
            correct_text = opts.get(correct_id, opt_g_m.group(2).strip())
        elif green_text:
            # Match against options
            for k, v in opts.items():
                if green_text.lower() in v.lower() or v.lower() in green_text.lower():
                    correct_id = k
                    correct_text = v
                    break
        
        if stem and len(opts) >= 2:
            questions.append({
                "slide_q": idx + 1,
                "slide_ans": (idx + 2) if sfile_ans else None,
                "stem": stem,
                "options": opts,
                "green_text": green_text,
                "correct_id": correct_id,
                "correct_text": correct_text
            })
            
        idx += 2
        
    return questions

ms_qs = extract_pptx_mcqs('Accenture MS office.pptx', 'MS Office')
net_qs = extract_pptx_mcqs('Accenture Networking.pptx', 'Networking')
print(f"Extracted MS Office MCQs: {len(ms_qs)}")
print(f"Extracted Networking MCQs: {len(net_qs)}")

# Print sample
if ms_qs:
    print("\nSample MS Office MCQ:")
    print(json.dumps(ms_qs[0], indent=2))

if net_qs:
    print("\nSample Networking MCQ:")
    print(json.dumps(net_qs[0], indent=2))
