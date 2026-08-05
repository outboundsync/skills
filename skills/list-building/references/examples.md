# List-building examples (before → after)

Neutral, hypothetical placeholders only. Never reuse the example filters, counts, or match rates as factual claims; replace them with the user's own inputs or clearly label anything unverified.

## 1. "Just give me a big list" → ICP + differentiator

**Before (weak)**

> Pull 10,000 contacts at SaaS companies and load them all.

- ICP fit: 1 (no role, no size band)
- Motion fit: 1 (database dump, no differentiator)
- Fails: overlap (same list everyone pulls), freshness unknown, no suppression

**After (stronger)**

> Motion: database + one signal. ICP: Series A–B B2B SaaS, 50–200 employees, Head/VP of Sales. Differentiator: only accounts that posted an SDR/AE req in the last 30 days. Verify email freshness; dedupe vs CRM; cap first batch at 500.

---

## 2. Time-sensitive trigger handled as a database pull → signal-led

**Before**

> They just raised a round — export everyone in the vertical from the database.

**After**

> Play A: define the signal (funding announced ≤ 21 days, matching ICP), source signal-matched accounts, find the 1–2 target roles per account, enrich only verified email + role, then dedupe/suppress. Volume is naturally smaller — that's the point; relevance carries it.

---

## 3. Accounts but no contacts → waterfall enrich

**Before**

> I have 300 target domains but no names or emails. Buy a list?

**After**

> Play C: seed = the 300 domains. Need = verified work email + role for the target persona. Run a provider waterfall (fall back on gaps), keep only rows above the confidence bar, flag the rest for review. Enrich email + role only — skip phone unless a call step exists. Dedupe vs CRM before load.

---

## Good "plan" shape (for reference)

- Goal: 500 verified contacts into the SEP for a Q-launch
- ICP: mid-market fintech, 200–1000 employees, RevOps leaders
- Motion: signal (recent tooling change) → waterfall for people
- Data bar: verified email + confirmed current role; drop < confidence threshold
- Watchouts: cap enrichment spend to fields used; suppress prior opt-outs; regional consent
