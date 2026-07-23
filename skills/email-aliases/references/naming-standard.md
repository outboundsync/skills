# Mailbox naming standard

## Allowed local-part patterns

Real human identities only:

| Pattern | Example | Notes |
| --- | --- | --- |
| First | `jane@` | Prefer when unique |
| First.last | `jane.doe@` | Period = preferred separator |
| First initial + last | `jdoe@` | Acceptable |
| First + last initial | `janed@` | Acceptable when needed |

## Separators

| Character | Allowed as sender local-part? |
| --- | --- |
| `.` (period) | **Preferred** — familiar and readable |
| `_` underscore | **Warn** — valid in many systems but less natural |
| `-` hyphen | **Warn** — valid but less natural |
| Digits `0-9` | **Warn** — can look generated unless meaningful |
| Random strings / hashes | **Avoid** — weak human identity |

## Disallowed sender classes

- Role / functional: see [role-address-blocklist.md](role-address-blocklist.md)
- Shared “team” inboxes used for cold outbound

Aliases are not automatically disallowed, but they are not independent
senders. Prefer true mailboxes; use an alias only when reply handling, provider
policy, and authentication alignment are verified.

## True mailbox vs alias

| | True mailbox | Alias |
| --- | --- | --- |
| Reputation | Dedicated operational identity; provider/domain reputation still shared | Usually no independent reputation isolation |
| Capacity | Counts as a provisioned sender under provider policy | Usually adds **no independent quota**; shares the underlying account/provider limits |
| DMARC | Aligns when domain auth is correct | Can align or fail depending on authenticated From domain, return-path, and DKIM `d=`; verify |
| Use for cold send | **Preferred** | Avoid as a scaling tactic; use only when reply handling, policy, and alignment are verified |

**Default:** Prefer a **dedicated true mailbox**. An alias is not automatically
an authentication failure, but it is not an independent sender and should not
be used to manufacture scale.

## Consistency triad

For every sending identity, these three must match:

1. **From-name** (display name) — human, e.g. `Jane Doe`
2. **Local-part human** — `jane` / `jane.doe` readable as that person
3. **Signature name** — same human

Also:

- **Unique identity per mailbox** — no rotating fake names on one mailbox
- Scale with authenticated domains and dedicated mailboxes, not aliases.
  **2–3 mailboxes per domain** is a conservative starting heuristic, not a
  provider limit or universal safety guarantee.

## Catch-all

Catch-all (accept any local-part) creates **two-sided risk**:

- Inbound: spam/backscatter noise
- Outbound/validation: masks invalid recipients; can hurt list hygiene and reputation workflows

Prefer explicit mailboxes. If catch-all exists, flag · risk and verify reply
handling/list hygiene; do not prescribe disabling it without understanding
legitimate inbound use.

## Good vs bad examples

| Address | Verdict |
| --- | --- |
| `jane.doe@acme.com` | ✓ |
| `jdoe@acme.com` | ✓ |
| `jane_doe@acme.com` | · underscore; readable but not preferred |
| `jane-doe@acme.com` | · hyphen; readable but not preferred |
| `jane2@acme.com` | · digit; confirm it is a real stable identity |
| `sales@acme.com` | ✗ avoid as cold-outbound sender |
| `noreply@acme.com` | ✗ incompatible with reply-led outbound |
| `jane@` alias → other mailbox | · verify reply handling, quota assumptions, and DMARC alignment; prefer dedicated mailbox |
