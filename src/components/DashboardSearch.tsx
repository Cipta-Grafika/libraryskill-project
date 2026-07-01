"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Sparkles, LogIn, BrainCircuit, Code, Database, ArrowRight } from "lucide-react";

export function DashboardSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut cmd+k to focus
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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

      {isOpen && (
        <div className="search-modal">
          <div className="search-modal-header">Search tips</div>
          <div className="search-modal-list">
            <div className="search-modal-item">
              <div className="search-modal-item-icon">
                <Sparkles size={16} />
              </div>
              <span className="search-modal-item-title">ask:</span>
              <span className="search-modal-item-desc">— Ask AI</span>
              <ArrowRight size={14} className="search-modal-item-arrow" />
            </div>
            <div className="search-modal-item">
              <div className="search-modal-item-icon">
                <LogIn size={16} />
              </div>
              <span className="search-modal-item-title">access:</span>
              <span className="search-modal-item-desc">— Search Access applications</span>
            </div>
            <div className="search-modal-item">
              <div className="search-modal-item-icon">
                <BrainCircuit size={16} />
              </div>
              <span className="search-modal-item-title">aig:</span>
              <span className="search-modal-item-desc">— Search AI Gateways</span>
            </div>
            <div className="search-modal-item">
              <div className="search-modal-item-icon">
                <Code size={16} />
              </div>
              <span className="search-modal-item-title">containers:</span>
              <span className="search-modal-item-desc">— Search Container applications</span>
            </div>
            <div className="search-modal-item">
              <div className="search-modal-item-icon">
                <Database size={16} />
              </div>
              <span className="search-modal-item-title">d1:</span>
              <span className="search-modal-item-desc">— Search D1 databases</span>
            </div>
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
