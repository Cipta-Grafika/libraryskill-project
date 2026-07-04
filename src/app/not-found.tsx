import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="error-page-container">
      <div className="error-card">
        <div className="error-icon-wrapper">
          <FileQuestion className="error-icon" />
        </div>
        
        <h1 className="error-title">404 Not Found</h1>
        <p className="error-message">
          The page or resource you are looking for could not be found. 
          It might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="error-actions">
          <Link href="/" className="error-btn">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
