import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pao-com-costela-x-norte.vercel.app";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/admin" },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
