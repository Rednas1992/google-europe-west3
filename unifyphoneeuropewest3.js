export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Params
    const region = (url.searchParams.get("region") || "europe-west3").toLowerCase();
    const serviceParam = url.searchParams.get("service"); // als null => geen filter
    const service = serviceParam ? serviceParam.toLowerCase() : null;

    const family = (url.searchParams.get("family") || "all").toLowerCase(); // '4'|'6'|'all'
    const doSort = url.searchParams.get("sorted") === "1";
    const doUnique = url.searchParams.get("unique") === "1";

    const upstream = "https://www.gstatic.com/ipranges/cloud.json";

    const cache = caches.default;
    const cacheKey = new Request(upstream, { headers: { accept: "application/json" } });
    let r = await cache.match(cacheKey);

    try {
      if (!r) {
        r = await fetch(upstream, { headers: { accept: "application/json" } });
        if (!r.ok) throw new Error(`Upstream HTTP ${r.status}`);
        ctx.waitUntil(cache.put(cacheKey, r.clone()));
      }

      const j = await r.json();
      const prefixes = Array.isArray(j?.prefixes) ? j.prefixes : [];

      // Counters for debug
      let total = prefixes.length;
      let regionKept = 0, serviceKept = 0;

      let out = [];
      for (const p of prefixes) {
        const pScope = (p.scope || "").toLowerCase();
        const pService = (p.service || "").toLowerCase();

        if (pScope !== region) continue;
        regionKept++;

        if (service && pService !== service) continue;
        serviceKept++;

        if ((family === "4" || family === "all") && p.ipv4Prefix) out.push(p.ipv4Prefix);
        if ((family === "6" || family === "all") && p.ipv6Prefix) out.push(p.ipv6Prefix);
      }

      if (doUnique) out = [...new Set(out)];
      if (doSort) out.sort();

      const body = out.join("\n") + (out.length ? "\n" : "");
      return new Response(body, {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "public, max-age=300",
          // Debug-info (handig bij lege output)
          "x-debug-total": String(total),
          "x-debug-region-kept": String(regionKept),
          "x-debug-service-kept": String(serviceKept),
          "x-debug-family": family
        }
      });
    } catch (e) {
      return new Response(`Error: ${e.message}\n`, { status: 502 });
    }
  }
}
