export default {
  async fetch(request) {
    const url = new URL(request.url);

    const region = (url.searchParams.get("region") || "europe-west3").toLowerCase();
    const serviceParam = url.searchParams.get("service");        // null = geen service-filter
    const service = serviceParam ? serviceParam.toLowerCase() : null;

    const family = (url.searchParams.get("family") || "all").toLowerCase(); // '4'|'6'|'all'
    const doSort  = url.searchParams.get("sorted") === "1";
    const doUniq  = url.searchParams.get("unique") === "1";
    const debug   = url.searchParams.get("debug") === "1";

    try {
      const upstream = "https://www.gstatic.com/ipranges/cloud.json";
      const res = await fetch(upstream, { headers: { accept: "application/json" } });
      if (!res.ok) return new Response(`Upstream HTTP ${res.status}\n`, { status: 502 });

      const j = await res.json();
      const prefixes = Array.isArray(j?.prefixes) ? j.prefixes : [];

      let total = prefixes.length, regionKept = 0, serviceKept = 0;
      let out = [];

      for (const p of prefixes) {
        const pScope   = String(p.scope   || "").toLowerCase();
        const pService = String(p.service || "").toLowerCase();

        if (pScope !== region) continue;
        regionKept++;

        if (service && pService !== service) continue;
        serviceKept++;

        if ((family === "4" || family === "all") && p.ipv4Prefix) out.push(p.ipv4Prefix);
        if ((family === "6" || family === "all") && p.ipv6Prefix) out.push(p.ipv6Prefix);
      }

      if (doUniq) out = [...new Set(out)];
      if (doSort) out.sort();

      let body = out.join("\n");
      if (out.length) body += "\n";

      if (debug) {
        body += `\n# debug\n`;
        body += `total=${total}\n`;
        body += `after_region=${regionKept}\n`;
        body += `after_service=${serviceKept}\n`;
        body += `family=${family}\n`;
        body += `region=${region}\n`;
        body += `service=${service ?? "(none)"}\n`;
      }

      return new Response(body, {
        headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" }
      });
    } catch (e) {
      return new Response(`Error: ${e.message}\n`, { status: 502 });
    }
  }
}
