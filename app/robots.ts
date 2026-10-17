import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sitequote.app";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/signup", "/privacy", "/terms", "/q/"],
      disallow: ["/jobs", "/dashboard", "/prices", "/onboarding", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
