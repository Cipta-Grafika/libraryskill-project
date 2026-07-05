"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { useAlert } from "@/components/AlertProvider";
import { Plus, Trash2 } from "lucide-react";
import { PageBanner } from "@/components/PageBanner";

type Series = {
  id: string;
  title: string;
  slug: string;
};

type ContentBlock = {
  id: string;
  title: string;
  content: string;
};

export default function EditDocClient({ initialData }: { initialData: { id: string, title?: string, description?: string | null, seriesSlug?: string | null, seriesOrder?: string, status: string, blocks?: ContentBlock[] } }) {
  const router = useRouter();
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [title, setTitle] = useState(initialData.title || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [seriesSlug, setSeriesSlug] = useState(initialData.seriesSlug || "");
  const [seriesOrder, setSeriesOrder] = useState<string>(initialData.seriesOrder || "");

  const [blocks, setBlocks] = useState<ContentBlock[]>(initialData.blocks || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();

  useEffect(() => {
    fetch("/api/series")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSeriesList(data);
      })
      .catch((err) => console.error("Failed to fetch series", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent, status: "DRAFT" | "PUBLISHED" = "DRAFT") => {
    e.preventDefault();

    const finalContent = blocks
      .filter((b) => b.title.trim() || b.content.trim())
      .map((b) => `# ${b.title}\n\n${b.content}`)
      .join("\n\n");

    if (!title || !finalContent.trim()) {
      showAlert({ type: "warning", title: "Validasi Gagal", message: "Title dan minimal satu blok konten harus diisi." });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/docs/${initialData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          content: finalContent,
          seriesSlug,
          seriesOrder: seriesOrder ? parseInt(seriesOrder, 10) : null,
          status,
        }),
      });

      if (res.ok) {
        router.push("/admin/docs");
        router.refresh();
      } else {
        const error = await res.json();
        showAlert({ type: "error", title: "Gagal Disimpan", message: error.message || "Failed to update document" });
      }
    } catch {
      showAlert({ type: "error", title: "Terjadi Kesalahan", message: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <PageBanner title="Edit Document" backHref="/admin/docs" backText="Back">
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
          onClick={(e) => handleSubmit(e, "PUBLISHED")}
          disabled={isSubmitting}
          className="skills-btn skills-btn-primary skills-btn-sm"
        >
          {initialData.status === "PUBLISHED" ? "Save Changes" : "Publish Document"}
        </button>
      </PageBanner>

      <div className="skills-page w-full">
        <div className="space-y-6">
          <div className="studio-form-section">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="studio-form-group" style={{ marginBottom: 0 }}>
                <label className="studio-label">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Getting Started Guide"
                  className="studio-input"
                  required
                />
              </div>

              <div className="studio-form-group" style={{ marginBottom: 0 }}>
                <label className="studio-label">Series</label>
                <select
                  value={seriesSlug}
                  onChange={(e) => setSeriesSlug(e.target.value)}
                  className="studio-select"
                >
                  <option value="">No Series (Standalone)</option>
                  {seriesList.map((series) => (
                    <option key={series.id} value={series.slug}>
                      {series.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="studio-form-group" style={{ marginBottom: 0 }}>
                <label className="studio-label">Series Order</label>
                <input
                  type="number"
                  value={seriesOrder}
                  onChange={(e) => setSeriesOrder(e.target.value)}
                  placeholder="e.g. 1"
                  className="studio-input"
                  min="1"
                />
              </div>
            </div>

            <div className="studio-form-group">
              <label className="studio-label">Short Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of this document..."
                className="studio-textarea"
                style={{ minHeight: '6rem', resize: 'none' }}
              />
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
                    placeholder="Block Title (e.g. Pendahuluan, Instalasi...)"
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
