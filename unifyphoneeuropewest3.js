export default {
  async fetch(request) {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'all';
    const scope = url.searchParams.get('scope');
    const listScopes = url.searchParams.get('list') === 'scopes';
    
    const r = await fetch("https://www.gstatic.com/ipranges/cloud.json");
    const j = await r.json();
    
    // Als er gevraagd wordt om een lijst van scopes
    if (listScopes) {
      const scopes = new Set();
      for (const p of j.prefixes || []) {
        if (p.scope) scopes.add(p.scope);
      }
      return new Response([...scopes].sort().join("\n") + "\n", { 
        headers: { "content-type": "text/plain" }
      });
    }
    
    const out = [];
    
    for (const p of j.prefixes || []) {
      if (!scope || p.scope === scope) {
        if ((type === 'ipv4' || type === 'all') && p.ipv4Prefix) {
          out.push(p.ipv4Prefix);
        }
        if ((type === 'ipv6' || type === 'all') && p.ipv6Prefix) {
          out.push(p.ipv6Prefix);
        }
      }
    }
    
    return new Response(out.join("\n") + "\n", { 
      headers: { "content-type": "text/plain" }
    });
  }
}