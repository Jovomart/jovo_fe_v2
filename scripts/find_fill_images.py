import re
from pathlib import Path
root = Path(__file__).resolve().parent.parent
pattern = re.compile(r'<Image\b[^>]*\bfill\b[^>]*>', re.S)
for f in sorted(root.glob('app/**/*.tsx')):
    text = f.read_text(encoding='utf-8')
    for m in pattern.finditer(text):
        tag = m.group(0)
        if 'sizes=' not in tag:
            print(f"{f.relative_to(root)}")
            print(tag.strip().replace('\n', ' '))
            print('---')
