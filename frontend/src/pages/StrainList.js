import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../utils/AuthContext';
import { strainsAPI } from '../services/api';
import StrainDetailModal from '../components/StrainDetailModal';
import StrainFormModal from '../components/StrainFormModal';

// BSL → semantic status chip
const bslChipClass = (level) =>
  level === 1 ? 'mv-chip mv-chip-success' :
  level === 2 ? 'mv-chip mv-chip-warning' :
  level === 3 ? 'mv-chip mv-chip-error' :
  'mv-chip bg-[#C0392B]/10 text-[#C0392B]';

// Potential flag → human label (rendered as neutral chips)
const POTENTIALS = [
  ['potential_nitrogen_fixer', 'N-Fixer'],
  ['potential_phosphate_solubilizer', 'P-Solubilizer'],
  ['potential_proteolytic', 'Proteolytic'],
  ['potential_lipolytic', 'Lipolytic'],
  ['potential_amylolytic', 'Amylolytic'],
  ['potential_cellulolytic', 'Cellulolytic'],
  ['potential_antimicrobial', 'Antimicrobial'],
  ['potential_iaa_hormone', 'IAA Hormone'],
];

function StrainList() {
  const { user } = useAuth();
  const [strains, setStrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    microorganism_type: '',
    sample_type: '',
    search: '',
    cellulolytic: false,
    antimicrobial: false,
    nitrogen_fixer: false,
  });

  // Modals
  const [selectedStrain, setSelectedStrain] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [strainToEdit, setStrainToEdit] = useState(null);

  // Fetch strains
  const buildPotentialParams = (f) => ({
    nitrogen_fixer: f.nitrogen_fixer ? 'true' : undefined,
    phosphate_solubilizer: f.phosphate_solubilizer ? 'true' : undefined,
    proteolytic: f.proteolytic ? 'true' : undefined,
    lipolytic: f.lipolytic ? 'true' : undefined,
    amylolytic: f.amylolytic ? 'true' : undefined,
    cellulolytic: f.cellulolytic ? 'true' : undefined,
    antimicrobial: f.antimicrobial ? 'true' : undefined,
    iaa_hormone: f.iaa_hormone ? 'true' : undefined
  });
  const fetchStrains = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,

        microorganism_type: filters.microorganism_type || undefined,
        sample_type: filters.sample_type || undefined,
        search: filters.search || undefined,

        ...buildPotentialParams(filters)
      };

      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === undefined) {
          delete params[key];
        }
      });

      const res = await strainsAPI.getAll(params);

      setStrains(res.strains);
      setPagination(res.pagination);

    } catch (err) {
      setError('Failed to fetch strains');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Initial load
  useEffect(() => {
    fetchStrains();
  }, [fetchStrains]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchStrains();
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle view details
  const handleViewDetails = (strain) => {
    setSelectedStrain(strain);
    setShowDetailModal(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setStrainToEdit(null);
    setShowFormModal(true);
  };

  // Handle edit
  const handleEdit = (strain) => {
    setStrainToEdit(strain);
    setShowFormModal(true);
  };

  // Handle save (create or update)
  const handleSave = async (formData) => {
    try {
      if (strainToEdit) {
        const cleanId = strainToEdit.id;
        // Drop `id` from the body before sending
        const { id, ...payloadWithoutId } = formData;
        await strainsAPI.update(cleanId, payloadWithoutId);
      } else {
        await strainsAPI.create(formData);
      }

      fetchStrains();
    } catch (err) {
      console.error('Save error:', err);
      throw err;
    }
  };

  // Handle delete
  const handleDelete = async (strain) => {
    if (window.confirm(`Are you sure you want to delete strain ${strain.strain_code}?`)) {
      try {
        await strainsAPI.delete(strain.id);
        fetchStrains(); // Refresh list
      } catch (err) {
        alert('Failed to delete strain');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink tracking-tighter">Culture Collection</h1>
          <p className="text-sm text-ink-secondary mt-1">
            Biosafety Clearance: Level {user?.biosafety_clearance}
          </p>
        </div>
        <button onClick={handleAddNew} className="mv-btn-primary mv-btn-md">
          + Add New Strain
        </button>
      </div>

      {/* Filters */}
      <div className="mv-panel p-5 mb-8">
        <h3 className="text-xs font-medium text-ink-secondary uppercase tracking-wide mb-4">Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Microorganism Type */}
          <div>
            <label className="mv-label">Microorganism Type</label>
            <select
              name="microorganism_type"
              value={filters.microorganism_type}
              onChange={handleFilterChange}
              className="mv-input"
            >
              <option value="">All Types</option>
              <option value="BAKTERI">Bakteri</option>
              <option value="YEAST">Yeast</option>
              <option value="KAPANG">Kapang</option>
              <option value="ACTINOMYCETES">Actinomycetes</option>
            </select>
          </div>

          {/* Sample Type */}
          <div>
            <label className="mv-label">Sample Type</label>
            <select
              name="sample_type"
              value={filters.sample_type}
              onChange={handleFilterChange}
              className="mv-input"
            >
              <option value="">All Samples</option>
              <option value="Tanah">Tanah</option>
              <option value="Air">Air</option>
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label className="mv-label">Search</label>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search strain code, genus, or location…"
                className="mv-input"
              />
            </form>
          </div>
        </div>

        {/* Potential Filters */}
        <div className="mt-5">
          <label className="mv-label">Potentials</label>
          <div className="flex flex-wrap gap-5">
            {[
              ['cellulolytic', 'Cellulolytic'],
              ['antimicrobial', 'Antimicrobial'],
              ['nitrogen_fixer', 'Nitrogen Fixer'],
            ].map(([name, label]) => (
              <label key={name} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name={name}
                  checked={filters[name]}
                  onChange={handleFilterChange}
                  className="h-4 w-4 rounded border-edge accent-primary"
                />
                <span className="ml-2 text-sm text-ink-secondary">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-ink-secondary">Loading strains…</div>
      )}

      {/* Strains Grid (Card View) */}
      {!loading && strains.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {strains.map((strain) => {
              const activePotentials = POTENTIALS.filter(([key]) => strain[key]);
              return (
                <div key={strain.id} className="mv-card mv-card-hover flex flex-col">
                  {/* Card Header */}
                  <div className="px-5 pt-5 pb-4 border-b border-edge">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-ink tracking-tight">
                        {strain.strain_code}
                      </h3>
                      <span className={bslChipClass(strain.biosafety_level)}>
                        BSL-{strain.biosafety_level}
                      </span>
                    </div>
                    <p className="text-sm text-ink-secondary mt-1 italic">
                      {strain.genus_species || 'Unidentified'}
                    </p>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4 flex-1">
                    {/* Type & Sample */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="mv-chip mv-chip-info">{strain.microorganism_type}</span>
                      {strain.sample_type && (
                        <span className="mv-chip">{strain.sample_type}</span>
                      )}
                    </div>

                    {/* Origin Location */}
                    {strain.origin_location && (
                      <div>
                        <p className="text-[11px] font-medium text-neutral uppercase tracking-wide">Origin</p>
                        <p className="text-sm text-ink">{strain.origin_location}</p>
                      </div>
                    )}

                    {/* Characteristics */}
                    {(strain.characteristics_macroscopic || strain.characteristics_microscopic) && (
                      <div>
                        <p className="text-[11px] font-medium text-neutral uppercase tracking-wide mb-1">Characteristics</p>

                        {strain.characteristics_macroscopic && (
                          <div className="mb-2">
                            <p className="text-xs font-medium text-ink-secondary">Macroscopic</p>
                            <p className="text-xs text-ink-secondary line-clamp-2">
                              {strain.characteristics_macroscopic}
                            </p>
                          </div>
                        )}

                        {strain.characteristics_microscopic && (
                          <div>
                            <p className="text-xs font-medium text-ink-secondary">Microscopic</p>
                            <p className="text-xs text-ink-secondary line-clamp-2">
                              {strain.characteristics_microscopic}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Potentials */}
                    <div>
                      <p className="text-[11px] font-medium text-neutral uppercase tracking-wide mb-1.5">Potentials</p>
                      <div className="flex flex-wrap gap-1.5">
                        {activePotentials.length > 0 ? (
                          activePotentials.map(([key, label]) => (
                            <span key={key} className="mv-chip">{label}</span>
                          ))
                        ) : (
                          <span className="text-xs text-neutral">No potentials recorded</span>
                        )}
                      </div>
                    </div>

                    {/* Storage Info */}
                    {(strain.storage_technique || strain.storage_location || strain.culture_stock) && (
                      <div>
                        <p className="text-[11px] font-medium text-neutral uppercase tracking-wide mb-1">Storage</p>
                        {strain.storage_technique && (
                          <p className="text-xs text-ink-secondary">
                            <span className="font-medium text-ink">Technique:</span> {strain.storage_technique}
                          </p>
                        )}
                        {strain.storage_location && (
                          <p className="text-xs text-ink-secondary">
                            <span className="font-medium text-ink">Location:</span> {strain.storage_location}
                          </p>
                        )}
                        {strain.culture_stock && (
                          <p className="text-xs text-ink-secondary">
                            <span className="font-medium text-ink">Stock:</span> {strain.culture_stock}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer - Actions */}
                  <div className="px-5 py-3 flex justify-between items-center border-t border-edge bg-background">
                    <button
                      onClick={() => handleViewDetails(strain)}
                      className="text-sm font-medium text-primary hover:text-primary-hover"
                    >
                      View Details
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(strain)}
                        className="text-sm text-ink-secondary hover:text-ink"
                      >
                        Edit
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(strain)}
                          className="text-sm text-error hover:opacity-80"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="mv-panel px-4 py-3 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="mv-btn-secondary mv-btn-sm"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="mv-btn-secondary mv-btn-sm ml-3"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <p className="text-sm text-ink-secondary">
                Showing <span className="font-medium text-ink">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium text-ink">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span> of{' '}
                <span className="font-medium text-ink">{pagination.total}</span> results
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="mv-btn-secondary mv-btn-sm"
                >
                  Previous
                </button>
                <span className="text-sm text-ink-secondary">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="mv-btn-secondary mv-btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && strains.length === 0 && (
        <div className="text-center py-16 mv-panel">
          <svg className="mx-auto h-12 w-12 text-neutral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-3 text-sm font-medium text-ink">No strains found</h3>
          <p className="mt-1 text-sm text-ink-secondary">Try adjusting your filters or create a new strain.</p>
        </div>
      )}

      {/* Modals */}
      {showDetailModal && (
        <StrainDetailModal
          strain={selectedStrain}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {showFormModal && (
        <StrainFormModal
          strain={strainToEdit}
          onClose={() => setShowFormModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default StrainList;
