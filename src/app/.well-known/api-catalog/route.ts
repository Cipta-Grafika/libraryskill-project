import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://libraryskill.com";

  // Implementation of RFC 9727 (API Catalog)
  const linkset = {
    linkset: [
      {
        anchor: `${baseUrl}/api/public/skills`,
        "service-doc": [
          {
            href: `${baseUrl}/docs`,
            type: "text/html",
          }
        ],
        status: [
          {
            href: `${baseUrl}/api/public/skills`, // serves as a health check implicitly
            type: "application/json"
          }
        ]
      }
    ]
  };

  return new NextResponse(JSON.stringify(linkset, null, 2), {
    headers: {
      "Content-Type": "application/linkset+json",
      "Cache-Control": "public, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
