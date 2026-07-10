"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { useAlert } from "@/components/AlertProvider";

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

export default function EditSkillPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingImages, setPendingImages] = useState<Record<string, File>>({});
  const { showAlert } = useAlert();

  useEffect(() => {
    // Fetch categories
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(console.error);

    // Fetch skill data
    fetch(`/api/skills/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setTitle(data.title);
        setDescription(data.description || "");
        setCategoryId(data.categoryId || "");
        setStatus(data.status);
        if (data.tags && Array.isArray(data.tags)) setTags(data.tags);
        
        // Parse content into blocks
        const parsedBlocks: ContentBlock[] = [];
        if (data.content) {
          const lines = data.content.split('\n');
          let currentTitle = "";
          let currentContent: string[] = [];
          let blockId = 1;
          
          lines.forEach((line: string) => {
            if (line.startsWith('# ')) {
              if (currentTitle || currentContent.some(l => l.trim() !== '')) {
                parsedBlocks.push({
                  id: Date.now().toString() + blockId++,
                  title: currentTitle || `Section ${blockId}`,
                  content: currentContent.join('\n').trim()
                });
              }
              currentTitle = line.substring(2).trim();
              currentContent = [];
            } else {
              currentContent.push(line);
            }
          });
          
          if (currentTitle || currentContent.some(l => l.trim() !== '')) {
            parsedBlocks.push({
              id: Date.now().toString() + blockId++,
              title: currentTitle || `Section ${blockId}`,
              content: currentContent.join('\n').trim()
            });
          }
        }
        
        if (parsedBlocks.length === 0) {
          parsedBlocks.push(
            { id: "1", title: "Peran AI (AI Role)", content: "" },
            { id: "2", title: "Batasan (Scope)", content: "" },
            { id: "3", title: "Objektif (Objective)", content: "" }
          );
        }
        setBlocks(parsedBlocks);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load skill");
        router.push("/studio/skills");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent, newStatus?: string) => {
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
      // 1. Upload any pending offline images that are actually used in the content
      const usedBlobUrls = Object.keys(pendingImages).filter((url) => finalContent.includes(url));
      
      for (const blobUrl of usedBlobUrls) {
        const file = pendingImages[blobUrl];
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.url) {
            // Replace the local blobUrl with the production URL
            finalContent = finalContent.replaceAll(blobUrl, uploadData.url);
          }
        } else {
          console.error("Failed to upload image during save");
        }
      }

      // 2. Submit the skill data
      const finalStatus = newStatus || status;
      const res = await fetch(`/api/skills/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          tags,
          content: finalContent,
          categoryId,
          status: finalStatus,
        }),
      });

      if (res.ok) {
        router.push("/studio/skills");
        router.refresh();
      } else {
        const error = await res.json();
        showAlert({ type: "error", title: "Gagal Disimpan", message: error.message || "Failed to update skill" });
      }
    } catch {
      showAlert({ type: "error", title: "Terjadi Kesalahan", message: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center text-zinc-500">Loading editor...</div>;
  }

  return (
    <div className="studio-container w-full">
      <div className="studio-header">
        <div>
          <h1 className="studio-title">Edit Skill</h1>
          <p className="studio-subtitle mt-1">Current status: <span className="font-semibold">{status}</span></p>
        </div>
        <div className="studio-actions">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, "DRAFT")}
            disabled={isSubmitting}
            className="studio-btn studio-btn-secondary"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, "IN_REVIEW")}
            disabled={isSubmitting || status === "IN_REVIEW" || status === "PUBLISHED"}
            className="studio-btn studio-btn-primary"
          >
            {status === "IN_REVIEW" ? "Under Review" : status === "PUBLISHED" ? "Published" : "Submit for Review"}
          </button>
        </div>
      </div>

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
              onClick={() => document.getElementById("tag-input-edit")?.focus()}
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
                id="tag-input-edit"
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
                onImageAdded={(file, blobUrl) => {
                  setPendingImages((prev) => ({ ...prev, [blobUrl]: file }));
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
  );
}
