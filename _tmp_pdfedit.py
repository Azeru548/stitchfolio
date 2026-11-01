import re, shutil, sys
from pypdf import PdfReader

SRC = "Kennedy_Chinwo_Resume.pdf"
BAK = ".git/Kennedy_Chinwo_Resume.ORIGINAL.pdf"
shutil.copy2(SRC, BAK)
print("backup ->", BAK)

r = PdfReader(SRC)
total = {"org": 0, "cyber": 0, "netlify": 0}

for page in r.pages:
    data = page.get_contents().get_data()
    s = data.decode("latin-1")

    def fix_tj(m):
        body = m.group(1)
        chunks = re.findall(r'\((?:\\.|[^()\\])*\)|-?\d+(?:\.\d+)?', body)
        texts = [c for c in chunks if c.startswith("(")]
        flat = "".join(t[1:-1] for t in texts)

        # 1) github.com/org-cyber  ->  github.com/Azeru548   (same length)
        if flat == "github.com/org" or flat == "/org":
            chunks = ["(Azeru)" if c == "(org)" else c for c in chunks]
            total["org"] += 1
        elif flat == "cyber":
            chunks = ["(548)" if c == "(cyber)" else c for c in chunks]
            total["cyber"] += 1
        # 2) pixelpro001.netlify.app -> kennedyazeru.space (shorter; drop one kern)
        elif flat == "pixelpro001.netlify.app":
            out, seen = [], False
            for c in chunks:
                if c.startswith("("):
                    continue
                if not seen and c == "5":      # kern that preceded old text
                    seen = True
                    continue
                out.append(c)
            out.append("(kennedyazeru.space)")
            chunks = out
            total["netlify"] += 1
        return "[" + "".join(chunks) + "] TJ"

    s2 = re.sub(r'\[(.*?)\]\s*TJ', fix_tj, s, flags=re.S)
    if s2 != data.decode("latin-1"):
        page.get_contents().set_data(s2.encode("latin-1"))

print("replacements:", total)
r2 = PdfReader(SRC)
txt = "\n".join((p.extract_text() or "") for p in r2.pages)
print("pages:", len(r2.pages))
print("stale 'org-cyber' remaining:", txt.count("org-cyber"))
print("stale 'pixelpro001' remaining:", txt.count("pixelpro001"))
print("'Azeru548' occurrences:", txt.count("Azeru548"))
print("\n--- all URL-ish tokens ---")
for u in sorted(set(re.findall(r'[\w.-]+\.(?:com|app|xyz|space|io|dev)[\w./-]*', txt))):
    print("   ", u)
