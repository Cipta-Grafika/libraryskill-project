"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { useAlert } from "@/components/AlertProvider";
import { PageBanner } from "@/components/PageBanner";

import { Plus, Trash2, X } from "lucide-react";

type Category = {
  id: string;
  name: string;
};

type ContentBlock = {
  id: string;
  title: string;
  content: string;
};

export default function NewSkillPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [blocks, setBlocks] = useState<ContentBlock[]>([
    { id: "1", title: "Peran AI (AI Role)", content: "" },
    { id: "2", title: "Batasan (Scope)", content: "" },
    { id: "3", title: "Objektif (Objective)", content: "" },
  ]);

  const [categoryId, setCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
  const isNavigatingAway = useRef(true);
  const { showAlert } = useAlert();

  // Note: markdown import is handled via drag & drop / upload on /studio dashboard.

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error("Failed to fetch categories", err));
  }, []);

  useEffect(() => {
    const draft = sessionStorage.getItem("new_skill_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.title) setTitle(parsed.title);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.categoryId) setCategoryId(parsed.categoryId);
        if (parsed.tags && Array.isArray(parsed.tags)) setTags(parsed.tags);
        if (parsed.blocks && Array.isArray(parsed.blocks)) setBlocks(parsed.blocks);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
    setIsLoaded(true);

    const handleBeforeUnload = () => {
      isNavigatingAway.current = false;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (isNavigatingAway.current) {
        sessionStorage.removeItem("new_skill_draft");
      }
    };
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const draft = { title, description, categoryId, tags, blocks };
      sessionStorage.setItem("new_skill_draft", JSON.stringify(draft));
    }
  }, [title, description, categoryId, tags, blocks, isLoaded]);

  const handleSubmit = async (e: React.FormEvent, status: "DRAFT" | "IN_REVIEW" | "PUBLISHED" = "DRAFT") => {
    e.preventDefault();

    let finalContent = blocks
      .filter((b) => b.title.trim() || b.content.trim())
      .map((b) => `# ${b.title}\n\n${b.content}`)
      .join("\n\n");

    if (!title || !finalContent.trim()) {
      showAlert({ type: "warning", title: "Validasi Gagal", message: "Title dan minimal satu blok konten harus diisi." });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit the skill data
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          tags,
          content: finalContent,
          categoryId,
          status,
        }),
      });

      if (res.ok) {
        isNavigatingAway.current = false;
        sessionStorage.removeItem("new_skill_draft");
        router.push("/studio/skills");
        router.refresh();
      } else {
        const error = await res.json();
        showAlert({ type: "error", title: "Gagal Disimpan", message: error.message || "Failed to create skill" });
      }
    } catch {
      showAlert({ type: "error", title: "Terjadi Kesalahan", message: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <PageBanner title="Create New Skill" backHref="/studio/skills" backText="Back">
        <button
          type="button"
          onClick={(e) => handleSubmit(e, "DRAFT")}
          disabled={isSubmitting}
          className="skills-btn skills-btn-outline skills-btn-sm"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={(e) => handleSubmit(e, "IN_REVIEW")}
          disabled={isSubmitting}
          className="skills-btn skills-btn-primary skills-btn-sm"
        >
          Submit for Review
        </button>
      </PageBanner>

      <div className="skills-page w-full">

      <div className="space-y-6">
        <div className="studio-form-section">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="studio-form-group" style={{ marginBottom: 0 }}>
              <label className="studio-label">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Prompt Engineering"
                className="studio-input"
                required
              />
            </div>

            <div className="studio-form-group" style={{ marginBottom: 0 }}>
              <label className="studio-label">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="studio-select"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="studio-form-group">
            <label className="studio-label">Short Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of this skill..."
              className="studio-textarea"
              style={{ minHeight: '6rem', resize: 'none' }}
            />
          </div>
          <div className="studio-form-group">
            <label className="studio-label">Tags</label>
            <div
              className="studio-input studio-tags-input-wrapper"
              onClick={() => document.getElementById("tag-input-new")?.focus()}
            >
              {tags.map((tag, index) => (
                <span key={index} className="studio-tag-badge">
                  {tag}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTags(tags.filter((_, i) => i !== index));
                    }}
                    className="studio-tag-remove"
                    title="Remove tag"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              <input
                id="tag-input-new"
                type="text"
                value={tagInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.includes(",")) {
                    const newTags = val.split(",")
                      .map(t => t.trim())
                      .filter(t => t !== "" && !tags.includes(t));
                    if (newTags.length > 0) {
                      setTags([...tags, ...newTags]);
                    }
                    setTagInput("");
                  } else {
                    setTagInput(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const val = tagInput.trim();
                    if (val && !tags.includes(val)) {
                      setTags([...tags, val]);
                      setTagInput("");
                    }
                  } else if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
                    setTags(tags.slice(0, -1));
                  }
                }}
                placeholder={tags.length === 0 ? "e.g. prompt, ai, nlp (press comma or enter)" : ""}
                className="studio-tags-inner-input"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">

          {blocks.map((block, index) => (
            <div key={block.id} className="studio-form-section" style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <div className="flex justify-between items-center mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <input
                  type="text"
                  value={block.title}
                  onChange={(e) => {
                    const newBlocks = [...blocks];
                    newBlocks[index].title = e.target.value;
                    setBlocks(newBlocks);
                  }}
                  className="studio-block-title-input"
                  placeholder="Block Title (e.g. Peran, Batasan...)"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (blocks.length > 1) {
                      setBlocks(blocks.filter((b) => b.id !== block.id));
                    } else {
                      showAlert({ type: "warning", title: "Tidak Bisa Dihapus", message: "Anda harus memiliki setidaknya satu blok konten." });
                    }
                  }}
                  className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                  title="Remove block"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <MarkdownEditor
                value={block.content}
                onChange={(val) => {
                  const newBlocks = [...blocks];
                  newBlocks[index].content = val;
                  setBlocks(newBlocks);
                }}
                                hideTabs={true}
                placeholder={`Write content for ${block.title || 'this block'}...`}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              setBlocks([...blocks, { id: Date.now().toString(), title: "", content: "" }]);
            }}
            className="w-full py-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-500 hover:text-zinc-800 hover:border-zinc-400 dark:hover:text-zinc-300 dark:hover:border-zinc-600 transition-colors flex items-center justify-center font-medium gap-2"
          >
            <Plus size={18} /> Add New Block
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
