import React, { useState } from 'react';
import './DataTable.css';
import { Search, Filter, ChevronLeft, ChevronRight, Inbox, Trash2, RotateCcw } from 'lucide-react';

const DataTable = ({
  columns,
  data = [],
  searchPlaceholder = "Search...",
  onSearch,
  filterOptions = [],
  activeFilter,
  onFilterChange,
  actions,
  pageSize = 7,
  showTrashToggle = false,
  isTrashView = false,
  onToggleTrash
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Search logic
  const filteredData = data.filter(row => {
    // Search check
    const matchesSearch = searchTerm === '' || Object.values(row).some(val => 
      val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter check
    let matchesFilter = true;
    if (activeFilter && activeFilter !== 'All') {
      matchesFilter = Object.values(row).some(val => 
        val && val.toString().toLowerCase() === activeFilter.toLowerCase()
      );
    }

    return matchesSearch && matchesFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className="datatable-card">
      {/* Table Header Controls */}
      <div className="datatable-controls">
        <div className="search-box">
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="controls-right">
          {showTrashToggle && (
            <button 
              type="button" 
              className={`trash-toggle-btn ${isTrashView ? 'active-trash' : ''}`}
              onClick={onToggleTrash}
              title={isTrashView ? "View Active Records" : "View Soft-Deleted Trash"}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                border: isTrashView ? '1px solid #ef4444' : '1px solid #cbd5e1',
                background: isTrashView ? '#fef2f2' : '#ffffff',
                color: isTrashView ? '#dc2626' : '#475569',
                cursor: 'pointer'
              }}
            >
              {isTrashView ? <RotateCcw size={15} /> : <Trash2 size={15} />}
              {isTrashView ? "Back to Active" : "Trash / Archive"}
            </button>
          )}

          {filterOptions.length > 0 && (
            <div className="filter-dropdown">
              <Filter size={16} color="#64748b" />
              <select 
                value={activeFilter || 'All'} 
                onChange={(e) => { setCurrentPage(1); if (onFilterChange) onFilterChange(e.target.value); }}
              >
                <option value="All">All Categories / Status</option>
                {filterOptions.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}

          {actions}
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={{ width: col.width || 'auto', textAlign: col.align || 'left' }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-table-cell">
                  <div className="empty-state">
                    <Inbox size={40} color="#94a3b8" />
                    <p className="empty-title">
                      {isTrashView ? "No soft-deleted records in trash" : "No matching records found"}
                    </p>
                    <p className="empty-sub">
                      {isTrashView ? "All items are currently active" : "Try adjusting your search or filters"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIdx) => (
                <tr key={row._id || rIdx} className={row.isDeleted ? 'row-deleted' : ''}>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} style={{ textAlign: col.align || 'left' }}>
                      {col.render ? col.render(row, rIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="datatable-footer">
        <span className="pagination-info">
          Showing <b>{filteredData.length > 0 ? startIndex + 1 : 0}</b> to <b>{Math.min(startIndex + pageSize, filteredData.length)}</b> of <b>{filteredData.length}</b> entries
        </span>

        <div className="pagination-controls">
          <button 
            className="pag-btn" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            <ChevronLeft size={18} />
          </button>
          
          <span className="page-number-badge">Page {currentPage} of {totalPages}</span>

          <button 
            className="pag-btn" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
