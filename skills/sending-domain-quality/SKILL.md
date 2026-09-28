---
name: sending-domain-quality
description: >-
  Score a sending domain on TLD, name quality, age, and reputation for cold
  outbound. Use when the user asks if a domain is good for sending, about TLD
  quality, domain reputation/blacklist, which domain to buy for outbound, or to
  audit cold domains. No OutboundSync API key.
license: MIT
compatibility: >-
  Read-only RDAP + public DNSBL lookups (no key). Optional GOOGLE_WEB_RISK_KEY /
  VIRUSTOTAL_API_KEY / WHOISXML_API_KEY for reputation scoring.
metadata:
  author: outboundsync
  version: "1.1.0"
---

# Sending domain quality

Run **read-only**. RDAP + public DNS/DNSBL (and optional reputation APIs). Never buy, transfer, or reconfigure domains. Never print API keys.

Render **only** the fixed output shape in this skill — no prose outside it.

**Note:** These instructions reflect OutboundSync best practices shared freely and without warranty of outcomes — see [DISCLAIMER.md](https://github.com/outboundsync/skills/blob/main/DISCLAIMER.md).

## Scope and safety

- Score one or more candidate or active **sending** domains for cold outbound.
- Read-only. No registrar writes, no DNS mutations, no ESP changes.
- **Unverified ≠ empty.** Failed RDAP, DNSBL, HTTP, or optional API calls are **UNVERIFIED** — never a silent ✓ pass and never invent "clean" or "not listed" from a failed query.
- Name/TLD are **secondary**. Authentication, engagement, and complaint rate dominate placement. Always surface that caveat in the output.

## How to look this up

1. **TLD / name** — parse the domain string (no network required for the lexical rubric).
2. **Age** — RDAP creation/registration date for the domain. See [references/lookup-methods.md](references/lookup-methods.md).
3. **Reputation** — DNSBL queries (Spamhaus DBL, SURBL, URIBL style) via DNS —
   **not** through public/open resolvers (Google/Cloudflare/DoH), which these lists
   block with `127.255.255.x` error codes that are **not** listings; read a listing
   only from the list's documented range and treat error codes as UNVERIFIED (see
   [references/lookup-methods.md](references/lookup-methods.md)).
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

GitHub-flavored markdown only. Render only this shape; no prose outside it. This is the pack's [status layout](https://github.com/outboundsync/skills/blob/main/CONVENTIONS.md#status-layout--required-for-readiness-health-and-audit-skills):

1. `##` is the verdict: `Domain fit for cold send` | `Domain risky for cold send` | `Domain quality unverified`.
2. A fenced `text` gauge follows immediately — always, even for one domain: an `Overall` row, then one row per domain. Pad labels so bars align.
3. One `###` card per domain, in gauge order, opening with a backtick context line.
4. Every bullet starts with its mark: `✓` pass · `·` warn · `✗` fail · `· UNVERIFIED — <reason>` when a lookup failed. One check per bullet; blank line between blocks. No colored emoji, no ASCII boxes.
5. End each card with the dominance caveat as a `·` bullet (once under Next instead when there are several domains).
6. `### Next` when any ✗, UNVERIFIED, or actionable · exists.

**Gates per domain** (4): TLD · name · age · reputation, following the verdict logic below.

- TLD and non-deceptive name `·` warnings **pass** (advisory). A deceptive-lookalike name fails.
- Age and reputation pass only on `✓`; their `·` fills `░` (warn ≠ fit for cold outbound).
- `UNVERIFIED` fills `▒`.
- Bar: `█` = round(passed / 4 × 20), `▒` = round(unverified / 4 × 20), `░` = the rest. Overall sums the gates of every domain with at least one verified gate; a wholly UNVERIFIED domain is left out of `<t>` and counted in the suffix, which counts domains.
- Row text: `<✓ | · | ✗> <passed>/4[ · <n> unverified]` — the mark is the domain's operational overall. Overall: `<passed>/<t> · <fit | risky | unverified>[ · <n> unverified]`, omitting the suffix when the verdict is already unverified.

### Shape

````markdown
## <Domain fit for cold send | Domain risky for cold send | Domain quality unverified>

```text
Overall     <bar>  <p>/<t> · <verdict>[ · <n> unverified]

<domain>    <bar>  <✓ | · | ✗> <p>/4[ · <n> unverified]
```

### <domain>
`created <date | unknown> · <n> days old · <brand site | redirect target | parked>`

- <✓ | · | ✗> TLD — .<tld> <gold | acceptable | warn | elevated-risk>[ · portfolio risky-fraction <n>%]
- <✓ | · | ✗> Name — <short rationale>
- <✓ | · | ✗> Age — <n> days before first send — <gate note>
- <✓ | · | ✗> Reputation — <blocklist and redirect summary>
- · Caveat: name and TLD are secondary — authentication, engagement, and complaint rate dominate placement

### Next
1. <shortest action tied to a ✗ or UNVERIFIED above>
````

Replace any line whose lookup failed with `· UNVERIFIED — <factor> lookup failed (<error>)`. Worked examples: [references/examples.md](references/examples.md).

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
