import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/variables.css";
import "@/styles/login.css";
import "@/styles/header.css";
import "@/styles/dashboard.css";
import "@/styles/users.css";
import "@/styles/categories.css";
import "@/styles/skills.css";
import "@/styles/studio.css";
import "@/styles/review.css";
import "@/styles/public-skill.css";
import "@/styles/error.css";
import "@/styles/page-banner.css";
import "@/styles/footer.css";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { AlertProvider } from "@/components/AlertProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://libraryskill.com"),
  title: "LibrarySkill",
  description: "Skills and Prompts documentation hub",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="llms" href="/llms.txt" />
        <link rel="sitemap" href="/sitemap.xml" />
        <link rel="robots" href="/robots.txt" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans transition-colors duration-300" suppressHydrationWarning>
        <AuthProvider session={session}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AlertProvider>
              {children}
            </AlertProvider>
          </ThemeProvider>
        </AuthProvider>

        {/* WebMCP: Expose basic site tools to AI Agents navigating via browser */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && window.navigator) {
                window.navigator.modelContext = window.navigator.modelContext || {};
                window.navigator.modelContext.provideContext = function() {
                  return {
                    tools: [
                      {
                        name: "search_skills",
                        description: "Search for prompt specifications in LibrarySkill",
                        inputSchema: {
                          type: "object",
                          properties: {
                            query: { type: "string" }
                          },
                          required: ["query"]
                        },
                        execute: async function(inputs) {
                          const res = await fetch("/api/search/skills?q=" + encodeURIComponent(inputs.query));
                          return await res.json();
                        }
                      }
                    ]
                  };
                };
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
