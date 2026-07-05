"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { BookOpen, Clock, CheckCircle, Edit3, Rocket } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Skill = {
  id: string;
  status: string;
};

export default function AuthorDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/skills")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSkills(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const stats = {
    total: skills.length,
    drafts: skills.filter(s => s.status === "DRAFT").length,
    inReview: skills.filter(s => s.status === "IN_REVIEW").length,
    published: skills.filter(s => s.status === "PUBLISHED").length,
  };

  // ── Shared markdown parser ─────────────────────────────────────────────────
  // Identical mapping rules as the Import .md button on /studio/skills/new:
  //   First `# …`   → title field
  //   First `### …` immediately after → description field
  //   Every subsequent `# …` → one content block (title = heading, body = content)
  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.md')) {
      alert("Please upload a Markdown (.md) file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const raw = evt.target?.result as string;
      if (!raw) return;

      let importedTitle = "";
      let importedDescription = "";

      // Normalise CRLF → LF, then split into individual lines
      const lines = raw.replace(/\r\n/g, "\n").split("\n");
      let cursor = 0;

      // Step 1 – Strip optional YAML frontmatter (--- … ---)
      if (lines[cursor]?.trim() === "---") {
        cursor++;
        const yamlLines: string[] = [];
        while (cursor < lines.length && lines[cursor]?.trim() !== "---") {
          yamlLines.push(lines[cursor++]);
        }
        cursor++; // skip closing ---
        const yaml = yamlLines.join("\n");
        const tm = yaml.match(/^title:\s*"?([^"\n]+)"?\s*$/m);
        const dm = yaml.match(/^description:\s*"?([^"\n]+)"?\s*$/m);
        if (tm) importedTitle       = tm[1].trim();
        if (dm) importedDescription = dm[1].trim();
      }

      // Skip leading blank lines
      while (cursor < lines.length && lines[cursor].trim() === "") cursor++;

      // Step 2 – First `# …` line → title (unless frontmatter already set it)
      if (!importedTitle && /^# /.test(lines[cursor] ?? "")) {
        importedTitle = lines[cursor].replace(/^# /, "").trim();
        cursor++;
      }

      // Skip blank lines between title and description
      while (cursor < lines.length && lines[cursor].trim() === "") cursor++;

      // Step 3 – First `### …` line → description (unless frontmatter already set it)
      if (!importedDescription && /^### /.test(lines[cursor] ?? "")) {
        importedDescription = lines[cursor].replace(/^### /, "").trim();
        cursor++;
      }

      // Skip blank lines before first content block
      while (cursor < lines.length && lines[cursor].trim() === "") cursor++;

      // Step 4 – Remaining lines → split into blocks on every `# ` (exactly one `#`)
      const parsedBlocks: { id: string; title: string; content: string }[] = [];
      let currentTitle = "";
      let currentLines: string[] = [];

      const flushBlock = () => {
        if (!currentTitle && currentLines.length === 0) return;
        while (currentLines.length > 0 && currentLines[currentLines.length - 1].trim() === "") {
          currentLines.pop();
        }
        parsedBlocks.push({
          id: `${Date.now()}-${parsedBlocks.length}`,
          title: currentTitle || "Content",
          content: currentLines.join("\n"),
        });
        currentTitle = "";
        currentLines = [];
      };

      for (; cursor < lines.length; cursor++) {
        const line = lines[cursor];
        if (/^# /.test(line)) {
          flushBlock();
          currentTitle = line.replace(/^# /, "").trim();
        } else {
          currentLines.push(line);
        }
      }
      flushBlock(); // flush the last block

      // Step 5 – Persist to sessionStorage so /studio/skills/new can hydrate
      const draft = {
        title:       importedTitle  || file.name.replace(/\.md$/i, ""),
        description: importedDescription,
        categoryId:  "",
        tags:        [] as string[],
        blocks:      parsedBlocks.length > 0
          ? parsedBlocks
          : [{ id: Date.now().toString(), title: "Content", content: raw }],
      };
      sessionStorage.setItem("new_skill_draft", JSON.stringify(draft));
      router.push("/studio/skills/new");
    };
    reader.readAsText(file);
  };


  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="studio-container w-full">
      <div className="studio-header">
        <div>
          <h1 className="studio-title">
            Welcome back, <span className="text-[var(--primary)]">{session?.user?.name || 'Author'}</span>
          </h1>
          <p className="studio-subtitle">
            Here&apos;s an overview of your prompt documentation studio.
          </p>
        </div>
        <div className="studio-actions">
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-zinc-500">Loading your dashboard...</div>
      ) : (
        <>
          <div className="studio-stats-grid" style={{ marginBottom: '1rem' }}>
            <div className="studio-stat-card">
              <div className="studio-stat-header">
                <BookOpen size={16} className="text-blue-500" />
                <span className="studio-stat-title">Total Skills</span>
              </div>
              <span className="studio-stat-value">{stats.total}</span>
            </div>
            
            <div className="studio-stat-card">
              <div className="studio-stat-header">
                <Edit3 size={16} className="text-zinc-400" />
                <span className="studio-stat-title">Drafts</span>
              </div>
              <span className="studio-stat-value">{stats.drafts}</span>
            </div>

            <div className="studio-stat-card">
              <div className="studio-stat-header">
                <Clock size={16} className="text-yellow-500" />
                <span className="studio-stat-title">In Review</span>
              </div>
              <span className="studio-stat-value">{stats.inReview}</span>
            </div>

            <div className="studio-stat-card">
              <div className="studio-stat-header">
                <CheckCircle size={16} className="text-green-500" />
                <span className="studio-stat-title">Published</span>
              </div>
              <span className="studio-stat-value">{stats.published}</span>
            </div>
          </div>

          <div 
            className={`dashboard-empty-card relative overflow-hidden transition-all duration-200 border-2 border-dashed ${
              isDragging ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'border-zinc-300 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-700'
            }`}
            style={{ width: '100%', cursor: 'default' }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              accept=".md" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  processFile(e.target.files[0]);
                }
              }}
            />
            <Rocket size={16} className={`transition-opacity ${isDragging ? "invisible" : ""}`} />
            <div className={`flex items-center gap-1.5 flex-wrap justify-center transition-opacity ${isDragging ? "invisible" : ""}`}>
              <Link href="/studio/skills/new" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium">
                Create something new
              </Link>
              <span>or</span>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors font-medium cursor-pointer"
              >
                upload file MD
              </button>
              <span>(Drag & Drop Here)</span>
            </div>
            
            {isDragging && (
              <div className="absolute inset-0 bg-orange-500/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-10">
                <span className="text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-2">
                  <Rocket size={18} className="animate-bounce" /> Drop Markdown file here!
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
