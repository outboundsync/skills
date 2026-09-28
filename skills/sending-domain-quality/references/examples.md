# Sending domain quality — rendered examples

Illustrative domains, dates, and results. The layout is the contract; the values are not.

## One domain, fit for cold send

````markdown
## Domain fit for cold send

```text
Overall                ████████████████████  4/4 · fit

getacme.example.com    ████████████████████  ✓ 4/4
```

### getacme.example.com
`created 2026-08-30 · 29 days old · redirects to acme.example.com`

- ✓ TLD — .com gold
- ✓ Name — short own-brand variant, no hyphens or digits
- ✓ Age — 29 days before first send
- ✓ Reputation — clean on DBL, SURBL, URIBL; 301 to the brand site
- · Caveat: name and TLD are secondary — authentication, engagement, and complaint rate dominate placement
````

## Portfolio of three — one risky, one unverified

The reputation lookup for the third domain failed, so it is unknown — not clean.

````markdown
## Domain risky for cold send

```text
Overall                 ███████████████▒▒░░░  9/12 · risky · 1 unverified

acmehq.example.com      ████████████████████  ✓ 4/4
acme-sales.example.xyz  ██████████░░░░░░░░░░  ✗ 2/4
tryacme.example.com     ███████████████▒▒▒▒▒  · 3/4 · 1 unverified
```

### acmehq.example.com
`created 2026-07-02 · 88 days old · brand landing page`

- ✓ TLD — .com gold
- ✓ Name — clear own-brand variant
- ✓ Age — 88 days before first send
- ✓ Reputation — clean on DBL, SURBL, URIBL; branded page resolves

### acme-sales.example.xyz
`created 2026-09-26 · 2 days old · parked`

- · TLD — .xyz elevated-risk (portfolio risky-fraction 33%)
- · Name — one hyphen on an otherwise clear own-brand name
- ✗ Age — 2 days old and you plan to send tomorrow
- · Reputation — clean on blocklists, but the apex is a parked page

### tryacme.example.com
`created 2026-08-12 · 47 days old · redirects to acme.example.com`

- ✓ TLD — .com gold
- ✓ Name — short own-brand variant
- ✓ Age — 47 days before first send
- · Reputation — UNVERIFIED — DNSBL query returned 127.255.255.254 (public resolver blocked), not a listing

### Next
1. Hold acme-sales.example.xyz for at least 12 more days and point it at the brand site before sending
2. Re-run the tryacme.example.com blocklist check through a non-public resolver

- · Caveat: name and TLD are secondary — authentication, engagement, and complaint rate dominate placement
````
