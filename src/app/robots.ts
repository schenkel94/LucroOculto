import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/launch", "/login", "/setup"]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}

function getBaseUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;
  const url = configuredUrl?.trim() || "http://localhost:3000";

  return url.startsWith("http") ? url : `https://${url}`;
}
