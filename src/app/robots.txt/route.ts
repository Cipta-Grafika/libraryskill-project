import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://libraryskill.com";

  const robots = `User-Agent: *
Content-Signal: search=yes, ai-train=yes, ai-input=yes, use=full
Allow: /
Allow: /skills
Allow: /raw/
Allow: /llms.txt
Disallow: /admin/
Disallow: /review/
Disallow: /auth/
Disallow: /api/

User-Agent: GPTBot
User-Agent: ChatGPT-User
User-Agent: OAI-SearchBot
User-Agent: CCBot
User-Agent: anthropic-ai
User-Agent: Claude-Web
User-Agent: Google-Extended
Content-Signal: search=yes, ai-train=yes, ai-input=yes, use=full
Allow: /
Allow: /skills
Allow: /raw/
Allow: /llms.txt
Disallow: /admin/
Disallow: /review/
Disallow: /auth/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(robots, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
