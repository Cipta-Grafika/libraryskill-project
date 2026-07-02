import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ForbiddenPage() {
  const session = await getServerSession(authOptions);
  
  let redirectUrl = "/auth/login";
  let redirectText = "Go to Login";

  if (session) {
    if (session.user.role === "SUPERADMIN") {
      redirectUrl = "/admin";
      redirectText = "Return to Admin Dashboard";
    } else if (session.user.role === "REVIEWER") {
      redirectUrl = "/review/queue";
      redirectText = "Return to Reviewer Dashboard";
    } else if (session.user.role === "AUTHOR") {
      redirectUrl = "/studio";
      redirectText = "Return to Studio";
    }
  }

  return (
    <div className="error-page-container">
      <div className="error-card">
        <div className="error-icon-wrapper">
          <ShieldAlert className="error-icon" />
        </div>
        
        <h1 className="error-title">403 Forbidden</h1>
        <p className="error-message">
          You do not have the required permissions to access this page. 
          Please return to your designated dashboard or contact an administrator.
        </p>

        <div className="error-actions">
          <Link href={redirectUrl} className="error-btn">
            {redirectText}
          </Link>
        </div>
      </div>
    </div>
  );
}
