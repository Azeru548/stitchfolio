import re
from pypdf import PdfReader

r = PdfReader("Kennedy_Chinwo_Resume.pdf")
page = r.pages[0]
s = page.get_contents().get_data().decode("latin-1")

# font width tables (units/1000)
def widths(fontobj):
    f = fontobj.get_object()
    fc, w = f.get("/FirstChar"), f.get("/Widths")
    if not w:
        return None
    return {chr(c): w[c - fc] for c in range(fc, f.get("/LastChar") + 1)}

W = {}
for k, v in page["/Resources"]["/Font"].items():
    ww = widths(v)
    if ww:
        W[k] = ww

# walk blocks keeping Tm + Tf size
pat = re.compile(r'BT\s*/(F\d+)\s+([\d.]+)\s+Tf\s*1 0 0 1 ([\d.-]+) ([\d.-]+) Tm\s*\[(.*?)\]\s*TJ', re.S)
for i, m in enumerate(pat.finditer(s)):
    font, size, x, y, body = m.group(1), float(m.group(2)), float(m.group(3)), float(m.group(4)), m.group(5)
    chunks = re.findall(r'\((?:\\.|[^()\\])*\)|-?\d+(?:\.\d+)?', body)
    txt = "".join(c[1:-1] for c in chunks if c.startswith("("))
    if 8 <= i <= 16:
        wtab = W.get("/" + font, {})
        tw = sum(wtab.get(ch, 500) for ch in txt) / 1000.0 * size
        print(f"[{i}] {font} {size}pt @({x},{y}) text={txt!r} width={tw:.2f}pt")
