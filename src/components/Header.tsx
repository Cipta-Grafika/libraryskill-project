"use client";

import { useState, useRef, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { User, ChevronRight, Users, Grid, BookOpen, ScrollText, PlusCircle, Inbox, PlusSquare, Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const role = session?.user?.role;
  
  let homeHref = "/";
  if (role === "SUPERADMIN") homeHref = "/admin";
  else if (role === "REVIEWER") homeHref = "/review";
  else if (role === "AUTHOR") homeHref = "/studio";

  if (!isMounted) return null;

  return (
    <header className="header">
      <div className="header-container">
        <div className="flex items-center gap-4">
          <Link href={homeHref} className="header-logo-section hover:opacity-80 transition-opacity">
            <div className="header-logo-icon">L</div>
            <span className="header-title">LibrarySkill</span>
            {role && (
              <span className="header-role-badge">
                {role.toLowerCase()}
              </span>
            )}
          </Link>

          {role && (
            <div className="mobile-menu-container" ref={mobileMenuRef}>
              <button 
                className="mobile-menu-btn" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              
              {mobileMenuOpen && (
                <nav className="mobile-menu-dropdown">
                  {role === "SUPERADMIN" && (
                    <>
                      <Link href="/admin/users" className={`mobile-nav-link ${pathname.includes('/admin/users') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <Users size={16} /> Users
                      </Link>
                      <Link href="/admin/categories" className={`mobile-nav-link ${pathname.includes('/admin/categories') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <Grid size={16} /> Categories
                      </Link>
                      <Link href="/admin/skills" className={`mobile-nav-link ${pathname.includes('/admin/skills') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <BookOpen size={16} /> Skills
                      </Link>
                      <Link href="/admin/audit-logs" className={`mobile-nav-link ${pathname.includes('/admin/audit-logs') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <ScrollText size={16} /> Logs
                      </Link>
                    </>
                  )}
                  {role === "REVIEWER" && (
                    <>
                      <Link href="/review/queue" className={`mobile-nav-link ${pathname.includes('/review/queue') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <Inbox size={16} /> Queue
                      </Link>
                      <Link href="/review/skills" className={`mobile-nav-link ${pathname.includes('/review/skills') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <BookOpen size={16} /> All Skills
                      </Link>
                    </>
                  )}
                  {role === "AUTHOR" && (
                    <>
                      <Link href="/studio/skills/new" className={`mobile-nav-link ${pathname.includes('/studio/skills/new') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <PlusCircle size={16} /> New Skill
                      </Link>
                      <Link href="/studio/skills" className={`mobile-nav-link ${pathname === '/studio/skills' ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                        <BookOpen size={16} /> My Skills
                      </Link>
                    </>
                  )}
                </nav>
              )}
            </div>
          )}

          {/* Navigation Menu */}
          {role && (
            <nav className="header-nav">
              {role === "SUPERADMIN" && (
                <>
                  <Link href="/admin/users" className={`header-nav-link ${pathname.includes('/admin/users') ? 'active' : ''}`}>
                    <Users size={16} /> Users
                  </Link>
                  <Link href="/admin/categories" className={`header-nav-link ${pathname.includes('/admin/categories') ? 'active' : ''}`}>
                    <Grid size={16} /> Categories
                  </Link>
                  <Link href="/admin/skills" className={`header-nav-link ${pathname.includes('/admin/skills') ? 'active' : ''}`}>
                    <BookOpen size={16} /> Skills
                  </Link>
                  <Link href="/admin/audit-logs" className={`header-nav-link ${pathname.includes('/admin/audit-logs') ? 'active' : ''}`}>
                    <ScrollText size={16} /> Logs
                  </Link>
                </>
              )}
              {role === "REVIEWER" && (
                <>
                  <Link href="/review/queue" className={`header-nav-link ${pathname.includes('/review/queue') ? 'active' : ''}`}>
                    <Inbox size={16} /> Queue
                  </Link>
                  <Link href="/review/skills" className={`header-nav-link ${pathname.includes('/review/skills') ? 'active' : ''}`}>
                    <BookOpen size={16} /> All Skills
                  </Link>
                </>
              )}
              {role === "AUTHOR" && (
                <>
                  <Link href="/studio/skills/new" className={`header-nav-link ${pathname.includes('/studio/skills/new') ? 'active' : ''}`}>
                    <PlusCircle size={16} /> New Skill
                  </Link>
                  <Link href="/studio/skills" className={`header-nav-link ${pathname === '/studio/skills' ? 'active' : ''}`}>
                    <BookOpen size={16} /> My Skills
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        <div className="header-actions">
          <Link href="/studio/skills/new" className="header-icon-btn" aria-label="Create new skill">
            <PlusSquare size={18} />
          </Link>

          <ThemeToggle />
          
          <div className="dropdown-container" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`header-icon-btn ${dropdownOpen ? 'active' : ''}`}
              aria-label="User menu"
            >
              <User size={18} />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="px-4 py-2 mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{session?.user?.name || 'User'}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{session?.user?.email}</p>
                </div>
                <div className="dropdown-divider"></div>
                <Link href="/studio/skills/new" className="dropdown-item">
                  <span>Create Skill</span>
                </Link>
                <button className="dropdown-item">
                  <span>Profile</span>
                </button>
                <button className="dropdown-item">
                  <span>Billing</span>
                </button>
                <button className="dropdown-item flex items-center justify-between">
                  <span>Appearance</span>
                  <ChevronRight size={14} className="text-zinc-400" />
                </button>
                <button className="dropdown-item flex items-center justify-between">
                  <span>Language</span>
                  <ChevronRight size={14} className="text-zinc-400" />
                </button>
                <button className="dropdown-item flex items-center justify-between">
                  <span>Timezone</span>
                  <ChevronRight size={14} className="text-zinc-400" />
                </button>
                <div className="dropdown-divider"></div>
                <button 
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                  className="dropdown-item danger"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
