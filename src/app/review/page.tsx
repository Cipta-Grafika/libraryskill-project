import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { DashboardSearch } from "@/components/DashboardSearch";
import { Globe, Rocket, History, Plus, ChevronRight } from "lucide-react";

export default async function ReviewDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "REVIEWER" && session.user.role !== "SUPERADMIN")) {
    redirect("/auth/login");
  }

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <h1 className="dashboard-title">Explore your skills!</h1>
        
        <DashboardSearch />

        <div className="dashboard-grid">
          {/* Column 1 */}
          <div className="dashboard-column">
            <div className="dashboard-column-header">
              <span className="dashboard-column-header-title">Pending Reviews <ChevronRight size={14}/></span>
              <button><Plus size={16} /></button>
            </div>
            <div className="dashboard-card-list">
              <div className="dashboard-card">
                <div className="dashboard-card-left">
                  <Globe size={16} className="dashboard-card-icon" />
                  <span>libraryskill.com</span>
                </div>
                <ChevronRight size={16} className="dashboard-card-arrow" />
              </div>
              <div className="dashboard-card">
                <div className="dashboard-card-left">
                  <Globe size={16} className="dashboard-card-icon" />
                  <span>digitalprint.biz.id</span>
                </div>
                <ChevronRight size={16} className="dashboard-card-arrow" />
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="dashboard-column">
            <div className="dashboard-column-header">
              <span className="dashboard-column-header-title">Approved <ChevronRight size={14}/></span>
              <button><Plus size={16} /></button>
            </div>
            <div className="dashboard-empty-card">
              <Rocket size={16} />
              <span>No recent approvals</span>
            </div>
          </div>

          {/* Column 3 */}
          <div className="dashboard-column">
            <div className="dashboard-column-header">
              <span className="dashboard-column-header-title">Recents</span>
            </div>
            <div className="dashboard-card-list">
              <div className="dashboard-card">
                <div className="dashboard-card-left">
                  <History size={16} className="dashboard-card-icon" />
                  <span>Review / <b>Skill A</b></span>
                </div>
                <ChevronRight size={16} className="dashboard-card-arrow" />
              </div>
              <div className="dashboard-card">
                <div className="dashboard-card-left">
                  <History size={16} className="dashboard-card-icon" />
                  <span>Feedback / <b>Skill B</b></span>
                </div>
                <ChevronRight size={16} className="dashboard-card-arrow" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
