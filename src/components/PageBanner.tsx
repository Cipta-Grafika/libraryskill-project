"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageBannerProps {
  backHref?: string;
  backText?: string;
  children?: React.ReactNode;
}

export function PageBanner({ backHref, backText, children }: PageBannerProps) {
  return (
    <div className="page-banner">
      <div className="page-banner-container">
        {backHref && backText ? (
          <Link href={backHref} className="page-banner-back">
            <ChevronLeft size={16} /> {backText}
          </Link>
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
