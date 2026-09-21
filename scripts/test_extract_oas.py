import pypdf
import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

def extract_mock_oa(pdf_path, oa_name):
    r = pypdf.PdfReader(pdf_path)
    total_pages = len(r.pages)
    print(f"\nProcessing {oa_name} ({pdf_path}): {total_pages} pages")
    
    questions = []
    
    for i in range(1, total_pages - 1, 2):
        p_q = r.pages[i]
        p_ans = r.pages[i+1] if i + 1 < total_pages else None
        
        q_text = p_q.extract_text() or ""
        ans_text = p_ans.extract_text() if p_ans else ""
        
        # Check green in ans_text stream
        stream = p_ans.get_contents().get_data().decode('latin1', errors='ignore') if p_ans else ""
        
        # Parse lines
        lines = [l.strip() for l in q_text.split('\n') if l.strip()]
        filtered = []
        for l in lines:
            if l.lower() in ['mock online assessment accenture', 'mock online  assessment accenture', 'mock', 'online', 'assessment', 'accenture', 'prime coding']:
                continue
            filtered.append(l)
            
        stem_lines = []
        opts = {}
        for l in filtered:
            m = re.match(r'^([A-D])[\)\.]\s*(.*)', l, re.IGNORECASE)
            if m:
                opts[m.group(1).upper()] = m.group(2).strip()
            elif not opts:
                stem_lines.append(l)
            else:
                last_k = list(opts.keys())[-1]
                opts[last_k] += " " + l
                
        stem = ' '.join(stem_lines).strip()
        
        # Try to detect which option is marked green in p_ans
        # In p_ans, look for green color: 0 .749 .3882 rg or 00BF63
        correct_id = None
        
        # Search green circle coordinates in stream
        green_m = re.search(r'(?:0\s+\.749\s+\.3882\s+rg|00BF63)[^0-9]*([0-9\.]+)\s+([0-9\.]+)\s+m', stream)
        if green_m:
            circle_y = float(green_m.group(2))
            # Find closest option coordinate
            text_elements = []
            def visitor(text, cm, tm, font_dict, font_size):
                if text.strip():
                    text_elements.append((tm[4], tm[5], text.strip()))
            p_ans.extract_text(visitor_text=visitor)
            
            # Map options to y coordinates
            opt_ys = {}
            for x, y, t in text_elements:
                opt_m = re.match(r'^([A-D])[\)\.]', t)
                if opt_m:
                    opt_ys[opt_m.group(1).upper()] = y
                    
            if opt_ys:
                closest_opt = min(opt_ys.keys(), key=lambda k: abs(opt_ys[k] - circle_y))
                correct_id = closest_opt
                
        # If green not detected via stream, check text for answer indicator
        if not correct_id:
            ans_m = re.search(r'Answer:\s*([A-D])', ans_text, re.IGNORECASE)
            if ans_m:
                correct_id = ans_m.group(1).upper()
                
        if stem and len(opts) >= 2:
            correct_text = opts.get(correct_id, "")
            questions.append({
                "source": oa_name,
                "page_q": i + 1,
                "page_ans": i + 2,
                "stem": stem,
                "options": opts,
                "correct_id": correct_id,
                "correct_text": correct_text
            })
            
    print(f"Extracted {len(questions)} questions from {oa_name}")
    return questions

oa1 = extract_mock_oa('Accenture MOCK OA -1.pdf', 'Mock OA 1')
oa2 = extract_mock_oa('Accenture mock OA -2 .pdf', 'Mock OA 2')

# Print statistics of questions with identified correct_id
oa1_solved = sum(1 for q in oa1 if q['correct_id'])
oa2_solved = sum(1 for q in oa2 if q['correct_id'])
print(f"\nOA 1: {oa1_solved}/{len(oa1)} questions have identified correct option")
print(f"OA 2: {oa2_solved}/{len(oa2)} questions have identified correct option")

# Sample from OA1
if oa1:
    print("\nSample OA 1 Q1:")
    print(json.dumps(oa1[0], indent=2))
    print("\nSample OA 1 Q2:")
    print(json.dumps(oa1[1], indent=2))
