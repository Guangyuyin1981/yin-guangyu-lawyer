export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const target = 'https://yin-guangyu-lawyer.surge.sh' + path + url.search;

    // Serve proper robots.txt that allows all crawlers
    if (path === '/robots.txt') {
      return new Response(
        `User-agent: *
Allow: /
Disallow: /private/
Disallow: /admin/

Sitemap: ${url.origin}/sitemap.xml

# AI crawlers - explicitly allow
User-agent: GPTBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: OAI-SearchBot
Allow: /
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      );
    }

    // Proxy everything else to Surge.sh
    const resp = await fetch(target, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : undefined,
      redirect: 'manual',
    });

    // Return proxied response with CORS support
    const headers = new Headers(resp.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('X-Robots-Tag', 'index, follow');

    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers,
    });
  },
};
