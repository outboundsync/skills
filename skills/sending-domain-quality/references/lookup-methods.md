# Sending domain quality — lookup methods

Read-only. Default path needs no API key. Optional keys enrich reputation only.

## Age — RDAP

1. Query RDAP for the domain (bootstrap via IANA RDAP DNS bootstrap or registrar RDAP URL).
2. Read registration/creation date (`creation`, `registered`, `created` events — prefer the earliest registration event).
3. Compare to **today** and to **planned first-send** date when the user provides one.

```text
# Example patterns (agent adapts to available tools)
curl -sL "https://rdap.org/domain/example.com"
# or dig/whois only as fallback — prefer RDAP
```

RDAP timeout, 404 with no parseable date, rate-limit, or parse failure → **Age: UNVERIFIED**. Never invent an age.

## Reputation — DNSBL (domain)

A **listing** is an A record in the list's documented *listing* range — **not** any positive A response. Several codes mean **error**, not "listed," and must be read as UNVERIFIED:

- **Public/open resolvers are blocked — do not use them here.** Spamhaus, SURBL, and URIBL refuse queries from shared public resolvers (e.g. Google `8.8.8.8`, Cloudflare `1.1.1.1`, and most DoH endpoints) and answer with an *error* address, not a listing — for Spamhaus, something in `127.255.255.0/24` (e.g. `127.255.255.254` = queried via a public/open resolver, `127.255.255.252` = anonymous query, `127.255.255.255` = volume exceeded). Public DoH is this pack's default DNS path (see `email-authentication`), so a naive DNSBL check there returns a positive A that is **not** a listing. Use a **non-public** resolver (a dedicated/local resolver) or the list's authenticated Data Query Service.
- **Listed** = an A record in the list's listing range — e.g. Spamhaus DBL `127.0.1.2`–`127.0.1.99`. Interpret each code per the list's return-code docs.
- **Not listed** = NXDOMAIN — but **only when the query ran on a permitted resolver**.

| List | Query shape | Listing range (else = error/UNVERIFIED) |
|------|-------------|------------------------------------------|
| Spamhaus DBL | `<domain>.dbl.spamhaus.org` | `127.0.1.2`–`127.0.1.99` |
| SURBL | `<domain>.multi.surbl.org` (or current SURBL zone) | bitmask codes in `127.0.0.x` (see SURBL docs) |
| URIBL | `<domain>.multi.uribl.com` (or current URIBL zone) | bitmask codes in `127.0.0.x` (see URIBL docs) |

Any `127.255.255.x` error code, SERVFAIL, timeout, or refusal → **UNVERIFIED** for that list — never "clean" and never "listed."

## Landing / redirect

```bash
curl -sI -o /dev/null -w "%{http_code} %{redirect_url}\n" "http://<domain>/"
curl -sI -o /dev/null -w "%{http_code} %{redirect_url}\n" "https://<domain>/"
```

Expect permanent redirect (**301** / **308**) to the real brand site for cold sending domains. **404**, parked, for-sale, or ad-parked pages → · (advisory — a weak-reputation signal, not an automatic blocker; consistent with `SKILL.md` and `age-and-reputation.md`). Follow one hop enough to name the destination; odd multi-hop chains → ·.

## Lookalike / permutation idea

When assessing name risk, consider common permutations (homoglyphs, missing hyphen, alt TLD, `get`/`try`/`mail` prefixes) against (a) the user's brand and (b) well-known third parties the string resembles. Full dnstwist-style runs are optional; without them, limit claims to lexical analysis and mark broad "no lookalikes on the Internet" as **UNVERIFIED**.

## Optional APIs (keys optional)

| Env / service | Use |
|---------------|-----|
| `GOOGLE_WEB_RISK_KEY` | URL threat checks |
| `VIRUSTOTAL_API_KEY` | Domain/URL reputation |
| `WHOISXML_API_KEY` | WHOIS/RDAP-style age + reputation extras |
| IPQS or similar | Fraud/reputation scores when already provisioned |

Optional call failed → UNVERIFIED for that signal; still report DNSBL/RDAP/redirect results that succeeded.

## MCP note

There is **no** first-party domain-reputation MCP assumed in this environment. Do not wait for one; use DNS/HTTP/RDAP/optional keys.
