const base = process.env.SMOKE_BASE_URL || `http://127.0.0.1:${process.env.PORT || 3001}`;

async function check(path) {
  const res = await fetch(`${base}${path}`);
  const text = await res.text();
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status} ${text}`);
  return { path, status: res.status, body: text.slice(0, 300) };
}

const results = [];
for (const path of ['/api/v1/health/live', '/api/v1/health/ready', '/']) {
  results.push(await check(path));
}
console.log(JSON.stringify({ ok: true, base, results }, null, 2));
