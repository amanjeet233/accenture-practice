import zipfile
import xml.etree.ElementTree as ET
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

z = zipfile.ZipFile('Accenture MS office.pptx')
s2 = z.read('ppt/slides/slide2.xml').decode('utf-8')
s3 = z.read('ppt/slides/slide3.xml').decode('utf-8')

print("Slide 2 colors:", set(re.findall(r'srgbClr val="([0-9A-Fa-f]{6})"', s2)))
print("Slide 3 colors:", set(re.findall(r'srgbClr val="([0-9A-Fa-f]{6})"', s3)))

# Find which text has color in slide 3
root3 = ET.fromstring(s3)
for p in root3.iter():
    if p.tag.endswith('}r'):
        color = None
        for clr in p.iter():
            if clr.tag.endswith('}srgbClr'):
                color = clr.attrib.get('val')
        t_elem = None
        for t in p.iter():
            if t.tag.endswith('}t'):
                t_elem = t.text
        if color and t_elem:
            print(f"Slide 3 Colored text: color={color}, text={t_elem}")
