export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const region = url.searchParams.get("region") || "europe-west3";
    const service = url.searchParams.get("service") || "Google Cloud";
    const family = (url.searchParams.get("family") || "all").toLowerCase(); // '4'|'6'|'all'
    const doSort = url.searchParams.get("sorted") === "1";
    const doUnique = url.searchParams.get("unique") === "1";

    const upstream = "https://www.gstatic.com/ipranges/cloud.json";

    // edge cache
    const cache = caches.default;
    const cacheKey = new Request(upstream, { headers: { "accept": "application/json" }});
    let r = await cache.match(cacheKey);

    try {
      if (!r) {
        r = await fetch(upstream, { headers: { "accept": "application/json" }});
        if (!r.ok) throw new Error(`Upstream HTTP ${r.status}`);
        // cache kort (Google update dit regelmatig, maar niet elke minuut)
        ctx.waitUntil(cache.put(cacheKey, r.clone()));
      }

      const j = await r.json();
      const prefixes = Array.isArray(j?.prefixes) ? j.prefixes : [];

      let out = [];
      for (const p of prefixes) {
        if (p.service !== service) continue;
        if (p.scope !== region) continue;

        if ((family === "4" || family === "all") && p.ipv4Prefix) out.push(p.ipv4Prefix);
        if ((family === "6" || family === "all") && p.ipv6Prefix) out.push(p.ipv6Prefix);
      }

      if (doUnique) out = [...new Set(out)];
      if (doSort) out.sort();

      return new Response(out.join("\n") + (out.length ? "\n" : ""), {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "public, max-age=300" // 5 min client cache
        }
      });
    } catch (e) {
      return new Response(`Error: ${e.message}\n`, { status: 502 });
    }
  }
}
