# Age and reputation rubric (cold outbound)

No guru names, no trademarked framework labels.

## Age (RDAP)

| Mark | Rule |
|------|------|
| ✓ | Domain age **≥14 days** before first send (conservative operational minimum) |
| · | **5–13 days** — fresh; age and test conservatively |
| ✗ | **&lt;5 days** with immediate production sending planned |
| UNVERIFIED | RDAP/whois failed or creation date unreadable |

### Operating notes

- Some recipient filters may treat domains younger than roughly 14 days as
  fresh; this is not a universal Microsoft hard gate.
- Prefer waiting at least 14 days before meaningful volume unless controlled
  testing gives stronger evidence.
- Use the aging window for warmup / low-risk traffic, not full campaigns.
- **Domain age is a weak signal for placement** — reputation, authentication, and engagement dominate. Never imply that an old domain alone guarantees inbox placement.

### Mailbox send volume & warmup ramp

Domain age is only half the picture — per-mailbox sending volume matters as much:

- Hold cold volume to roughly **20–50 emails per mailbox per day** at steady state; pushing one mailbox harder raises spam-filter risk regardless of domain age.
- **Ramp** new mailboxes over ~2–4 weeks — start low and increase gradually rather than sending full volume on day one.
- Spread volume across multiple mailboxes / domains instead of maxing one.

These are conservative operating heuristics, not platform limits; the right number depends on list quality, engagement, and complaint rate.

## Reputation

| Mark | Rule |
|------|------|
| ✓ | Not listed on checked domain blocklists (Spamhaus DBL, SURBL, URIBL via DNS); URL/domain reputation clean on optional tools when used; apex resolves to a legitimate branded page or redirects to the real brand site |
| · | Advisory-only signals; **404**, parked/for-sale page, messy redirect chain, or minor tool disagreement without confirmed blocklist hit |
| ✗ | Confirmed blocklist hit or phishing/malware URL flags |
| UNVERIFIED | DNSBL query, HTTP check, or optional API **failed** — never report "clean" |

### Redirect expectation

Cold sending domains should resolve to a legitimate branded property or
redirect to the primary brand site. A 301/308 is clean, but a secure branded
page or intentional redirect is also acceptable. Parked/404 is a trust warning,
not proof of a blocklist or reputation failure.

### Blocklist discipline

- Successful NXDOMAIN / not-listed response → not listed for that list.
- SERVFAIL, timeout, refused, or ambiguous response → **UNVERIFIED** for that list.
- Partial results: report each list separately; the reputation factor is ✗ if
  any hit is confirmed, UNVERIFIED if any required check remains unverified,
  and ✓ only when all required checks succeed clean.

## Combined factor weight (for narrative, not a secret score)

```text
placement drivers (dominant) → auth · engagement · complaints
this skill's factors          → reputation ≫ age ≫ name/TLD
```

Always emit the caveat line in the skill output contract.
