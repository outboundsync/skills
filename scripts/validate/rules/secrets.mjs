// Real OutboundSync keys/secrets look like osapi_<token> / oswhsec_<token>.
// The documented placeholders (`osapi_...`, `oswhsec_…`) stay allowed.
const SECRET = /\b(osapi|oswhsec)_[A-Za-z0-9]{12,}/;

export default {
  id: 'secrets',
  docRef: 'SECURITY.md#api-keys-and-secrets',
  description: 'No OutboundSync API keys or webhook signing secrets are committed.',
  check(model) {
    const out = [];
    const files = [...model.docs, ...model.skills.flatMap((s) => s.files)];
    for (const file of files) {
      const content = model.text(file);
      if (content === null) continue;
      content.split('\n').forEach((line, index) => {
        const match = line.match(SECRET);
        if (match) out.push({ file, line: index + 1, msg: `possible committed ${match[1] === 'osapi' ? 'API key' : 'webhook signing secret'} (${match[0].slice(0, 10)}…); remove and rotate it` });
      });
    }
    return out;
  },
};
