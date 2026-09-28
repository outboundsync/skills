---
name: email-authentication
description: >-
  Audit SPF, DKIM, DMARC (and MX, PTR, BIMI, MTA-STS, TLS-RPT) for one or more
  sending domains. Use when the user asks to check SPF/DKIM/DMARC, email
  authentication, whether a domain is authenticated, why SPF is failing, or to
  audit DNS for a sending domain. No OutboundSync API key.
license: MIT
compatibility: >-
  Uses read-only public DNS lookups via the agent's shell/HTTP (no key).
  Optional MXTOOLBOX_API_KEY or a DNS MCP for richer checks.
metadata:
  author: outboundsync
  version: "1.1.0"
---

# Email authentication audit

Run **read-only**. Public DNS lookups only (shell/HTTP). Never mutate DNS, registrar settings, or ESP config. Never print API keys. Never invent empty TXT/MX results from a failed lookup.

Render **only** the fixed output shape in this skill — no prose outside it.

**Note:** These instructions reflect OutboundSync best practices shared freely and without warranty of outcomes — see [DISCLAIMER.md](https://github.com/outboundsync/skills/blob/main/DISCLAIMER.md).

## Scope and safety

- Evaluate one or more sending domains supplied by the user (or discovered from context). Ask which domain(s) if ambiguous.
- Read-only DNS. No zone edits, no ESP writes, no "fix it for me" mutations.
- Optional paid/API tools are enrichment only — default path is free DoH/`dig`.
- **Unverified ≠ empty.** If a lookup fails (timeout, NXDOMAIN ambiguity from resolver error, HTTP 5xx, missing key for an optional API you attempted), mark that record **UNVERIFIED**. Never treat a failed lookup as a silent ✓ pass or as "record absent."

## 2024 bulk-sender rules (Gmail / Yahoo)

Google and Yahoo's Feb-2024 requirements make **DMARC** (at minimum `p=none` with alignment) mandatory for bulk senders (~5,000+ messages/day to their users), alongside one-click **List-Unsubscribe** (RFC 8058 `List-Unsubscribe: <mailto>, <https>` + `List-Unsubscribe-Post`) and a spam-complaint rate kept **under 0.3%** (Postmaster Tools). This skill audits the DNS half (SPF/DKIM/DMARC + alignment); the List-Unsubscribe header and complaint rate are set at the **ESP**, not in DNS — report them as **out-of-band checks** (`UNVERIFIED` here), never as DNS records. True 1:1 cold outbound usually sits below the bulk threshold, but DMARC and one-click unsubscribe are still recommended for cold B2B.

## How to look this up

Default free path (prefer in order):

1. Cloudflare DoH: `GET https://cloudflare-dns.com/dns-query?name=<fqdn>&type=TXT` with `Accept: application/dns-json`
2. Google DoH: `GET https://dns.google/resolve?name=<fqdn>&type=TXT`
3. Shell: `dig +short TXT <fqdn>` (also `MX`, `A`/`AAAA`, `CNAME`, `TLSA` as needed)

Recursively expand SPF `include:` / `a` / `mx` / `exists` / `redirect=` to count DNS lookups. See [references/lookup-methods.md](references/lookup-methods.md) for record FQDNs, SPF lookup counting, optional APIs, and probe selectors.

## Alignment (evaluate this, not just record presence)

DMARC **authentication** for a message passes only if **either**:

1. **SPF-pass** AND the RFC5321 MAIL FROM (or HELO) **aligns** with the visible RFC5322 From domain (organizational-domain or exact per `adkim`/`aspf`), **or**
2. **DKIM-pass** AND the DKIM `d=` domain **aligns** with the visible From domain.

A domain can have valid SPF/DKIM records and still fail DMARC on real mail if alignment is wrong (common with shared ESP return-paths or wrong DKIM `d=`). When message headers are unavailable, report **record health** separately from **alignment verdict**: mark alignment `UNVERIFIED — no sample headers` rather than inventing pass.

## Rubric — pass · warn · fail

Marks: `✓` pass · `·` warn · `✗` fail · `UNVERIFIED` lookup failed. One check per bullet.

### SPF (`TXT` at the domain apex)

| Result | Criteria |
|--------|----------|
| ✓ | Exactly one `v=spf1` TXT; ≤7 DNS lookups; ≤1 void lookup; ends `~all` or `-all`; no `ptr`; mechanisms resolve |
| · | 8–10 DNS lookups; 2 void lookups; ends `?all`; deprecated `ptr` mechanism; soft issues that still publish |
| ✗ | Successful TXT query finds zero `v=spf1` (missing); **2+** `v=spf1` TXT records (**PermError**); >10 lookups; `+all`; syntax that yields PermError |
| UNVERIFIED | TXT query failed |

Never recommend SPF flattening. Flag `ptr` as deprecated. Count lookups per RFC 7208 (includes, a, mx, ptr, exists, redirect).

### DKIM (`TXT` at `<selector>._domainkey.<domain>`)

| Result | Criteria |
|--------|----------|
| ✓ | Key found; valid version/algorithm tags when present; valid `p=` (not empty/revoked); **≥2048-bit** RSA |
| · | Valid key but **1024-bit** RSA; minor tag oddities that still verify; **successful DNS probes found no key at listed selectors** (selector may be custom) |
| ✗ | Empty/`p=` revoked; malformed; known-broken key material when verifiable; user/provider-named active selector is absent |
| UNVERIFIED | Resolver/API **failure** while probing (timeout, SERVFAIL, HTTP error) — distinct from a successful empty answer |

Probe common selectors: `google`, `selector1`, `selector2`, `s1`, `s2`, `k1`, `dkim`, plus any selector the user or ESP docs name.

**Never** declare "DKIM missing" after guessed selectors. Prefer a selector
from sample headers or the sending provider. If DNS answers successfully but
none of the fallback probes return a key, report:
`· DKIM not found at probed selectors (<list>); selector may be custom` —
not ✗ missing and not UNVERIFIED. Reserve UNVERIFIED for lookup failures. If
the user/provider gives a specific active selector and it is absent, mark ✗
for that selector.

### DMARC (`TXT` at `_dmarc.<domain>`)

| Result | Criteria |
|--------|----------|
| ✓ | Present; `v=DMARC1` is first tag; `p=` present; `rua=` present; policy appropriate for domain maturity |
| · | Present with `p=none` on a mature brand domain; missing `rua`; weak `sp=`/`np=` vs org policy; young cold domain still on `p=none` (acceptable — do not push reject) |
| ✗ | Missing DMARC entirely (**distinct reportable state**); `v=DMARC1` not first; no `p=`; invalid syntax |
| UNVERIFIED | `_dmarc` TXT query failed |

Policy staircase: `none` → `quarantine` → `reject`. **Do not** recommend jumping to `p=reject` or `p=quarantine` on a young cold outbound domain. Honor `sp=` / `np=` for subdomains when present.

### MX (role-dependent)

| Role | ✓ | · | ✗ |
|------|---|---|---|
| Reply-receiving cold domain | Valid MX → resolvable hosts | MX present but odd priority/config | No MX (cannot receive replies) |
| Send-only / park with no inbox intent | MX optional | — | Do not fail solely for missing MX |

### PTR / FCrDNS

PTR and forward-confirmed reverse DNS are the **sending IP owner's** responsibility (ESP/infra). **Do not** flag PTR against Google Workspace / Microsoft 365–hosted mailbox domains when the user does not control the outbound IP. When the user provides a dedicated sending IP they own: ✓ matching FCrDNS · ✗ missing/mismatch · UNVERIFIED if reverse lookup fails.

### BIMI / MTA-STS / TLS-RPT

| Domain class | Expectation |
|--------------|-------------|
| Primary corporate / brand domain | BIMI, MTA-STS (`_mta-sts` TXT + policy host), TLS-RPT (`_smtp._tls`) expected — missing → · warn |
| Throwaway / cold outbound domain | Optional — missing → omit or · advisory only, never ✗ |

BIMI still requires a qualifying DMARC policy and valid SVG/logo evidence when claimed; without evidence mark BIMI UNVERIFIED or absent as · on corporate domains.

## Output contract

GitHub-flavored markdown only. Render only this shape; no prose outside it. This is the pack's [status layout](https://github.com/outboundsync/skills/blob/main/CONVENTIONS.md#status-layout--required-for-readiness-health-and-audit-skills):

1. `##` is the verdict: `Authentication healthy` | `Authentication needs work` | `Authentication unverified`.
2. A fenced `text` gauge follows immediately — always, even for one domain: an `Overall` row, then one row per domain. Pad labels so bars align.
3. One `###` card per domain, in gauge order, opening with a backtick context line.
4. Every bullet starts with its mark: `✓` pass · `·` warn · `✗` fail · `· UNVERIFIED — <reason>` when a lookup failed or alignment has no sample headers. One check per bullet; blank line between blocks. No colored emoji, no ASCII boxes.
5. `### Next` only when any ✗, UNVERIFIED, or actionable · exists; each item maps to a line above.

**Gates per domain** (the gauge's `<t>`): SPF · DKIM · DMARC · MX (only when the domain must receive replies) · alignment. PTR, BIMI, MTA-STS, and TLS-RPT are advisory card lines, not gates.

- A gate **passes** on `✓` or `·` warn — the record publishes and works.
- `UNVERIFIED` (lookup failed, no sample headers) and DKIM "not found at probed selectors" fill `▒`, not `█`.
- `✗` fills `░`.
- Bar: `█` = round(passed / t × 20), `▒` = round(unverified / t × 20), `░` = the rest. Overall sums the gates of every domain with at least one verified gate; a wholly UNVERIFIED domain is left out of `<t>` and counted in the suffix, which counts domains.
- Row text: `<✓ | ✗ | ·> <passed>/<t>[ · <n> unverified]` — the mark is the domain's verdict (`·` = unverified). Overall: `<passed>/<t> · <healthy | needs work | unverified>[ · <n> unverified]`, omitting the suffix when the verdict is already unverified.

### Shape

````markdown
## <Authentication healthy | Authentication needs work | Authentication unverified>

```text
Overall     <bar>  <p>/<t> · <verdict>[ · <n> unverified]

<domain>    <bar>  <✓ | ✗ | ·> <p>/<t>[ · <n> unverified]
```

### <domain>
`<reply-receiving | send-only> · <brand | cold outbound> · <mail provider if known>`

- <✓ | · | ✗> SPF — <n> record(s) · <n> lookups · <all mechanism>
- <✓ | · | ✗> DKIM — <selector(s) found, key size | not found at probed selectors (<list>); selector may be custom>
- <✓ | · | ✗> DMARC — p=<policy> · rua <present | missing>
- <✓ | · | ✗> MX — <hosts | not required for send-only>
- <✓ | ✗> Alignment — <SPF or DKIM aligned with From> | · UNVERIFIED — no sample headers
- · PTR — <N/A hosted mailbox | FCrDNS result>
- · <BIMI | MTA-STS | TLS-RPT> — <state; brand domains only>

### Next
1. <shortest fix tied to a ✗ or UNVERIFIED above>
   `<exact DNS record when the fix is a record>`
````

Replace any line whose lookup failed with `· UNVERIFIED — <record> lookup failed (<resolver error>)`. Worked examples: [references/examples.md](references/examples.md).

### Verdict logic (compute, never print as its own section)

- **Healthy** only if DMARC is valid, role-required MX is valid, no critical
  record error exists, and at least one DMARC authentication path is verified
  passing **and aligned** from sample headers (SPF or DKIM). Record presence
  alone is not proof of message-level alignment.
- Any ✗ → **needs work**.
- No sample headers → **unverified** (never silent pass), even if SPF/DMARC
  records look valid and DKIM probes only return `· not found at probed
  selectors`.
- Resolver/API UNVERIFIED on a required record without compensating verified
  evidence → **unverified**.
- Missing DMARC is ✗ (needs work), distinct from UNVERIFIED `_dmarc` query failure.
