export default {
  async fetch() {
    const r = await fetch("https://www.gstatic.com/ipranges/cloud.json");
    const j = await r.json();
    const out = [];
    for (const p of j.prefixes || []) {
      if (p.scope === "europe-west3") {
        if (p.ipv4Prefix) out.push(p.ipv4Prefix);
        if (p.ipv6Prefix) out.push(p.ipv6Prefix);
      }
    }
    return new Response(out.join("\n") + "\n", { headers: { "content-type": "text/plain" }});
  }
}
