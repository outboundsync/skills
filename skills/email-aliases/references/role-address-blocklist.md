# Role-address blocklist

## Avoid as SENDERS for cold / scaled outbound

Role and functional mailboxes weaken the one-to-one human identity and can
route replies to shared or unattended queues. Treat this as an operational and
trust heuristic, not a universal complaint-rate law.

| Local-part | Why blocked |
| --- | --- |
| `info@` | Functional; weak one-to-one identity |
| `sales@` | Functional; sales-shaped sender identity |
| `hello@` | Functional / marketing-shaped |
| `support@` | Ticket inbox; not a human sender |
| `noreply@` / `no-reply@` / `donotreply@` | **Kills replies**; anti-conversation signal |
| `marketing@` | Bulk association |
| `team@` | Shared / non-human |
| `contact@` | Functional |
| `admin@` | System / RFC-ish role |
| `office@` | Functional |
| `billing@` | Transactional role |
| `jobs@` / `careers@` | Functional |
| `press@` / `media@` | Functional |
| `abuse@` / `postmaster@` / `webmaster@` | RFC operational roles — not SDR senders |

Extend with any local-part that names a **function**, not a **person**.

## Review or suppress in RECIPIENT lists

Suppress RFC operational addresses such as `abuse@`, `postmaster@`, and
`hostmaster@`. For commercial/department addresses such as `sales@` or
`info@`, apply the user's policy and lawful basis rather than claiming RFC 2142
requires blanket suppression. Prefer a named person when the outreach is
intended to be personal.

Common recipient role local-parts to review (non-exhaustive):

- `abuse`, `postmaster`, `hostmaster`, `webmaster`, `noc`
- `security`, `privacy`
- `mailer-daemon`, `mailerdaemon`
- `root`, `admin`, `administrator`
- `info`, `sales`, `support`, `contact`, `marketing`
- `noreply`, `no-reply`, `donotreply`
- `billing`, `invoice`, `payments`
- `jobs`, `careers`, `hr`
- `press`, `media`

When list hygiene runs: automatically suppress operational/system roles; flag
department roles for policy review rather than silently treating every role
address as invalid.

## Replacement guidance

| Bad sender | Replace with |
| --- | --- |
| `sales@acme.com` | `jordan.lee@acme.com` (true mailbox) |
| `hello@acme.com` | `alex@acme.com` |
| `noreply@acme.com` | human mailbox; expect replies |

## Findings language (copy)

- ✗ Role sender `sales@` — weak human identity; replace with a dedicated,
  reply-capable human mailbox
- ✗ `noreply@` as From — incompatible with reply-led outreach; remove
- · Recipient list contains role addresses — suppress operational roles and
  review department roles against policy
