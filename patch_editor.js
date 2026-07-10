const fs = require('fs');

let content = fs.readFileSync('src/components/MarkdownEditor.tsx', 'utf8');

// Remove onImageAdded from props
content = content.replace(/onImageAdded\?:\s*\(file:\s*File,\s*blobUrl:\s*string\)\s*=>\s*void;/g, '');
content = content.replace(/onImageAdded,/g, '');

// Insert previousImagesRef
content = content.replace(
  /const isInternalUpdate = useRef\(false\);/,
  `const isInternalUpdate = useRef(false);
  const previousImagesRef = useRef<string[]>([]);`
);

// We need to initialize previousImagesRef once the editor is ready
// and also check for deletions onUpdate.
const onUpdateCode = `
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      // 1. Get raw markdown
      const md = (editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();
      // 2. Get HTML representation
      const html = editor.getHTML();
      
      // Auto-delete removed images
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

      // 3. Inject resized HTML img tags into the markdown
      const finalMd = injectImageSizes(md, html);
      
      onChange(finalMd);
      
      // Reset after React state finishes propagating
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
    },
`;

// Replace onUpdate block
content = content.replace(/onUpdate:\s*\(\{\s*editor\s*\}\)\s*=>\s*\{[\s\S]*?\},/m, onUpdateCode.trim() + ',');

// Replace handleUploadImage with a generic upload helper
const uploadHelperCode = `
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
`;

content = content.replace(/const handleUploadImage = async [\s\S]*?};\n/m, uploadHelperCode);

// Add handlePaste and handleDrop to editorProps
const editorPropsCode = `
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[150px] px-4 py-3",
      },
      handlePaste(view, event, slice) {
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
`;

content = content.replace(/editorProps:\s*\{\s*attributes:\s*\{\s*class:\s*"prose dark:prose-invert max-w-none focus:outline-none min-h-\[150px\] px-4 py-3",\s*\},\s*\},/m, editorPropsCode.trim());

fs.writeFileSync('src/components/MarkdownEditor.tsx', content);
