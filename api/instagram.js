/**
 * Vercel Serverless Function — proxies Instagram Graph API so your access token
 * stays secret. New posts appear automatically when visitors load the page.
 *
 * Requirements (Meta):
 * - Instagram Professional account (Business or Creator)
 * - Facebook Page linked to that Instagram account
 * - Meta app with Instagram Graph / instagram_basic (and related) permissions
 *
 * Environment variables on Vercel (Settings → Environment Variables):
 *   INSTAGRAM_ACCESS_TOKEN  Long-lived User or Page access token with rights to read IG media
 *   INSTAGRAM_USER_ID       Your Instagram Business Account ID (numeric string)
 *
 * Find the IG user id: Graph API Explorer → GET /me/accounts → page id →
 * GET /{page-id}?fields=instagram_business_account
 *
 * Tokens expire (often ~60 days for long-lived user tokens); refresh via Meta docs
 * or automate with a scheduled job that refreshes the token and updates Vercel env.
 *
 * Local: `vercel dev` from the project root, then open http://localhost:3000
 */

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) {
    return res.status(503).json({
      error: "Instagram feed not configured",
      hint:
        "Add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID in your host (e.g. Vercel) environment variables.",
    });
  }

  const rawLimit = req.query && req.query.limit;
  const limit = Math.min(24, Math.max(1, parseInt(String(rawLimit || "9"), 10) || 9));

  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "thumbnail_url",
    "permalink",
    "children{media_url,media_type,thumbnail_url}",
  ].join(",");

  const url = new URL(`https://graph.facebook.com/v21.0/${userId}/media`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", token);

  try {
    const igRes = await fetch(url.href);
    const data = await igRes.json();
    if (!igRes.ok) {
      return res.status(igRes.status).json(data);
    }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: "Instagram proxy failed",
      message: err && err.message ? err.message : String(err),
    });
  }
};
