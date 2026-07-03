"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchSkill {
  id: string;
  title: string;
  slug: string;
  category: {
    name: string;
    slug: string;
  } | null;
}

export function DashboardSearch({ 
  basePath = "/admin/skills",
  apiEndpoint = "/api/search/skills",
  isPublicSearch = false
}: { 
  basePath?: string;
  apiEndpoint?: string;
  isPublicSearch?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [skills, setSkills] = useState<SearchSkill[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch skills when component mounts
    async function fetchSkills() {
      try {
        const res = await fetch(apiEndpoint);
        if (res.ok) {
          const data = await res.json();
          setSkills(data);
        }
      } catch (error) {
        console.error("Error fetching skills for search:", error);
      }
    }
    fetchSkills();
  }, []);

  // Debounce the query input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [query]);

  const filteredSkills = skills.filter((skill) => {
    const searchString = `${skill.category?.name || 'uncategorized'} ${skill.title}`.toLowerCase();
    return searchString.includes(debouncedQuery.toLowerCase());
  });

  // Reset selected index when debounced query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // cmd+k or ctrl+k to focus
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        return;
      }
      
      if (!isOpen) return;

      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredSkills.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredSkills.length > 0 && selectedIndex >= 0) {
          const selectedSkill = filteredSkills[selectedIndex];
          if (isPublicSearch && selectedSkill.category) {
            router.push(`/${selectedSkill.category.slug}/${selectedSkill.slug}`);
          } else {
            router.push(`${basePath}/${selectedSkill.slug}`);
          }
          setIsOpen(false);
          inputRef.current?.blur();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredSkills, selectedIndex, router]);

  return (
    <div className="search-wrapper" ref={containerRef}>
      <div className={`search-input-container ${isOpen ? 'focused' : ''}`}>
        <Search className="search-icon" size={18} />
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        <div className="search-kbd-group">
          <span className="search-kbd">⌘</span>
          <span className="search-kbd">K</span>
        </div>
      </div>

      {isOpen && debouncedQuery.trim().length > 0 && (
        <div className="search-modal">
          <div className="search-modal-header">
            {filteredSkills.length} Skills Found
          </div>
          <div className="search-modal-list overflow-y-auto max-h-[400px]">
            {filteredSkills.length > 0 ? (
              filteredSkills.map((skill, index) => {
                const isSelected = index === selectedIndex;
                const catName = skill.category?.name?.toLowerCase() || 'uncategorized';
                
                return (
                  <div 
                    key={skill.id} 
                    className={`search-modal-item ${isSelected ? 'active' : ''}`}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => {
                      if (isPublicSearch && skill.category) {
                        router.push(`/${skill.category.slug}/${skill.slug}`);
                      } else {
                        router.push(`${basePath}/${skill.slug}`);
                      }
                      setIsOpen(false);
                    }}
                  >
                    <div className="search-modal-item-icon">
                      <Sparkles size={16} />
                    </div>
                    <span className="search-modal-item-title">{catName}:</span>
                    <span className="search-modal-item-desc">— {skill.title}</span>
                    <ArrowRight size={14} className={`search-modal-item-arrow ${isSelected ? 'opacity-100 text-[var(--dash-text)]' : ''}`} />
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-sm text-[var(--studio-text-muted)]">
                No skills found matching "{query}"
              </div>
            )}
          </div>
          <div className="search-modal-footer">
            <div className="search-modal-footer-item">
              <span className="search-modal-footer-kbd">↑</span>
              <span className="search-modal-footer-kbd">↓</span>
              <span>to navigate</span>
            </div>
            <div className="search-modal-footer-item">
              <span className="search-modal-footer-kbd">↵</span>
              <span>to select</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
