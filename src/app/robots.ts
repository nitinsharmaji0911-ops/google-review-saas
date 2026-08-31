import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/settings/", "/feedback/"],
    },
    sitemap: "https://google-review-saas.vercel.app/sitemap.xml",
  };
}
