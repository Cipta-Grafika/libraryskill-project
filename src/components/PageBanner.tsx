"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageBannerProps {
  backHref?: string;
  backText?: string;
  title?: string;
  containerClassName?: string;
  children?: React.ReactNode;
}

export function PageBanner({ backHref, backText, title, containerClassName, children }: PageBannerProps) {
  return (
    <div className="page-banner">
      <div className={`page-banner-container ${containerClassName || ""}`}>
        {backHref && backText ? (
          <Link href={backHref} className="page-banner-back">
            <ChevronLeft size={16} /> {backText}
          </Link>
        ) : title ? (
          <h1 className="text-xl font-bold" style={{ color: 'var(--table-text)' }}>{title}</h1>
        ) : (
          <div></div> /* Empty div to maintain space between if there are children on the right */
        )}
        
        {children && (
          <div className="page-banner-actions">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
