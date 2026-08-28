# Spam / sales word list (subjects)

Directional: sales/spam words tend to depress opens, and stacking **2+**
high-risk triggers can sharply reduce inbox placement.
These are priors, not universal causal rules; sender reputation, audience, and
message context take precedence.

Match case-insensitively. Prefer rewriting over synonym tricks that keep the same intent.

## Hard triggers (strip or kill)

### Urgency / scarcity

- act now, acting now
- limited time, limited offer
- expires, expiring, deadline
- last chance, final notice
- only X left, while supplies last
- urgent, immediately, ASAP

### Money / offer

- free, freemium (in subject)
- discount, % off, save big
- cash, prize, winner, congratulations
- cheap, lowest price, deal
- exclusive offer, special promotion
- buy now, order now, shop now

### Sales / hype

- guarantee, guaranteed
- no obligation, risk free, risk-free
- amazing, incredible, revolutionary
- game changer, game-changing
- best ever, #1, number one
- miracle, unlock, secret

### Compliance / spam classics

- click here, click below
- open immediately
- important information
- this is not spam
- increase sales, make money
- double your, triple your
- credit card, refinance
- viagra-class pharma terms (any)

### Formatting tells (not words, still ban)

- ALL CAPS words
- !!! / multiple exclamation marks
- emoji in subject
- fake `Re:` / `Fwd:`
- leading `$` or `$$$`

## Soft caution (rewrite if possible)

- opportunity
- solution
- demo (prefer later-touch body, not subject)
- partnership
- quick call
- touching base
- circling back
- following up (ok in follow-ups; weak on touch 1 cold)

## Replacement patterns

| Weak / spammy | Cleaner |
| --- | --- |
| `Exclusive offer for {{company}}` | `{{company}} outbound` |
| `ACT NOW — limited time!!!` | `hiring sdrs?` |
| `Free guide inside` | `outbound checklist` |
| `Re: our conversation` (fake) | `reply lag` |
| `🚀 Game changer` | `crm sync gap` |

## Counting hits

1. Tokenize on spaces and punctuation.
2. Count each list phrase match (multi-word phrases count as one hit).
3. Report hit count + matched tokens in the skill scorecard.
4. If high-risk hits ≥ 2 → apply a strong deduction and manual review. Kill
   deceptive/hype subjects; do not auto-kill clear, relevant language solely
   from a token count.
