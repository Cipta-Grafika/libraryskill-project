import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { DashboardSearch } from "@/components/DashboardSearch";
import { Globe, Rocket, History, Plus, ChevronRight } from "lucide-react";

export default async function AdminDashboard() {
  return (
    <div className="dashboard-container">
        <h1 className="dashboard-title">Explore your skills!</h1>
        
        <DashboardSearch />

        <div className="dashboard-grid">
          {/* Column 1 */}
          <div className="dashboard-column">
            <div className="dashboard-column-header">
              <span className="dashboard-column-header-title">My Skills <ChevronRight size={14}/></span>
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
              <div className="dashboard-card">
                <div className="dashboard-card-left">
                  <Globe size={16} className="dashboard-card-icon" />
                  <span>cetakia.com</span>
                </div>
                <ChevronRight size={16} className="dashboard-card-arrow" />
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="dashboard-column">
            <div className="dashboard-column-header">
              <span className="dashboard-column-header-title">Collections <ChevronRight size={14}/></span>
              <button><Plus size={16} /></button>
            </div>
            <div className="dashboard-empty-card">
              <Rocket size={16} />
              <span>Ship something new</span>
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
                  <span>Stream / <b>Plans</b></span>
                </div>
                <ChevronRight size={16} className="dashboard-card-arrow" />
              </div>
              <div className="dashboard-card">
                <div className="dashboard-card-left">
                  <History size={16} className="dashboard-card-icon" />
                  <span>Email Service / <b>Email Routing</b></span>
                </div>
                <ChevronRight size={16} className="dashboard-card-arrow" />
              </div>
              <div className="dashboard-card">
                <div className="dashboard-card-left">
                  <History size={16} className="dashboard-card-icon" />
                  <span>DNS / <b>Analytics</b></span>
                </div>
                <ChevronRight size={16} className="dashboard-card-arrow" />
              </div>
              <div className="dashboard-card">
                <div className="dashboard-card-left">
                  <History size={16} className="dashboard-card-icon" />
                  <span>DNS / <b>Settings</b></span>
                </div>
                <ChevronRight size={16} className="dashboard-card-arrow" />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
