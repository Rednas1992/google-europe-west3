// _worker.js
export default {
  async fetch(req) {
    // optioneel filter: ?family=ipv4 | ipv6 | beide (default)
    const family = new URL(req.url).searchParams.get("family");

    const r = await fetch("https://www.gstatic.com/ipranges/cloud.json", {
      // 15 min edge-cache is vaak prima
      cf: { cacheTtl: 900, cacheEverything: true }
    });

    if (!r.ok) return new Response("Upstream error", { status: 502 });

    const j = await r.json();
    const out = [];

    for (const p of j.prefixes || []) {
      if (p.scope === "europe-west3") {
        if (!family || family === "ipv4") if (p.ipv4Prefix) out.push(p.ipv4Prefix);
        if (!family || family === "ipv6") if (p.ipv6Prefix) out.push(p.ipv6Prefix);
      }
    }

    // simpele output: één CIDR per regel
    return new Response(out.join("\n") + "\n", {
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
}
