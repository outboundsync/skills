# Email authentication — lookup methods

Read-only. Prefer free public DNS. Optional APIs enrich; they never replace the unverified≠empty rule.

## Default free resolvers

### Cloudflare DoH

```http
GET https://cloudflare-dns.com/dns-query?name=<fqdn>&type=TXT
Accept: application/dns-json
```

Also `type=MX`, `type=A`, `type=AAAA`, `type=CNAME`, `type=TLSA` as needed.

### Google DoH

```http
GET https://dns.google/resolve?name=<fqdn>&type=TXT
```

### dig

```bash
dig +short TXT example.com
dig +short TXT _dmarc.example.com
dig +short TXT selector1._domainkey.example.com
dig +short MX example.com
dig +short -x <sending-ip>    # PTR
```

On HTTP/shell failure: mark that record **UNVERIFIED**. Do not infer absence.

## Record locations

| Check | FQDN / query |
|-------|----------------|
| SPF | `TXT` at apex `example.com` — find `v=spf1` |
| DKIM | `TXT` at `<selector>._domainkey.example.com` |
| DMARC | `TXT` at `_dmarc.example.com` |
| MX | `MX` at apex |
| BIMI | `TXT` at `default._bimi.example.com` (or named location) |
| MTA-STS | `TXT` at `_mta-sts.example.com` + policy at `https://mta-sts.example.com/.well-known/mta-sts.txt` |
| TLS-RPT | `TXT` at `_smtp._tls.example.com` |
| PTR | reverse for sending IP; then FCrDNS forward A/AAAA |

## SPF lookup counting

Start at apex `v=spf1`. Each of the following counts toward the **10-lookup** cap (RFC 7208):

- `include:`
- `a` / `mx` (when used as mechanisms that resolve)
- `ptr` (deprecated — flag even if present)
- `exists:`
- `redirect=` (entire evaluation continues at redirect target)

Do **not** count `all`, `ip4:`, `ip6:`, or `exp=`. Recursively expand `include:` trees. **Void** lookups (NXDOMAIN / empty answered lookups that count as void per RFC) — warn at 2, fail above policy if they contribute to PermError.

**Multiple SPF records** at the same name = **PermError** (✗). Do not confuse
multiple quoted character-strings joined within one TXT record with multiple
records.

Never recommend flattening SPF into ip4/ip6-only records as a "fix."

## DKIM selector probing

Probe (unless user/ESP supplies selectors): `google`, `selector1`, `selector2`, `s1`, `s2`, `k1`, `dkim`.

Typical RSA key shape (`v=` and `k=` may be omitted when their defaults apply):

```text
v=DKIM1; k=rsa; p=<base64>
```

Empty `p=` = revoked. Estimate RSA bits from decoded `p=` modulus length when possible: **2048+** ✓ · **1024** · warn · unknown bit length → report key found but bit length UNVERIFIED.

If DNS answers successfully but no selector hits:
`· DKIM not found at probed selectors (google, selector1, …); selector may be
custom` — **not** "DKIM missing" and **not** UNVERIFIED.
If the resolver fails: `UNVERIFIED — DKIM lookup failed at probed selectors`.
Prefer the selector from a real message's `DKIM-Signature` header or the
sending provider configuration over guessing.

## DMARC parsing

Require `v=DMARC1` as the **first** tag. Require `p=`. Note `rua=` / `ruf=`, `adkim` / `aspf`, `sp=` / `np=`, `pct=`.

Missing record at `_dmarc.<domain>` (successful NXDOMAIN / no DMARC TXT) = **✗ missing DMARC** (distinct state). Resolver error = **UNVERIFIED**.

## Alignment check (when headers available)

From a sample `Authentication-Results` / raw message:

1. Visible From organizational domain.
2. SPF: pass? MAIL FROM / HELO org domain aligns (`aspf=r` relaxed vs `s` strict)?
3. DKIM: pass? `d=` aligns (`adkim`)?
4. DMARC pass iff (2) or (3).

No headers → `Alignment: UNVERIFIED — no sample headers`.

## Optional enrichment (keys optional)

| Tool | Use |
|------|-----|
| MXToolbox API (`MXTOOLBOX_API_KEY`) | SPF/DKIM/DMARC/blacklist views |
| EasyDMARC / dmarcian-style checkers | DMARC aggregate / policy advisors |
| WhoisXML DNS | Historical/alternate DNS views |
| DNS MCP | If available in the agent environment |

Optional tools failing after you invoke them → UNVERIFIED for that enrichment slice; still report free-DoH results that succeeded.
