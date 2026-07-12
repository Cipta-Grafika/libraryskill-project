"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, Download, Upload, Plus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { createUser, updateUser, deleteUser } from "./actions";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  slug: string;
  bio: string | null;
  moderator: boolean | null;
  createdAt: Date;
  updatedAt: Date;
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUsers(initialUsers);
  }, [initialUsers]);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const openAddModal = () => {
    setEditingUser(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsModalOpen(true);
  };

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let aVal: any = a[sortConfig.key];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const renderSortIcon = (columnKey: keyof User) => {
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

  const handleSubmitUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    let result;
    if (editingUser) {
      result = await updateUser(editingUser.id, formData);
    } else {
      result = await createUser(formData);
    }
    
    setIsModalOpen(false);
    setIsSubmitting(false);

    if (result?.error) {
      setAlertConfig({ type: 'error', title: 'Action Failed', message: result.error });
    } else {
      setEditingUser(null);
      setAlertConfig({ type: 'success', title: 'Success', message: 'User record has been successfully saved.' });
      // Data will refresh via revalidatePath
    }
  };

  const handleDeleteUser = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirmId) return;
    setIsSubmitting(true);
    const result = await deleteUser(deleteConfirmId);
    setDeleteConfirmId(null);
    setIsSubmitting(false);
    
    if (result?.error) {
      setAlertConfig({ type: 'error', title: 'Action Failed', message: result.error });
    } else {
      setAlertConfig({ type: 'success', title: 'Success', message: 'User record has been successfully deleted.' });
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
          <button className="users-btn users-btn-primary" onClick={openAddModal}>
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
                  <div className="users-th-inner">Name {renderSortIcon("name")}</div>
                </th>
                <th className="users-th sortable" style={{ width: '20%' }} onClick={() => handleSort('email')}>
                  <div className="users-th-inner">Email {renderSortIcon("email")}</div>
                </th>
                <th className="users-th sortable" style={{ width: '15%' }} onClick={() => handleSort('slug')}>
                  <div className="users-th-inner">Slug {renderSortIcon("slug")}</div>
                </th>
                <th className="users-th sortable" style={{ width: '20%' }} onClick={() => handleSort('bio')}>
                  <div className="users-th-inner">Bio {renderSortIcon("bio")}</div>
                </th>
                <th className="users-th sortable" style={{ width: '10%', textOverflow: 'clip' }} onClick={() => handleSort('role')}>
                  <div className="users-th-inner">Role {renderSortIcon("role")}</div>
                </th>
                <th className="users-th sortable" style={{ width: '10%', textOverflow: 'clip' }} onClick={() => handleSort('createdAt')}>
                  <div className="users-th-inner">Created {renderSortIcon("createdAt")}</div>
                </th>
                <th className="users-th sortable" style={{ width: '10%', textOverflow: 'clip' }} onClick={() => handleSort('updatedAt')}>
                  <div className="users-th-inner">Updated {renderSortIcon("updatedAt")}</div>
                </th>
                <th className="users-th text-right" style={{ width: '10%' }}>#</th>
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
                      <div className="flex flex-col gap-1 items-start">
                        <span className="users-td-role">{u.role.toLowerCase()}</span>
                        {u.moderator && (
                          <span className="text-[10px] font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/50 uppercase tracking-wider">
                            Moderator
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="users-td" style={{ textOverflow: 'clip' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="users-td" style={{ textOverflow: 'clip' }}>{new Date(u.updatedAt).toLocaleDateString()}</td>
                    <td className="users-td text-right">
                      <button className="users-table-action-btn" onClick={() => openEditModal(u)}>Edit</button>
                      <button className="users-table-action-btn ml-2" style={{ color: 'var(--danger, #ef4444)' }} onClick={() => handleDeleteUser(u.id)}>Delete</button>
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
              <h2 className="modal-title">{editingUser ? "Edit User Record" : "Add User Record"}</h2>
              <button className="modal-close-btn" onClick={() => !isSubmitting && setIsModalOpen(false)} disabled={isSubmitting}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitUser}>
              <div className="modal-body">
                <div className="modal-form-group">
                  <label className="modal-label">Name</label>
                  <input required type="text" name="name" defaultValue={editingUser?.name || ""} className="modal-input" placeholder="e.g. John Doe" disabled={isSubmitting} />
                </div>
                
                <div className="modal-form-group">
                  <label className="modal-label">Email Address</label>
                  <input required type="email" name="email" defaultValue={editingUser?.email || ""} className="modal-input" placeholder="e.g. john@example.com" disabled={isSubmitting} />
                </div>
                
                <div className="modal-form-group">
                  <label className="modal-label">
                    Password {editingUser && <span className="text-xs text-zinc-500 font-normal">(Leave blank to keep unchanged)</span>}
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      className="modal-input w-full pr-10" 
                      placeholder="Minimum 6 characters" 
                      minLength={6} 
                      disabled={isSubmitting}
                      required={!editingUser}
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="modal-form-group">
                  <label className="modal-label">
                    Confirm Password {editingUser && <span className="text-xs text-zinc-500 font-normal">(Leave blank if password is unchanged)</span>}
                  </label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      name="confirmPassword" 
                      className="modal-input w-full pr-10" 
                      placeholder="Confirm your password" 
                      minLength={6} 
                      disabled={isSubmitting}
                      required={!editingUser}
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                
                <div className="modal-form-group mb-0">
                  <label className="modal-label">Role</label>
                  <select name="role" defaultValue={editingUser?.role || "AUTHOR"} className="modal-select" required disabled={isSubmitting}>
                    <option value="AUTHOR">Author</option>
                    <option value="REVIEWER">Reviewer</option>
                    <option value="SUPERADMIN">Superadmin</option>
                  </select>
                </div>

                <div className="modal-form-group mt-4 mb-0 flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="moderator"
                    name="moderator" 
                    defaultChecked={editingUser?.moderator || false}
                    disabled={isSubmitting}
                    className="w-4 h-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <label htmlFor="moderator" className="modal-label mb-0 cursor-pointer select-none">
                    Is Moderator (Hidden from public leaderboards)
                  </label>
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

      {alertConfig && (
        <div className="alert-overlay" onClick={() => setAlertConfig(null)}>
          <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
            <div className="alert-header">
              <div className="alert-title-container">
                {alertConfig.type === 'success' ? (
                  <CheckCircle2 className="alert-icon alert-icon-success" />
                ) : (
                  <AlertCircle className="alert-icon alert-icon-error" />
                )}
                <h3 className="alert-title">{alertConfig.title}</h3>
              </div>
              <button type="button" className="alert-close-btn" onClick={() => setAlertConfig(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="alert-body">
              <p className="alert-message">{alertConfig.message}</p>
            </div>
            <div className="alert-footer">
              <button type="button" className="alert-btn alert-btn-primary" onClick={() => setAlertConfig(null)}>
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="alert-overlay" onClick={() => !isSubmitting && setDeleteConfirmId(null)}>
          <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
            <div className="alert-header">
              <div className="alert-title-container">
                <AlertCircle className="alert-icon alert-icon-error" />
                <h3 className="alert-title">Confirm Deletion</h3>
              </div>
              <button type="button" className="alert-close-btn" onClick={() => !isSubmitting && setDeleteConfirmId(null)} disabled={isSubmitting}>
                <X size={16} />
              </button>
            </div>
            <div className="alert-body">
              <p className="alert-message">Are you sure you want to delete this user? This action cannot be undone.</p>
            </div>
            <div className="alert-footer flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                className="users-btn users-btn-outline" 
                onClick={() => setDeleteConfirmId(null)} 
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="users-btn" 
                style={{ backgroundColor: 'var(--danger, #ef4444)', color: 'white', border: 'none' }} 
                onClick={confirmDeleteUser} 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
