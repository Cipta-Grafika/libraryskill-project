"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Download, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, Eye } from "lucide-react";

type AuditLog = {
  id: string;
  userId: string | null;
  action: string;
  module: string;
  oldData: unknown | null;
  newData: unknown | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string;
    email: string;
  } | null;
};

type SortConfig = {
  key: keyof AuditLog | 'userName';
  direction: "asc" | "desc";
} | null;

export default function LogsClient({ initialLogs }: { initialLogs: AuditLog[] }) {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLogs(initialLogs);
  }, [initialLogs]);
  
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingLog, setViewingLog] = useState<AuditLog | null>(null);

  const openViewModal = (log: AuditLog) => {
    setViewingLog(log);
    setIsModalOpen(true);
  };

  const processedLogs = useMemo(() => {
    let filtered = logs;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(l => 
        l.action.toLowerCase().includes(q) || 
        l.module.toLowerCase().includes(q) ||
        (l.user?.name || "").toLowerCase().includes(q) ||
        (l.user?.email || "").toLowerCase().includes(q) ||
        (l.ipAddress || "").toLowerCase().includes(q)
      );
    }

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aRaw = sortConfig.key === 'userName' ? (a.user?.name || "") : a[sortConfig.key as keyof AuditLog];
        const bRaw = sortConfig.key === 'userName' ? (b.user?.name || "") : b[sortConfig.key as keyof AuditLog];
        
        const aCmp = aRaw instanceof Date ? aRaw.getTime() : (aRaw ?? "");
        const bCmp = bRaw instanceof Date ? bRaw.getTime() : (bRaw ?? "");
        
        if ((aCmp as string | number) < (bCmp as string | number)) return sortConfig.direction === "asc" ? -1 : 1;
        if ((aCmp as string | number) > (bCmp as string | number)) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [logs, searchQuery, sortConfig]);

  const totalRecords = processedLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginatedLogs = processedLogs.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleSort = (key: keyof AuditLog | 'userName') => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (columnKey: keyof AuditLog | 'userName') => {
    if (sortConfig?.key !== columnKey) return <ChevronUp size={14} className="opacity-20" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <>
      <div className="categories-controls">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--table-text)' }}>Audit Logs</h1>
        <div className="categories-actions-group">
          <button className="categories-btn categories-btn-outline"><Filter size={14}/> Filters</button>
          <button className="categories-btn categories-btn-outline"><Download size={14}/> Export</button>
        </div>
      </div>

      <div className="categories-table-container">
        <div className="categories-table-top">
          <div className="categories-search-container" style={{ margin: 0, height: '2.25rem', flex: 1, maxWidth: '100%', marginRight: '1rem' }}>
            <Search size={14} className="categories-search-icon" />
            <input 
              type="text" 
              placeholder="Search Logs (Action, Module, User, IP...)" 
              className="categories-search-input"
              style={{ fontSize: '0.8125rem' }}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          
          <div className="categories-pagination-top">
            <span className="mr-2">Show</span>
            <select 
              className="categories-per-page-select" 
              value={perPage} 
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="categories-table">
            <thead>
              <tr>
                <th className="categories-th sortable" style={{ width: '15%' }} onClick={() => handleSort('createdAt')}>
                  <div className="categories-th-inner">Timestamp {renderSortIcon("createdAt")}</div>
                </th>
                <th className="categories-th sortable" style={{ width: '15%' }} onClick={() => handleSort('userName')}>
                  <div className="categories-th-inner">User {renderSortIcon("userName")}</div>
                </th>
                <th className="categories-th sortable" style={{ width: '15%' }} onClick={() => handleSort('module')}>
                  <div className="categories-th-inner">Module {renderSortIcon("module")}</div>
                </th>
                <th className="categories-th sortable" style={{ width: '15%' }} onClick={() => handleSort('action')}>
                  <div className="categories-th-inner">Action {renderSortIcon("action")}</div>
                </th>
                <th className="categories-th sortable" style={{ width: '15%' }} onClick={() => handleSort('ipAddress')}>
                  <div className="categories-th-inner">IP Address {renderSortIcon("ipAddress")}</div>
                </th>
                <th className="categories-th text-right" style={{ width: '10%' }}>#</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="categories-td text-center text-zinc-500 py-8">No logs found.</td>
                </tr>
              ) : (
                paginatedLogs.map(l => (
                  <tr key={l.id} className="categories-tr">
                    <td className="categories-td" style={{ textOverflow: 'clip' }}>
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td className="categories-td" title={l.user?.email || 'System'}>
                      {l.user?.name || 'System'}
                    </td>
                    <td className="categories-td">{l.module}</td>
                    <td className="categories-td">
                      <span className={`header-role-badge ${l.action.includes('DELETE') ? 'danger' : ''}`}>
                        {l.action}
                      </span>
                    </td>
                    <td className="categories-td text-zinc-500" title={l.ipAddress || '-'}>{l.ipAddress || '-'}</td>
                    <td className="categories-td text-right">
                      <button className="categories-table-action-btn" onClick={() => openViewModal(l)}>
                        <Eye size={14} className="inline mr-1" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="categories-table-footer">
          <span>Showing {totalRecords === 0 ? 0 : (currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, totalRecords)} of {totalRecords}</span>
          <div className="categories-pagination-controls">
            <button 
              className="categories-page-btn" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="categories-page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && viewingLog && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Log Details</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Timestamp</p>
                  <p className="font-medium text-sm">{new Date(viewingLog.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">User</p>
                  <p className="font-medium text-sm">{viewingLog.user?.name || 'System'} ({viewingLog.user?.email || 'N/A'})</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Module / Action</p>
                  <p className="font-medium text-sm">{viewingLog.module} / {viewingLog.action}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">IP & Agent</p>
                  <p className="font-medium text-sm truncate" title={viewingLog.userAgent || ""}>
                    {viewingLog.ipAddress || 'Unknown IP'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-2 font-medium">Old Data</p>
                  <pre className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs overflow-auto max-h-[300px]">
                    {viewingLog.oldData ? JSON.stringify(viewingLog.oldData, null, 2) : "None"}
                  </pre>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-2 font-medium">New Data</p>
                  <pre className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800 text-xs overflow-auto max-h-[300px]">
                    {viewingLog.newData ? JSON.stringify(viewingLog.newData, null, 2) : "None"}
                  </pre>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="categories-btn categories-btn-outline" 
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
