"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Code, Quote, Heading1, Heading2, Heading3 } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import { useAlert } from "@/components/AlertProvider";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import "./MarkdownEditor.css";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  hideTabs?: boolean;
}

export function MarkdownEditor({ value, onChange, hideTabs = false }: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<"code" | "preview">("code");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showAlert, showPrompt } = useAlert();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[150px] px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => {
      const md = (editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();
      onChange(md);
    },
  });

  // Handle external value changes (e.g. loading from DB)
  useEffect(() => {
    if (editor && value !== (editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown()) {
      // Only set content if it differs from what editor currently has
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
      } else {
        showAlert({ type: "error", title: "Upload Failed", message: data.error || "Failed to upload image" });
      }
    } catch {
      showAlert({ type: "error", title: "Upload Error", message: "Failed to upload image" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const setLink = async () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = await showPrompt({ 
      title: 'Insert Link', 
      message: 'Masukkan URL untuk tautan ini:', 
      defaultValue: previousUrl 
    });

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  return (
    <div className="md-editor-container">
      {/* Switch Header */}
      {!hideTabs && (
        <div className="md-editor-header">
          <div className="md-editor-tabs">
            <button 
              type="button"
              className={`md-editor-tab ${viewMode === "preview" ? "active" : ""}`}
              onClick={() => setViewMode("preview")}
            >
              Preview
            </button>
            <button 
              type="button"
              className={`md-editor-tab ${viewMode === "code" ? "active" : ""}`}
              onClick={() => setViewMode("code")}
            >
              Code
            </button>
          </div>
        </div>
      )}

      {viewMode === "code" && (
        <div className="md-editor-toolbar flex flex-wrap gap-1 p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <button 
            type="button" 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Heading 1"
          ><Heading1 size={16} /></button>
          <button 
            type="button" 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Heading 2"
          ><Heading2 size={16} /></button>
          <button 
            type="button" 
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('heading', { level: 3 }) ? 'bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Heading 3"
          ><Heading3 size={16} /></button>
          
          <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1 self-center" />
          
          <button 
            type="button" 
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('bold') ? 'bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Bold"
          ><Bold size={16} /></button>
          <button 
            type="button" 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('italic') ? 'bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Italic"
          ><Italic size={16} /></button>
          
          <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1 self-center" />
          
          <button 
            type="button" 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('bulletList') ? 'bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Bulleted List"
          ><List size={16} /></button>
          <button 
            type="button" 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('orderedList') ? 'bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Numbered List"
          ><ListOrdered size={16} /></button>
          
          <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1 self-center" />
          
          <button 
            type="button" 
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('blockquote') ? 'bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Quote"
          ><Quote size={16} /></button>
          <button 
            type="button" 
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('codeBlock') ? 'bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Code Block"
          ><Code size={16} /></button>
          <button 
            type="button" 
            onClick={setLink}
            className={`p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('link') ? 'bg-zinc-200 dark:bg-zinc-800' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Link"
          ><LinkIcon size={16} /></button>
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            className={`p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Upload Image" 
            disabled={isUploading}
          >
            <ImageIcon size={16} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadImage} />
        </div>
      )}

      <div className="md-editor-body">
        {viewMode === "code" ? (
          <EditorContent editor={editor} />
        ) : (
          <div className="md-preview prose dark:prose-invert max-w-none px-4 py-3">
            <EditorContent editor={editor} />
          </div>
        )}
      </div>
    </div>
  );
}
