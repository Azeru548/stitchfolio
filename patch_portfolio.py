#!/usr/bin/env python3
"""Usage: python3 patch_all.py index.html  ->  writes index.new.html (original untouched).
Applies: hero/positioning, security-first order, stack + experience updates, static flex project cards,
lighter icon font, off-screen render skipping."""
import re, sys

src = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = open(src, encoding="utf-8").read()


def rep(old, new, count=1):
    """Replace `count` matches exactly; whitespace runs in `old` match any whitespace."""
    global s
    pat = r"\s+".join(re.escape(t) for t in old.split())
    n = len(re.findall(pat, s))
    assert n == count, f"expected {count} match(es), found {n}: {old[:60]!r}"
    s = re.sub(pat, lambda m: new, s)


# ---------- 1. Hero ----------
rep("Systems that hold", "I take systems apart,")
rep("under real load.", "then build ones that hold.")
rep("Software engineer and security researcher building secure product platforms, "
    "intelligent automation, and on-chain agent infrastructure — with clean architecture and measurable outcomes.",
    "Security researcher and software engineer. I reverse-engineer real malware and apps, "
    "publish the evidence, and build AI and on-chain products on Solana and Sui with the same threat-model discipline.")
rep("Fullstack · AI · Web3", "Security · Web3 · AI")
rep("Products · Intelligence · On-chain", "Reverse engineering · On-chain · Products")

# ---------- 2. Metrics (static values so the counter never shows 0) ----------
rep('data-count="8">0<', 'data-count="8">8<')
rep('<div class="metrics__value">Sui Move</div>', '<div class="metrics__value">Solana · Sui</div>')
rep('<div class="metrics__value">Security</div>', '<div class="metrics__value" data-count="3">3</div>')
rep('<div class="metrics__label">Cybersecurity degree</div>', '<div class="metrics__label">Published RE reports</div>')

# ---------- 3. Nav + step dots ----------
rep('<a href="#security">Security</a>', "")
rep('<a href="index.html" class="is-active">Home</a>',
    '<a href="index.html" class="is-active">Home</a>\n        <a href="#security">Security</a>')
rep('<a href="#security" data-dot="security" data-label="Security"></a>', "")
rep('<a href="#top" data-dot="intro" data-label="Intro" class="is-active"></a>',
    '<a href="#top" data-dot="intro" data-label="Intro" class="is-active"></a>\n'
    '    <a href="#security" data-dot="security" data-label="Security"></a>')

# ---------- 4. Security section above capabilities ----------
a = s.index("    <!-- SECURITY RESEARCH -->")
b = s.index("    <!-- EXPERIENCE -->")
blk = s[a:b]
s = s[:a] + s[b:]
c = s.index("    <!-- CAPABILITIES -->")
s = s[:c] + blk + s[c:]

# ---------- 5. Capability cards ----------
rep("<h3>Security mindset</h3>", "<h3>Security research &amp; engineering</h3>")
rep("OAuth/JWT, secure API design, secret sanitization before LLM calls, capability-based ownership on Sui, "
    "and threat-aware engineering.",
    "Malware analysis and reverse engineering with published IOCs and YARA rules, plus OAuth/JWT, secure API design, "
    "secret sanitization before LLM calls, and capability-based ownership on Sui.")
rep("<h3>Web3 &amp; Sui Move</h3>", "<h3>Web3 · Solana &amp; Sui</h3>")
rep("Sui-native smart contracts, programmable", "Rust/Anchor programs on Solana, Sui Move contracts, programmable")

g0 = s.index('<div class="cap-grid">')
g1 = s.index("<!-- WORK -->")
region = s[g0:g1]
arts = list(re.finditer(r'<article class="card card--lift card--tilt cap-card.*?</article>', region, re.S))
assert len(arts) == 6, len(arts)
order = ["Security research", "Web3", "AI × on-chain", "AI &amp; LLM", "Backend", "Fullstack"]
def key(m):
    h = re.search(r"<h3>(.*?)</h3>", m.group(0)).group(1)
    return next(i for i, o in enumerate(order) if h.startswith(o))
ordered = [m.group(0) for m in sorted(arts, key=key)]
region = region[:arts[0].start()] + "\n          ".join(ordered) + region[arts[-1].end():]
s = s[:g0] + region + s[g1:]

# ---------- 6. Security section wording ----------
rep("YARA rules. No CTFs, no toy binaries.",
    "YARA rules. No CTFs, no toy binaries. NGL and Grindr are analysed from their publicly distributed apps; "
    "claims stay limited to what the code shows.")
rep("a scheduled timer that pushes one fake message.",
    "a scheduled timer in the decompiled code that triggers one message.")

# ---------- 7. Experience ----------
rep('<div class="timeline">', '''<div class="timeline">
              <div class="timeline__item">
                <time>Independent</time>
                <h3>Security Researcher</h3>
                <p class="org">Self-directed · malware.kennedyazeru.space</p>
                <ul>
                  <li>Published three investigations of real specimens — a VB6 replicator, NGL and Grindr’s ad-tech stack — covering timeline, mechanism and detection.</li>
                  <li>Released source, IOCs and YARA rules for the replicator report on GitHub.</li>
                </ul>
              </div>
              <div class="timeline__item">
                <time>Independent</time>
                <h3>Web3 Builder</h3>
                <p class="org">Solana &amp; Sui · Superteam Nigeria community</p>
                <ul>
                  <li>Builds on Solana with Rust/Anchor and on Sui with Move; shipped DSpace, a hybrid dApp with on-chain pods and in-chat SUI transfers.</li>
                  <li>Active in the Superteam Nigeria ecosystem through hackathon and bounty work.</li>
                </ul>
              </div>''')

# ---------- 8. Stack tiles + JSON-LD ----------
rep("<h4>Web3 · Sui</h4>", "<h4>Web3 · Solana &amp; Sui</h4>")
rep("<li>Move smart contracts</li>", "<li>Rust · Anchor (Solana)</li>\n                  <li>Move smart contracts</li>")
rep("<li>Agent treasuries · x402</li>", "<li>Agent treasuries · x402 · wallet auth</li>")
rep("<li>Wallet auth · settlement</li>", "")
rep("<li>API hardening</li>",
    "<li>API hardening</li>\n                  <li>Malware analysis · YARA</li>\n                  <li>Reverse engineering</li>")
rep('"Software Engineer", "Security Researcher"', '"Security Researcher", "Software Engineer"')
rep('"Sui Move",', '"Sui Move",\n    "Rust",\n    "Anchor",\n    "Solana",')

# ---------- 9. Work section -> static flex cards (no iframes, no video, no tilt/lift/reveal) ----------
ARROW = "→"
P = [
    ("Social dApp", "DSpace", "SuiPod Chat — hybrid decentralized collab: wallet identity, on-chain pods, Firebase realtime messaging, and in-chat SUI transfers.",
     ["React", "Sui dapp-kit", "Firebase"], [("Case study", "dspace.html", 0)]),
    ("AI · CAD", "Cgen", "Natural language → validated STEP/STL CAD files. Groq specs, Pydantic guardrails, deterministic CadQuery geometry.",
     ["Python", "Groq", "CadQuery"], [("Live preview", "projects.html#proj-cgen", 0)]),
    ("SaaS · Attendance", "Present", "Geo + face-verified lecture attendance. Next.js and Firebase with on-device recognition — faces never leave the browser.",
     ["Next.js", "Firebase", "MediaPipe"], [("Live preview", "projects.html#proj-present", 0)]),
    ("Fraud detection", "Asguard", "Real-time transaction fraud pipeline combining rule-based scoring with AI risk assessment. Flags high-risk events and generates natural-language summaries at sub-second latency.",
     ["Rule scoring", "AI risk"], [("Architecture notes", "asguard.html", 0), ("Live ↗", "https://asguard.netlify.app", 1)]),
    ("Enterprise RAG", "Azeru", "Document intelligence that ingests PDFs into chunked, embedded knowledge bases. Semantic retrieval powers citation-backed answers for knowledge-heavy workflows.",
     ["RAG", "Embeddings"], [("Architecture notes", "azeru.html", 0)]),
    ("Real estate SaaS", "Hauser", "Property marketplace for the Nigerian market with role-aware onboarding, dynamic listings, real-time Firestore sync, and click analytics for premium tiers.",
     ["Firestore", "Marketplace"], [("Architecture notes", "hauser.html", 0), ("Live ↗", "https://hauserhomes.xyz", 1)]),
    ("Verification", "Vouch", "Point your phone at a pack: NAFDAC/PPB registry verdicts with vision-AI reads, hazard alerts and community reports.",
     ["JavaScript", "Vision AI"], [("Live preview", "projects.html#proj-vouch", 0)]),
    ("Enterprise", "Absolute Energy", "Corporate website for an oil &amp; gas enterprise client — company profile, service lines and enquiry capture.",
     ["Corporate site", "Responsive"], [("Live preview", "projects.html#proj-energy", 0)]),
]


def card(chip, title, blurb, tags, links):
    t = "".join(f'<span class="chip chip--neutral">{x}</span>' for x in tags)
    l = "".join(
        f'<a class="btn btn--link" href="{h}"' + (' target="_blank" rel="noopener"' if e else "") + f">{n}{'' if e else ' ' + ARROW}</a>"
        for n, h, e in links)
    return (f'<article class="card proj-card"><span class="chip">{chip}</span><h3>{title}</h3><p>{blurb}</p>'
            f'<div class="proj-mini__tags">{t}</div><div class="proj-card__links">{l}</div></article>')


work = f'''    <!-- WORK -->
    <section class="section" id="work" data-step data-dot="work">
      <div class="shell">
        <div class="section-head">
          <div>
            <span class="eyebrow">Selected work</span>
            <h2 class="display">Case studies worth opening</h2>
          </div>
          <a href="projects.html" class="btn btn--link">Full project index {ARROW}</a>
        </div>
        <div class="proj-flex">
          {chr(10).join("          " + card(*p) for p in P).strip()}
        </div>
      </div>
    </section>
'''
a = s.index("    <!-- WORK -->")
b = s.index("\n    <!-- ", a + 10) + 1
s = s[:a] + work + "\n" + s[b:]

# ---------- 10. Performance: lighter icon font + skip off-screen rendering ----------
rep("family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0",
    "family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
    "&icon_names=account_tree,database,layers,psychology,shield,sync,token")

css = """  <style>
    #capabilities, #experience, #beyond, #services-teaser, #contact {
      content-visibility: auto; contain-intrinsic-size: auto 800px;
    }
    .proj-flex { display: flex; flex-wrap: wrap; gap: 1rem; }
    .proj-card { flex: 1 1 300px; max-width: calc((100% - 2rem) / 3); padding: 1.25rem;
      display: flex; flex-direction: column; gap: .6rem;
      transform: none !important; transition: none !important; animation: none !important; opacity: 1 !important; }
    .proj-card p { margin: 0; }
    .proj-card .proj-mini__tags { display: flex; flex-wrap: wrap; gap: .4rem; }
    .proj-card__links { margin-top: auto; padding-top: .5rem; display: flex; flex-wrap: wrap; gap: 1rem; }
    .proj-card a:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
    @media (max-width: 960px) { .proj-card { max-width: calc((100% - 1rem) / 2); } }
    @media (max-width: 620px) { .proj-card { max-width: 100%; } }
  </style>
</head>"""
rep("</head>", css)

out = src.rsplit(".", 1)[0] + ".new.html"
open(out, "w", encoding="utf-8").write(s)
print("wrote", out)