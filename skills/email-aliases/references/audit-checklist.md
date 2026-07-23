# Sending identity audit checklist

Work top to bottom. Every ✗ becomes a Findings bullet and a Prescription item.

## A. Inventory

- [ ] List every From address used for cold / scaled outbound
- [ ] Mark each as `mailbox` | `alias` | `role`
- [ ] Capture From-name and signature name per address
- [ ] Note domain(s) and mailboxes-per-domain count

## B. Local-part naming

- [ ] Looks like a real human (`jane@`, `jane.doe@`, `jdoe@`)
- [ ] Period preferred; other separators/digits are reviewed for readability
- [ ] No random strings or generated-looking identities
- [ ] Not on the role-address blocklist

## C. Alias / capacity / auth

- [ ] Cold send preferably uses a **dedicated true mailbox**
- [ ] No expectation that aliases add independent quota or reputation isolation
- [ ] From domain alignment is verified from auth config/sample headers; it is
      not inferred solely from mailbox-vs-alias type
- [ ] Catch-all explicitly risk-flagged; legitimate inbound use understood

## D. Consistency triad

- [ ] From-name == human implied by local-part
- [ ] Signature name == From-name
- [ ] One stable identity per mailbox (no rotating personas)
- [ ] 2–3 mailboxes/domain treated as a conservative starting heuristic, then
      adjusted to provider policy and observed reputation

## E. Role addresses

- [ ] No role senders in outbound
- [ ] RFC operational recipient addresses suppressed
- [ ] Department recipient addresses reviewed against policy and lawful basis
- [ ] `noreply@` never used (sending or expecting replies)

## F. Scale plan

- [ ] Growth path = more **domains** + human mailboxes, not alias sprawl
- [ ] New mailboxes follow naming standard before warmup/send

## Quick verdict rules

| Finding | Verdict |
| --- | --- |
| Role sender | **kill** as sender |
| Alias cold-send | **review/fix** → verify alignment/replies/quota; prefer true mailbox |
| Separator / digit local-part | **warn** → rename only if identity looks generated or confusing |
| Triad mismatch | **fix** align names |
| Alias sprawl used as capacity | **fix** → dedicated mailboxes and provider-compliant scale |
| Catch-all on sending domain | **review** → flag hygiene/reply risks; preserve legitimate inbound use |

## Prescription defaults

1. Start conservatively with 2–3 human mailboxes per sending domain; adapt to
   provider policy and observed performance.
2. Align From-name, local-part, signature.
3. Remove role senders; suppress operational recipients and review department
   recipients.
4. Prefer true mailboxes; do not chase capacity via aliases.
5. Prefer explicit mailboxes; review catch-all risk in context.
