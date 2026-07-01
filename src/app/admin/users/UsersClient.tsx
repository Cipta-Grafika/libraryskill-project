"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Settings, Download, Upload, Plus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { createUser } from "./actions";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  slug: string;
  bio: string | null;
  createdAt: Date;
};

type SortConfig = {
  key: keyof User;
  direction: "asc" | "desc";
} | null;

export default function UsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Sync users if server data changes (e.g., after adding a new record)
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Process Users: Filter -> Sort -> Paginate
  const processedUsers = useMemo(() => {
    let filtered = users;

    // 1. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }

    // 2. Sort
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any = a[sortConfig.key];
        let bVal: any = b[sortConfig.key];
        
        if (aVal === null || aVal === undefined) aVal = "";
        if (bVal === null || bVal === undefined) bVal = "";
        
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [users, searchQuery, sortConfig]);

  // 3. Paginate
  const totalRecords = processedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = processedUsers.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleSort = (key: keyof User) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof User }) => {
    if (sortConfig?.key !== columnKey) return <ChevronUp size={14} className="opacity-20" />;
    return sortConfig.direction === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedUsers.map(u => u.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError("");

    const formData = new FormData(e.currentTarget);
    
    const result = await createUser(formData);
    
    if (result?.error) {
      setModalError(result.error);
      setIsSubmitting(false);
    } else {
      setIsModalOpen(false);
      setIsSubmitting(false);
      // Data will refresh via revalidatePath
    }
  };

  return (
    <>
      <div className="users-controls">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--table-text)' }}>Users</h1>
        <div className="users-actions-group">
          <button className="users-btn users-btn-outline"><Filter size={14}/> Filters</button>
          <button className="users-btn users-btn-outline"><Upload size={14}/> Import</button>
          <button className="users-btn users-btn-outline"><Download size={14}/> Export</button>
          <button className="users-btn users-btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={14}/> Add
          </button>
        </div>
      </div>

      <div className="users-table-container">
        <div className="users-table-top">
          <div className="users-search-container" style={{ margin: 0, height: '2.25rem', flex: 1, maxWidth: '100%', marginRight: '1rem' }}>
            <Search size={14} className="users-search-icon" />
            <input 
              type="text" 
              placeholder="Search Users" 
              className="users-search-input"
              style={{ fontSize: '0.8125rem' }}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // reset to first page on search
              }}
            />
          </div>
          
          <div className="users-pagination-top">
            <span className="mr-2">Show</span>
            <select 
              className="users-per-page-select" 
              value={perPage} 
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="users-table">
            <thead>
              <tr>
                <th className="users-th users-th-checkbox">
                  <input 
                    type="checkbox" 
                    className="users-checkbox" 
                    checked={paginatedUsers.length > 0 && selectedIds.size === paginatedUsers.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="users-th sortable" style={{ width: '15%' }} onClick={() => handleSort('name')}>
                  <div className="users-th-inner">Name <SortIcon columnKey="name" /></div>
                </th>
                <th className="users-th sortable" style={{ width: '20%' }} onClick={() => handleSort('email')}>
                  <div className="users-th-inner">Email <SortIcon columnKey="email" /></div>
                </th>
                <th className="users-th sortable" style={{ width: '15%' }} onClick={() => handleSort('slug')}>
                  <div className="users-th-inner">Slug <SortIcon columnKey="slug" /></div>
                </th>
                <th className="users-th sortable" style={{ width: '20%' }} onClick={() => handleSort('bio')}>
                  <div className="users-th-inner">Bio <SortIcon columnKey="bio" /></div>
                </th>
                <th className="users-th sortable" style={{ width: '10%', textOverflow: 'clip' }} onClick={() => handleSort('role')}>
                  <div className="users-th-inner">Role <SortIcon columnKey="role" /></div>
                </th>
                <th className="users-th sortable" style={{ width: '10%', textOverflow: 'clip' }} onClick={() => handleSort('createdAt')}>
                  <div className="users-th-inner">Created <SortIcon columnKey="createdAt" /></div>
                </th>
                <th className="users-th text-right" style={{ width: '10%' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="users-td text-center text-zinc-500 py-8">No users found.</td>
                </tr>
              ) : (
                paginatedUsers.map(u => (
                  <tr key={u.id} className="users-tr">
                    <td className="users-td users-td-checkbox">
                      <input 
                        type="checkbox" 
                        className="users-checkbox" 
                        checked={selectedIds.has(u.id)}
                        onChange={() => handleSelectRow(u.id)}
                      />
                    </td>
                    <td className="users-td users-td-name" title={u.name}>{u.name}</td>
                    <td className="users-td users-td-email" title={u.email}>{u.email}</td>
                    <td className="users-td" title={u.slug}>{u.slug}</td>
                    <td className="users-td text-zinc-500" title={u.bio || '-'}>{u.bio || '-'}</td>
                    <td className="users-td" style={{ textOverflow: 'clip' }}>
                      <span className="users-td-role">{u.role.toLowerCase()}</span>
                    </td>
                    <td className="users-td" style={{ textOverflow: 'clip' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="users-td text-right">
                      <button className="users-table-action-btn">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="users-table-footer">
          <span>Showing {totalRecords === 0 ? 0 : (currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, totalRecords)} of {totalRecords}</span>
          <div className="users-pagination-controls">
            <button 
              className="users-page-btn" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="users-page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setIsModalOpen(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add User Record</h2>
              <button className="modal-close-btn" onClick={() => !isSubmitting && setIsModalOpen(false)} disabled={isSubmitting}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="modal-body">
                {modalError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                    {modalError}
                  </div>
                )}
                
                <div className="modal-form-group">
                  <label className="modal-label">Name</label>
                  <input required type="text" name="name" className="modal-input" placeholder="e.g. John Doe" disabled={isSubmitting} />
                </div>
                
                <div className="modal-form-group">
                  <label className="modal-label">Email Address</label>
                  <input required type="email" name="email" className="modal-input" placeholder="e.g. john@example.com" disabled={isSubmitting} />
                </div>
                
                <div className="modal-form-group">
                  <label className="modal-label">Password</label>
                  <input required type="password" name="password" className="modal-input" placeholder="Minimum 6 characters" minLength={6} disabled={isSubmitting} />
                </div>
                
                <div className="modal-form-group mb-0">
                  <label className="modal-label">Role</label>
                  <select name="role" className="modal-select" required disabled={isSubmitting}>
                    <option value="AUTHOR">Author</option>
                    <option value="REVIEWER">Reviewer</option>
                    <option value="SUPERADMIN">Superadmin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="users-btn users-btn-outline" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="users-btn users-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
