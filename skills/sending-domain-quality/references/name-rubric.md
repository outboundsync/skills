# Name rubric (cold outbound)

Lexical quality of the **sending** domain label (left of the TLD). No guru names, no trademarked framework labels.

## Pass (✓)

- Short (generally ≤15 characters in the SLD) and pronounceable aloud.
- No hyphens, no digits.
- No keyword stuffing (`bestcrmsoftwareonline.com`).
- **Brand-adjacent on the user's own brand** is encouraged for cold infra:
  - `getbrand.com`
  - `trybrand.com`
  - `brandmail.com`
  - similar clear `<verb|role><brand>` or `<brand><role>` patterns the user owns

## Warn (·)

- One hyphen on an otherwise clear own-brand pattern.
  - Example: `brand-hq.com`
- Slightly long but still pronounceable.
- Digits only when they are part of a known brand token the company actually uses.
- Ambiguous pronunciation that still clearly maps to the user's brand.

## Fail (✗)

- **Lookalike** of another company's brand/domain (typosquat, homoglyph, near-miss).
- **Misspelling** of the user's own brand.
- Multiple hyphens, digit spam, or SEO/keyword stuffing.
- Strings that read as phishing (`secure-login-brand-pay.com`, etc.).

## Lookalike check (minimum)

1. Compare against the user's primary brand domain and legal name.
2. Flag near-matches to well-known third parties the string evokes.
3. Without permutation tooling, score the lexical evidence available and state
   that broad Internet lookalike-scan coverage is **UNVERIFIED**.

## Priority reminder

Name quality is **secondary** to authentication, engagement, and complaint rate. A perfect name does not rescue bad auth or a burned reputation.
