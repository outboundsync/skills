---
name: sending-domain-quality
description: >-
  Score a sending domain on TLD, name quality, age, and reputation for cold
  outbound. Use when the user asks if a domain is good for sending, about TLD
  quality, domain reputation/blacklist, which domain to buy for outbound, or to
  audit cold domains.
license: MIT
compatibility: >-
  Read-only RDAP + public DNSBL lookups (no key). Optional GOOGLE_WEB_RISK_KEY /
  VIRUSTOTAL_API_KEY / WHOISXML_API_KEY for reputation scoring.
metadata:
  author: outboundsync
  version: "1.0.0"
---

# Sending domain quality

Run **read-only**. RDAP + public DNS/DNSBL (and optional reputation APIs). Never buy, transfer, or reconfigure domains. Never print API keys.

Render **only** the fixed output shape in this skill — no prose outside it.

## Scope and safety

- Score one or more candidate or active **sending** domains for cold outbound.
- Read-only. No registrar writes, no DNS mutations, no ESP changes.
- **Unverified ≠ empty.** Failed RDAP, DNSBL, HTTP, or optional API calls are **UNVERIFIED** — never a silent ✓ pass and never invent "clean" or "not listed" from a failed query.
- Name/TLD are **secondary**. Authentication, engagement, and complaint rate dominate placement. Always surface that caveat in the output.

## How to look this up

1. **TLD / name** — parse the domain string (no network required for the lexical rubric).
2. **Age** — RDAP creation/registration date for the domain. See [references/lookup-methods.md](references/lookup-methods.md).
3. **Reputation** — DNSBL queries (Spamhaus DBL, SURBL, URIBL style) via DNS;
   HTTP check that the cold domain resolves to a legitimate branded property or
   redirects to the brand site (a 301/308 is preferred, not mandatory).
   Optional: Google Web Risk, VirusTotal, WhoisXML/IPQS when keys exist.
4. **Lookalike risk** — lexical check + optional permutation ideas (dnstwist-style) against the user's brand and known third parties; never claim a full Internet scan without tooling.

Detailed bands: [references/tld-rubric.md](references/tld-rubric.md), [references/name-rubric.md](references/name-rubric.md), [references/age-and-reputation.md](references/age-and-reputation.md).

## Four-factor rubric

Score each factor `✓` pass · `·` warn · `✗` fail · `UNVERIFIED`. Treat TLD
and non-deceptive lexical-name warnings as **advisory**; they do not lower the
operational overall verdict by themselves. A high-abuse TLD alone is not proof
that a specific domain has bad reputation. Reserve ✗ for deceptive lookalikes,
confirmed reputation listings, or a domain too fresh for the planned send
policy. UNVERIFIED operational factors do not count as ✓.

### 1. TLD

| Band | TLDs |
|------|------|
| ✓ gold | `.com` |
| ✓ acceptable | `.io` `.co` `.net` `.ai` |
| · warn | `.org` `.us` `.biz` `.info` |
| · elevated-risk | `.xyz` `.top` `.click` `.buzz` `.cam` · historically high-abuse ccTLDs `.tk` `.ml` `.ga` `.cf` `.gq` `.pw`; verify the specific domain rather than inferring reputation from TLD |

**Risky-fraction** (share of domains in the user's outbound set on
high-abuse TLDs) is advisory portfolio context: **&lt;5%** low · **5–30%**
moderate · **&gt;30%** high. It never proves that an individual domain is listed
or unsafe.

### 2. Name

✓ short, pronounceable, no hyphens/digits/keyword-stuffing; brand-adjacent on
**own** brand is fine (`getbrand.com`, `trybrand.com`, `brandmail.com`).

✗ lookalike of **another** company; misspelling of own brand; heavy hyphen/number/spammy-token patterns.

· borderline length, one hyphen on an otherwise clear own-brand name (for
example `brand-hq.com`), minor pronounceability issues.

### 3. Age (RDAP)

| Result | Criteria |
|--------|----------|
| ✓ | Created **≥14 days** before planned/first send (conservative operational minimum) |
| · | 5–13 days old — fresh; age and test conservatively |
| ✗ | **&lt;5 days** and the user plans immediate production sending |
| UNVERIFIED | RDAP/whois lookup failed |

Some recipient filters may treat domains younger than roughly 14 days as
fresh; this is not a universal Microsoft hard gate. Age is a weak proxy —
reputation and auth dominate. Say so; do not over-weight age.

### 4. Reputation

| Result | Criteria |
|--------|----------|
| ✓ | Clean on checked domain blocklists; URL reputation clean (or optional APIs clean); apex resolves to legitimate brand content or redirects to the real brand site |
| · | Soft reputation signals; 404/parked/for-sale landing; odd redirect chain; advisory-only list hits |
| ✗ | Listed on DBL/SURBL/URIBL (or equivalent confirmed hit); malware/phishing flags from optional URL-reputation tools |
| UNVERIFIED | DNSBL or HTTP/API check failed |

No first-party domain-reputation MCP is assumed — use DNS/HTTP/optional keys.

## Output contract

GitHub-flavored markdown only. Layout is the spec:

1. `##` verdict: `Domain fit for cold send` | `Domain risky for cold send` | `Domain quality unverified`.
2. Optional ```text``` glance when scoring multiple domains.
3. One `###` card per domain with **4-factor scores + overall**.
4. Blank line between blocks. Every status line is a `-` bullet. Never two checks on one line.
5. Marks: ✓ · ✗ · UNVERIFIED. No colored emoji, no ASCII boxes.
6. Always include the dominance caveat as a final `·` bullet on each card (or once under Next when multi-domain).
7. `### Next` when any ✗, UNVERIFIED, or actionable ·.

### Shape

````markdown
## <Domain fit for cold send | Domain risky for cold send | Domain quality unverified>

```text
<domain>  TLD=<mark> Name=<mark> Age=<mark> Rep=<mark>  overall <✓|·|✗|UNVERIFIED>
```

### <domain>
`TLD · name · age · reputation`

- TLD: <✓/·/✗> <tld> — <gold|acceptable|warn|fail>[; portfolio risky-fraction <n>%]
- Name: <✓/·/✗> <short rationale>
- Age: <✓/·/✗/UNVERIFIED> <created date or failure> — <gate note>
- Reputation: <✓/·/✗/UNVERIFIED> <blocklist/redirect summary>
- Overall: <✓|·|✗|UNVERIFIED>
- · Caveat: name/TLD secondary — auth, engagement, and complaint rate dominate placement

### Next
1. <shortest action tied to a ✗ or UNVERIFIED above>
````

### Verdict logic (compute, never print as its own section)

- Per domain **operational overall**: any confirmed deceptive-name,
  freshness-for-immediate-send, or reputation ✗ → overall ✗; else any
  age/reputation UNVERIFIED → overall UNVERIFIED; else any actionable
  age/reputation · → overall ·; else overall ✓. TLD and non-deceptive lexical
  name · remain visible advisories but do not lower operational overall.
- Headline **Fit** only if every in-scope domain has overall ✓.
- Any overall ✗ → **risky**. Any overall UNVERIFIED (and no ✗) → **unverified**.
  Overall · from age/reputation (no ✗/UNVERIFIED) → **risky** (cold outbound
  bar: warn ≠ fit). A TLD or non-deceptive name · alone does **not** make the
  headline risky.
- Failed lookups never count as clean.
