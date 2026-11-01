import re
from pypdf import PdfReader

r = PdfReader("Kennedy_Chinwo_Resume.pdf")

for pno, page in enumerate(r.pages, 1):
    s = page.get_contents().get_data().decode("latin-1")
    # each positioned run: BT ... Tf ... Tm ... [ ... ] TJ ... ET
    blocks = re.findall(r'\[(.*?)\]\s*TJ', s, re.S)
    texts = ["".join(p[1:-1] for p in re.findall(r'\((?:\\.|[^()\\])*\)', b)) for b in blocks]
    full = "|".join(texts)
    for i, t in enumerate(texts):
        if "org" in t or "cyber" in t or "pixelpro" in t or "dspace1" in t or "aya5" in t:
            nb = texts[i-1] if i else ""
            na = texts[i+1] if i+1 < len(texts) else ""
            print(f"p{pno} [{i}] {t!r}   prev={nb!r} next={na!r}")
    print()
