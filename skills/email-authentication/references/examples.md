# Email authentication — rendered examples

Illustrative domains and records. The layout is the contract; the values are not.

## One cold domain, no sample headers

Records are healthy, but without a message's headers alignment can't be proven — so the verdict is unverified, never a silent pass.

````markdown
## Authentication unverified

```text
Overall                ████████████████▒▒▒▒  4/5 · unverified

getacme.example.com    ████████████████▒▒▒▒  · 4/5 · 1 unverified
```

### getacme.example.com
`reply-receiving · cold outbound · Google Workspace`

- ✓ SPF — 1 record · 3 lookups · ~all
- ✓ DKIM — selector google · 2048-bit RSA
- · DMARC — p=none · rua present (fine for a young cold domain; do not jump to reject)
- ✓ MX — aspmx.l.google.com + 4 backups
- · Alignment — UNVERIFIED — no sample headers
- · PTR — N/A, hosted mailbox

### Next
1. Send a test to a mailbox you control and paste the full headers, so alignment can be checked
````

## Two domains — one healthy, one needs work

The user pasted headers from both domains.

````markdown
## Authentication needs work

```text
Overall                ████████████▒▒░░░░░░  6/10 · needs work · 1 unverified

acme.example.com       ████████████████████  ✓ 5/5
tryacme.example.com    ████▒▒▒▒░░░░░░░░░░░░  ✗ 1/5 · 1 unverified
```

### acme.example.com
`reply-receiving · brand · Microsoft 365`

- · SPF — 1 record · 9 lookups · -all (close to the 10-lookup limit)
- ✓ DKIM — selector1, selector2 · 2048-bit RSA
- ✓ DMARC — p=quarantine · rua present
- ✓ MX — acme-example-com.mail.protection.outlook.com
- ✓ Alignment — DKIM d=acme.example.com aligned with From
- · PTR — N/A, hosted mailbox
- · MTA-STS — missing (expected on a brand domain)

### tryacme.example.com
`reply-receiving · cold outbound · Google Workspace`

- ✗ SPF — 2 v=spf1 records (PermError)
- · DKIM — not found at probed selectors (google, selector1, selector2, s1, s2, k1, dkim); selector may be custom
- ✗ DMARC — missing
- ✓ MX — aspmx.l.google.com + 4 backups
- ✗ Alignment — SPF PermError and no DKIM signature on the sample
- · PTR — N/A, hosted mailbox

### Next
1. Merge the two SPF records on tryacme.example.com into one
   `v=spf1 include:_spf.google.com ~all`
2. Publish a DMARC record on tryacme.example.com
   `_dmarc.tryacme.example.com TXT "v=DMARC1; p=none; rua=mailto:dmarc@acme.example.com"`
3. Turn on DKIM signing in Google Workspace for tryacme.example.com and tell me the selector
4. Trim SPF lookups on acme.example.com before adding another sender
````
