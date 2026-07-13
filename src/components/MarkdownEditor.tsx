"use client";

import React, { useState, useRef, useEffect } from "react";

import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Code, Quote, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import TextAlign from '@tiptap/extension-text-align';
import Paragraph from '@tiptap/extension-paragraph';
import Heading from '@tiptap/extension-heading';
import { useAlert } from "@/components/AlertProvider";
import { Extension } from "@tiptap/core";
import { Plugin } from "prosemirror-state";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import ImageResize from "tiptap-extension-resize-image";
import "./MarkdownEditor.css";

// Tailwind Safelist: text-left text-center text-right text-justify

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  hideTabs?: boolean;
}

// Custom extension to clear formatting when pressing Enter
const ClearFormattingOnEnter = Extension.create({
  name: 'clearFormattingOnEnter',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleKeyDown(view, event) {
            if (event.key === 'Enter') {
              // Tunggu eksekusi "Enter" bawaan Tiptap selesai (misalnya membuat paragraf baru)
              requestAnimationFrame(() => {
                const { state, dispatch } = view;
                const { selection } = state;
                // Jika kursor berada di posisi kosong pada awal sebuah baris baru (seperti paragraf baru)
                if (selection.empty && selection.$from.parentOffset === 0) {
                  // Hapus semua formatting (bold, italic, dll) yang terbawa
                  const tr = state.tr.setStoredMarks([]);
                  dispatch(tr);
                }
              });
            }
            // Kembalikan false agar tidak memblokir perintah bawaan (misalnya split block)
            return false;
          }
        }
      })
    ];
  },
});

// Helper to replace standard Markdown images with HTML images if they were resized or aligned
function injectImageSizes(markdown: string, html: string) {
  const imgRegex = /<img[^>]+>/g;
  let newMarkdown = markdown;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    const imgTag = match[0];
    
    // Extract src
    const srcMatch = imgTag.match(/src="([^"]+)"/);
    if (!srcMatch) continue;
    
    // Decode HTML entities in src
    const src = srcMatch[1].replace(/&amp;/g, '&');
    
    // Check if it has any styling attributes from ImageResize
    const hasStyle = imgTag.includes('style="');
    const hasContainerStyle = imgTag.includes('containerstyle="');
    const hasWrapper = imgTag.includes('wrapperstyle="');
    
    if (hasStyle || hasContainerStyle || hasWrapper) {
      // Find the corresponding markdown image syntax: ![any_alt](src)
      const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const mdImgRegex = new RegExp(`!\\[[^\\]]*\\]\\(${escapeRegExp(src)}\\)`, 'g');
      
      // Inject the exact raw HTML img tag that Tiptap generated so it can parse it back
      newMarkdown = newMarkdown.replace(mdImgRegex, imgTag);
    }
  }
  return newMarkdown;
}

const CustomTextAlign = TextAlign.extend({
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textAlign: {
            default: this.options.defaultAlignment,
            parseHTML: element => {
              let alignClass = typeof element.className === 'string' && element.className.match(/text-(left|center|right|justify)/);
              if (alignClass) return alignClass[1];
              
              if (element.parentElement && element.parentElement.tagName === 'DIV' && typeof element.parentElement.className === 'string') {
                alignClass = element.parentElement.className.match(/text-(left|center|right|justify)/);
                if (alignClass) return alignClass[1];
              }

              return element.style.textAlign || this.options.defaultAlignment;
            },
            renderHTML: attributes => {
              if (attributes.textAlign === this.options.defaultAlignment) {
                return {};
              }
              return { class: `text-${attributes.textAlign}` };
            },
          },
        },
      },
    ];
  },
});

const CustomParagraph = Paragraph.extend({
  addStorage() {
    return {
      markdown: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serialize(state: any, node: any) {
          if (node.attrs.textAlign && node.attrs.textAlign !== 'left') {
            state.write(`<div class="text-${node.attrs.textAlign}">\n\n`);
            state.renderInline(node);
            state.write('\n\n</div>');
            state.closeBlock(node);
          } else {
            state.renderInline(node);
            state.closeBlock(node);
          }
        },
        parse: {
          setup() {}
        }
      }
    }
  }
});

const CustomHeading = Heading.extend({
  addStorage() {
    return {
      markdown: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serialize(state: any, node: any) {
          if (node.attrs.textAlign && node.attrs.textAlign !== 'left') {
            state.write(`<div class="text-${node.attrs.textAlign}">\n\n`);
            state.write(state.repeat('#', node.attrs.level) + ' ');
            state.renderInline(node);
            state.write('\n\n</div>');
            state.closeBlock(node);
          } else {
            state.write(state.repeat('#', node.attrs.level) + ' ');
            state.renderInline(node);
            state.closeBlock(node);
          }
        },
        parse: {
          setup() {}
        }
      }
    }
  }
});

export function MarkdownEditor({ value, onChange, hideTabs = false }: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<"code" | "preview">("code");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showAlert, showPrompt } = useAlert();
  const isInternalUpdate = useRef(false);
  const previousImagesRef = useRef<string[]>([]);
  const [, setUpdateTrigger] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        paragraph: false,
      }),
      CustomHeading,
      CustomParagraph,
      CustomTextAlign.configure({ types: ['heading', 'paragraph'] }),
      ClearFormattingOnEnter,
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      ImageResize.extend({ name: 'image' }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[150px] px-4 py-3",
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of items) {
          if (item.type.indexOf('image') === 0) {
            const file = item.getAsFile();
            if (file) {
              uploadFile(file);
              return true; // prevent default behavior
            }
          }
        }
        return false;
      },
      handleDrop(view, event, slice, moved) {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.indexOf('image') === 0) {
            uploadFile(file);
            return true; // prevent default behavior
          }
        }
        return false;
      }
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      // 1. Get raw markdown
      const md = (editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();
      // 2. Get HTML representation
      const html = editor.getHTML();
      
      // Auto-delete removed images
      if (typeof window !== 'undefined') {
        const currentImages = Array.from(new DOMParser().parseFromString(html, 'text/html').querySelectorAll('img'))
                                   .map(img => img.getAttribute('src'))
                                   .filter(src => src && src.startsWith('/upload/img/')) as string[];
        
        if (previousImagesRef.current.length > 0) {
          const deletedImages = previousImagesRef.current.filter(src => !currentImages.includes(src));
          deletedImages.forEach(src => {
            fetch('/api/upload/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: src })
            }).catch(console.error);
          });
        }
        previousImagesRef.current = currentImages;
      }

      // 3. Inject resized HTML img tags into the markdown
      const finalMd = injectImageSizes(md, html);
      
      onChange(finalMd);
      
      // Reset after React state finishes propagating
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
    },
  });

  // Handle external value changes (e.g. loading from DB)
  useEffect(() => {
    if (editor && !isInternalUpdate.current && value !== (editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown()) {
      // Only set content if it differs from what editor currently has
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Force re-render on selection or transaction to ensure toolbar active states update
  useEffect(() => {
    if (!editor) return;
    
    const update = () => {
      setUpdateTrigger((prev) => prev + 1);
    };

    editor.on('transaction', update);
    editor.on('selectionUpdate', update);

    return () => {
      editor.off('transaction', update);
      editor.off('selectionUpdate', update);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  const uploadFile = async (file: File) => {
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
        editor?.chain().focus().setImage({ src: data.url, alt: file.name }).run();
      } else {
        showAlert({ type: "error", title: "Upload Failed", message: data.error || "Failed to upload image" });
      }
    } catch {
      showAlert({ type: "error", title: "Upload Error", message: "Failed to upload image" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    <div className={`md-editor-container ${hideTabs ? 'md-editor-minimal' : ''}`}>
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
            className={`p-1.5 rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Heading 1"
          ><Heading1 size={16} /></button>
          <button 
            type="button" 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Heading 2"
          ><Heading2 size={16} /></button>
          <button 
            type="button" 
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('heading', { level: 3 }) ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Heading 3"
          ><Heading3 size={16} /></button>
          
          <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1 self-center" />
          
          <button 
            type="button" 
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('bold') ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Bold"
          ><Bold size={16} /></button>
          <button 
            type="button" 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('italic') ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Italic"
          ><Italic size={16} /></button>
          
          <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1 self-center" />
          
          <button 
            type="button" 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('bulletList') ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Bulleted List"
          ><List size={16} /></button>
          <button 
            type="button" 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('orderedList') ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Numbered List"
          ><ListOrdered size={16} /></button>
          
          <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1 self-center" />
          
          <button 
            type="button" 
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive({ textAlign: 'left' }) ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Align Left"
          ><AlignLeft size={16} /></button>
          <button 
            type="button" 
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive({ textAlign: 'center' }) ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Align Center"
          ><AlignCenter size={16} /></button>
          <button 
            type="button" 
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive({ textAlign: 'right' }) ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Align Right"
          ><AlignRight size={16} /></button>
          <button 
            type="button" 
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-1.5 rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Align Justify"
          ><AlignJustify size={16} /></button>

          <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1 self-center" />
          
          <button 
            type="button" 
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('blockquote') ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Quote"
          ><Quote size={16} /></button>
          <button 
            type="button" 
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('codeBlock') ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
            title="Code Block"
          ><Code size={16} /></button>
          <button 
            type="button" 
            onClick={setLink}
            className={`p-1.5 rounded transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 ${editor.isActive('link') ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}
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
