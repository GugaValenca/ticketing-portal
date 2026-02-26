const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length ? Buffer.concat(chunks) : null;
}

module.exports = async (req, res) => {
  const incomingUrl = new URL(req.url || "/", "http://localhost");
  const targetUrl = new URL(
    incomingUrl.pathname + incomingUrl.search,
    "https://ticketing-portal-api.vercel.app"
  );

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (!value || HOP_BY_HOP_HEADERS.has(key.toLowerCase()) || key === "host") {
      continue;
    }
    if (Array.isArray(value)) {
      headers.set(key, value.join(", "));
    } else {
      headers.set(key, value);
    }
  }

  const method = (req.method || "GET").toUpperCase();
  const body =
    method === "GET" || method === "HEAD" ? null : await readRequestBody(req);

  const upstreamResponse = await fetch(targetUrl, {
    method,
    headers,
    body,
    redirect: "manual",
  });

  res.statusCode = upstreamResponse.status;
  upstreamResponse.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      res.setHeader(key, value);
    }
  });

  const responseBuffer = Buffer.from(await upstreamResponse.arrayBuffer());
  res.end(responseBuffer);
};
