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

Query for an **A** record; a positive A response typically means listed (interpret per list docs). No response / NXDOMAIN pattern per list = not listed **only when the query succeeded**.

| List | Query shape |
|------|-------------|
| Spamhaus DBL | `<domain>.dbl.spamhaus.org` |
| SURBL | `<domain>.multi.surbl.org` (or current SURBL domain zone) |
| URIBL | `<domain>.multi.uribl.com` (or current URIBL zone) |

Resolver failure / SERVFAIL / timeout → **UNVERIFIED** for that list (do not say "clean").

## Landing / redirect

```bash
curl -sI -o /dev/null -w "%{http_code} %{redirect_url}\n" "http://<domain>/"
curl -sI -o /dev/null -w "%{http_code} %{redirect_url}\n" "https://<domain>/"
```

Expect permanent redirect (**301** / **308**) to the real brand site for cold sending domains. **404**, parked, for-sale, or ad-parked pages → ✗. Follow one hop enough to name the destination; odd multi-hop chains → ·.

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
