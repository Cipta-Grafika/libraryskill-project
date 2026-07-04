import { Header } from "@/components/Header";

import Link from "next/link";
import { ArrowRight, BookOpen, Search, ShieldCheck } from "lucide-react";
import "@/styles/landing.css";

export default function Home() {
  return (
    <div className="landing-layout min-h-screen flex flex-col">
      <Header />
      
      <main className="landing-main flex-grow flex flex-col items-center">
        <div className="landing-hero-bg"></div>
        
        <div className="landing-hero-container">
          <div className="landing-badge">
            <span className="landing-badge-dot"></span>
            LibrarySkill Platform
          </div>
          
          <h1 className="landing-headline">
            Empower your knowledge with <br className="hidden md:block" />
            <span className="landing-highlight">LibrarySkill</span>
          </h1>
          
          <p className="landing-subtitle">
            A centralized hub to discover, review, and author cutting-edge prompt engineering techniques and digital skills.
          </p>
          
          <div className="landing-cta-group">
            <Link href="/skills" className="landing-btn-primary">
              Start Exploring <ArrowRight size={18} />
            </Link>
            <Link href="/frontend-development/prompt-engineering" className="landing-btn-secondary">
              View Example
            </Link>
          </div>
        </div>

        <div className="landing-features-wrapper">
          <div className="landing-features">
            <div className="landing-feature-card">
              <div className="landing-feature-icon-wrapper">
                <BookOpen size={24} />
              </div>
              <h3>Author & Create</h3>
              <p>Write standard Markdown to publish your skills seamlessly. Build a rich knowledge base with structured metadata and tags.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon-wrapper">
                <ShieldCheck size={24} />
              </div>
              <h3>Review & Refine</h3>
              <p>Collaborate with reviewers to maintain high-quality knowledge. Ensure every published skill meets your rigorous standards.</p>
            </div>
            <div className="landing-feature-card">
              <div className="landing-feature-icon-wrapper">
                <Search size={24} />
              </div>
              <h3>Discover</h3>
              <p>Easily search, filter, and learn from a public catalog of skills. Share your knowledge with the world securely.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
