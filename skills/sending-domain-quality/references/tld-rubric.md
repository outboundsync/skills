# TLD rubric (cold outbound)

Lexical only — no guru names, no trademarked framework labels.

## Tier table

| Mark | Tier | TLDs |
|------|------|------|
| ✓ | Gold | `.com` |
| ✓ | Acceptable | `.io` `.co` `.net` `.ai` |
| · | Warn | `.org` `.us` `.biz` `.info` |
| · | Elevated-risk | `.xyz` `.top` `.click` `.buzz` `.cam` |
| · | Elevated-risk (historically high-abuse ccTLD) | `.tk` `.ml` `.ga` `.cf` `.gq` `.pw` |

Unlisted TLDs: treat as **· unclassified** unless the user has strong brand
ownership on that ccTLD/brand TLD. TLD is a population-level prior, not proof
about the specific domain.

## Portfolio risky-fraction

When auditing a set of sending domains:

```text
risky-fraction = count(domains on elevated-risk TLDs) / count(domains in scope)
```

| Fraction | Advisory context |
|----------|------|
| &lt; 5% | low |
| 5–30% | moderate |
| &gt; 30% | high |

Single-domain audit: score that domain's TLD tier; omit fraction or show `n/a (1 domain)`.

## Scoring notes

- Prefer `.com` for cold outbound when choosing net-new domains.
- Acceptable TLDs are fine for brand-owned secondary senders; still prefer `.com` when buying fresh.
- Warn-tier TLDs are usable with strong auth + clean reputation but start with a · on the TLD factor.
- Elevated-risk TLDs warrant extra reputation verification but are not an
  automatic fail. Confirmed DBL/URL-reputation findings and deceptive naming
  are stronger evidence than the suffix.
