export default {
  async fetch(request) {
    const url = new URL(request.url);
    const family = (url.searchParams.get("family") || "all").toLowerCase(); // '4' | '6' | 'all'

    const r = await fetch("https://www.gstatic.com/ipranges/cloud.json");
    const j = await r.json();

    const out = [];
    for (const p of j.prefixes || []) {
      if (p.scope === "europe-west3") {
        if ((family === "4" || family === "all") && p.ipv4Prefix) out.push(p.ipv4Prefix);
        if ((family === "6" || family === "all") && p.ipv6Prefix) out.push(p.ipv6Prefix);
      }
    }

    return new Response(out.join("\n") + (out.length ? "\n" : ""), {
      headers: { "content-type": "text/plain; charset=utf-8" }
    });
  }
}
