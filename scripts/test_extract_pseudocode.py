import pypdf
import sys
import re
import json

sys.stdout.reconfigure(encoding='utf-8')

r = pypdf.PdfReader('Accenture Pseudo code.pdf')
print(f"Total pages: {len(r.pages)}")

pseudo_questions = []

# Pages 2 and 3, 4 and 5, ..., 52 and 53
for p_idx in range(1, len(r.pages), 2):
    q_page = r.pages[p_idx].extract_text()
    ans_page = r.pages[p_idx+1].extract_text() if p_idx + 1 < len(r.pages) else ""
    
    # Extract Answer and Explanation from ans_page
    ans_m = re.search(r'Answer:\s*([A-D])[\)\.]?\s*(.*?)(?:\n|Explanation:|$)', ans_page, re.IGNORECASE)
    correct_id = ans_m.group(1).upper() if ans_m else None
    ans_text_short = ans_m.group(2).strip() if ans_m else ""
    
    exp_m = re.search(r'Explanation:\s*(.*)', ans_page, re.DOTALL | re.IGNORECASE)
    explanation = exp_m.group(1).strip() if exp_m else ""
    
    # Extract Question and Options from q_page
    lines = [l.strip() for l in q_page.split('\n') if l.strip()]
    stem_lines = []
    opts = {}
    
    for l in lines:
        if l.lower() in ['accenture pseudo code', 'prime coding', 'accenture']:
            continue
        opt_m = re.match(r'^([A-D])[\)\.]\s*(.*)', l, re.IGNORECASE)
        if opt_m:
            opts[opt_m.group(1).upper()] = opt_m.group(2).strip()
        elif not opts:
            stem_lines.append(l)
        else:
            last_k = list(opts.keys())[-1]
            opts[last_k] += " " + l
            
    stem = '\n'.join(stem_lines).strip()
    correct_text = opts.get(correct_id, ans_text_short) if correct_id else ""
    
    if stem and len(opts) >= 2:
        pseudo_questions.append({
            "sourcePage": p_idx + 1,
            "answerPage": p_idx + 2,
            "stem": stem,
            "options": opts,
            "correct_id": correct_id,
            "correct_text": correct_text,
            "explanation": explanation
        })

print(f"Extracted {len(pseudo_questions)} pseudocode questions!")
if pseudo_questions:
    print("Sample Q1:")
    print(json.dumps(pseudo_questions[0], indent=2))
    print("Sample Q2:")
    print(json.dumps(pseudo_questions[1], indent=2))
