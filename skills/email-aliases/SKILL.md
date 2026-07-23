---
name: email-aliases
description: >-
  Audit and prescribe cold-sending mailbox naming, from-name consistency, and
  role-address avoidance. Use when the user asks about email aliases, mailbox
  naming, what address should I send from, audit my sending accounts, is
  sales@/info@ ok, from name, or jane@example.com.
license: MIT
metadata:
  author: outboundsync
  version: "1.0.0"
---

# Email aliases and sending identities

Audit sending mailbox naming and identity consistency only. Draft recommendations — never create, delete, or rewire mailboxes, DNS, or ESP settings.

Default to the **quick** shape for a single-address keep/stop question. Use
the full inventory only for multi-mailbox audits or scale planning. Render
only the selected shape.

## Core rules (encode verbatim)

### Local-part shape

- Real human local-part (`jane@`, `jane.doe@`, `jdoe@`).
- Period is the **preferred** separator for simple, human-readable identities.
- Underscores, hyphens, digits, or random strings are readability/trust
  warnings — not protocol or deliverability failures by themselves.

### Role / functional senders

- Avoid role/functional mailboxes as cold-outbound **SENDERS** (`info@`
  `sales@` `hello@` `support@`); they weaken the human identity and often route
  replies poorly. Never use `noreply@` when replies are the goal.
- Suppress RFC operational recipient addresses (`abuse@`, `postmaster@`,
  `hostmaster@`, etc.). Review department addresses (`sales@`, `info@`) against
  the user's policy and lawful basis; RFC 2142 does not make every role address
  invalid.

### Alias vs true mailbox

- Prefer a **dedicated true mailbox** for cold sending. An alias generally adds
  no independent provider quota or reputation isolation; DMARC alignment
  depends on the authenticated From domain and DKIM/SPF configuration, so
  verify it rather than assuming every alias fails.

### Consistency triad

- From-name = local-part human = signature name.
- Unique identity per mailbox.
- Scale deliberately with authenticated domains and dedicated mailboxes, not
  alias sprawl. **2–3 mailboxes/domain** is a conservative starting heuristic,
  not a provider limit or universal safe-volume guarantee.

### Catch-all

- Catch-all is two-sided risk (inbound noise + reputation / validation side effects). Prefer explicit mailboxes.

References: [references/naming-standard.md](references/naming-standard.md), [references/audit-checklist.md](references/audit-checklist.md), [references/role-address-blocklist.md](references/role-address-blocklist.md).

## Workflow

1. Collect: list of from-addresses, from-names, signatures, alias vs mailbox, domains, volume goals.
2. Mode: `Audit` | `Prescribe`.
3. Score each identity against naming standard + triad.
4. Flag role senders, alias-as-sender, catch-all, readability issues, and
   **verified** alignment failures.
5. Prescribe dedicated human mailboxes; use 2–3/domain as a starting heuristic
   and adjust to provider policy, reputation, and observed performance.
6. Emit output contract.

## Response depth

- **Quick is the default** for a single-address question.
- Use the full inventory only for multi-mailbox audits or scale planning.
- Let verified alignment, reply routing, and provider policy override generic
  alias heuristics.

Quick shape:

```markdown
### Verdict
- <keep | review | stop> — <one line>

### Why
- <verified evidence and remaining risk>

### Next
- <shortest useful check or action>
```

## Output contract

GitHub-flavored markdown only. Blank line between blocks. Marks: ✓ · ✗ · ·

### Shape

````markdown
## Email aliases / sending identities <Audit | Prescribe>

### Mode
- <Audit | Prescribe>

### Inventory
| Address | Type | Local-part | From-name | Signature | Triad | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `user@domain` | mailbox\|alias\|role | ✓/✗/· | <name> | <name> | ✓/✗/· | keep\|fix\|stop |

### Findings
- <✓/✗/· line>
- …

### Prescription
- Per domain: <dedicated human mailboxes; 2–3 is a conservative starting point>
- Do not use aliases to manufacture independent capacity or reputation
- Role senders: remove from cold sending unless the user has a validated,
  reply-capable exception
- Role recipients: suppress operational roles; review department roles
- Catch-all: <disable / avoid / risk note>

### Consistency triad
- From-name = local-part human = signature name
- Unique identity per mailbox
````

## Safety

- Never provision mailboxes, change DNS, or edit ESP config.
- Never print secrets or full credential material.
- Recommendations are draft/audit text only.
