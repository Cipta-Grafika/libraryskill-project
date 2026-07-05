import Link from "next/link";
import React from "react";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-copyright">
          &copy; {new Date().getFullYear()} <Link href="/" className="footer-copyright-link">LibrarySkill</Link>. All rights reserved.
        </div>
        
        <div className="footer-links">
          <Link href="/" className="footer-link">Home</Link>
          <Link href="/skills" className="footer-link">Skills</Link>
          <Link href="/docs" className="footer-link">Docs</Link>
          <Link href="/sitemap.xml" className="footer-link">Sitemap</Link>
          <Link href="/llms.txt" className="sr-only">LLM</Link>
          <Link href="/auth/login" className="footer-link">Login</Link>
        </div>
      </div>
    </footer>
  );
}
