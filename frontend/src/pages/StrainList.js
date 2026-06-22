import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { strainsAPI } from '../services/api';
import StrainDetailModal from '../components/StrainDetailModal';
import StrainFormModal from '../components/StrainFormModal';
import {
  POTENTIALS, MICROORGANISM_TYPES, BSL_LEVELS, SORT_OPTIONS, bslChipClass,
} from '../utils/strainConstants';
import { downloadCsv } from '../utils/exportCsv';

const DEFAULT_FILTERS = {
  search: '',
  microorganism_type: '',
  sample_type: '',
  biosafety: '',
  sort: 'created_at',
  order: 'DESC',
  potentials: {},
};

function buildParams(filters, page, limit) {
  const params = { page, limit, sort: filters.sort, order: filters.order };
  if (filters.microorganism_type) params.microorganism_type = filters.microorganism_type;
  if (filters.sample_type) params.sample_type = filters.sample_type;
  if (filters.biosafety) params.biosafety = filters.biosafety;
  if (filters.search) params.search = filters.search;
  POTENTIALS.forEach(([, param]) => { if (filters.potentials[param]) params[param] = 'true'; });
  return params;
}

function StrainList() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [strains, setStrains] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [view, setView] = useState('cards');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [selectedStrain, setSelectedStrain] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [strainToEdit, setStrainToEdit] = useState(null);

  const fetchStrains = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await strainsAPI.getAll(buildParams(filters, pagination.page, pagination.limit));
      setStrains(res.strains);
      setPagination((p) => ({ ...p, total: res.pagination.total, pages: res.pagination.pages }));
    } catch (err) {
      setError(t('list.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, t]);

  const loadStats = useCallback(async () => {
    try { setStats(await strainsAPI.getStats()); } catch { /* non-fatal */ }
  }, []);

  useEffect(() => { fetchStrains(); }, [fetchStrains]);
  useEffect(() => { loadStats(); }, [loadStats]);

  // --- filter helpers ---
  const updateFilter = (patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  const togglePotential = (param) => {
    setFilters((prev) => ({
      ...prev,
      potentials: { ...prev.potentials, [param]: !prev.potentials[param] },
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  const handleSort = (col) => {
    updateFilter(
      filters.sort === col
        ? { order: filters.order === 'ASC' ? 'DESC' : 'ASC' }
        : { sort: col, order: 'ASC' },
    );
  };
  const activeFilterCount =
    (filters.microorganism_type ? 1 : 0) +
    (filters.sample_type ? 1 : 0) +
    (filters.biosafety ? 1 : 0) +
    (filters.search ? 1 : 0) +
    Object.values(filters.potentials).filter(Boolean).length;

  const handleSearch = (e) => { e.preventDefault(); fetchStrains(); };
  const handlePageChange = (newPage) => setPagination((prev) => ({ ...prev, page: newPage }));

  const handleViewDetails = (strain) => { setSelectedStrain(strain); setShowDetailModal(true); };
  const handleAddNew = () => { setStrainToEdit(null); setShowFormModal(true); };
  const handleEdit = (strain) => { setStrainToEdit(strain); setShowFormModal(true); };

  const handleSave = async (formData) => {
    if (strainToEdit) {
      const { id, ...payload } = formData;
      await strainsAPI.update(strainToEdit.id, payload);
    } else {
      await strainsAPI.create(formData);
    }
    fetchStrains();
    loadStats();
  };

  const handleDelete = async (strain) => {
    if (window.confirm(t('confirm.delete', { code: strain.strain_code }))) {
      try {
        await strainsAPI.delete(strain.id);
        fetchStrains();
        loadStats();
      } catch {
        alert(t('confirm.deleteFailed'));
      }
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await strainsAPI.getAll(buildParams(filters, 1, 10000));
      downloadCsv(res.strains, 'culture-collection.csv');
    } catch {
      setError(t('list.exportError'));
    } finally {
      setExporting(false);
    }
  };

  const typeLabel = (tp) => t(`types.${tp}`);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap gap-4 justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-ink tracking-tighter">{t('list.title')}</h1>
          <p className="text-sm text-ink-secondary mt-1">
            {t('list.clearance')} {user?.biosafety_clearance}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} disabled={exporting} className="mv-btn-secondary mv-btn-md">
            {exporting ? t('common.saving') : t('list.export')}
          </button>
          <button onClick={handleAddNew} className="mv-btn-primary mv-btn-md">
            + {t('list.addNew')}
          </button>
        </div>
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="mv-panel p-4">
            <p className="text-2xl font-bold text-ink">{stats.total}</p>
            <p className="text-[11px] uppercase tracking-wide text-neutral mt-0.5">{t('stats.total')}</p>
          </div>
          {MICROORGANISM_TYPES.map((tp) => (
            <div key={tp} className="mv-panel p-4">
              <p className="text-2xl font-bold text-primary">{stats.byType?.[tp] || 0}</p>
              <p className="text-[11px] uppercase tracking-wide text-neutral mt-0.5 truncate">{typeLabel(tp)}</p>
            </div>
          ))}
          <div className="mv-panel p-4">
            <p className="text-2xl font-bold text-secondary">{stats.byPotential?.sequenced || 0}</p>
            <p className="text-[11px] uppercase tracking-wide text-neutral mt-0.5">{t('stats.sequenced')}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mv-panel p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-medium text-ink-secondary uppercase tracking-wide">
            {t('list.filters')}
            {activeFilterCount > 0 && (
              <span className="ml-2 mv-chip mv-chip-active">{activeFilterCount} {t('list.activeFilters')}</span>
            )}
          </h3>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-primary hover:text-primary-hover font-medium">
                {t('list.clearFilters')}
              </button>
            )}
            <button onClick={() => setShowAdvanced((s) => !s)} className="text-xs text-ink-secondary hover:text-ink font-medium">
              {showAdvanced ? t('list.lessFilters') : t('list.moreFilters')}
            </button>
          </div>
        </div>

        {/* Primary row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="mv-label">{t('fields.type')}</label>
            <select className="mv-input" value={filters.microorganism_type}
              onChange={(e) => updateFilter({ microorganism_type: e.target.value })}>
              <option value="">{t('types.all')}</option>
              {MICROORGANISM_TYPES.map((tp) => <option key={tp} value={tp}>{typeLabel(tp)}</option>)}
            </select>
          </div>
          <div>
            <label className="mv-label">{t('fields.sampleType')}</label>
            <select className="mv-input" value={filters.sample_type}
              onChange={(e) => updateFilter({ sample_type: e.target.value })}>
              <option value="">{t('samples.all')}</option>
              {(stats?.sampleTypes || []).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mv-label">{t('list.search')}</label>
            <form onSubmit={handleSearch}>
              <input type="text" className="mv-input" value={filters.search}
                onChange={(e) => updateFilter({ search: e.target.value })}
                placeholder={t('list.searchPlaceholder')} />
            </form>
          </div>
        </div>

        {/* Advanced */}
        {showAdvanced && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mv-label">{t('fields.biosafety')}</label>
              <select className="mv-input" value={filters.biosafety}
                onChange={(e) => updateFilter({ biosafety: e.target.value })}>
                <option value="">{t('bsl.all')}</option>
                {BSL_LEVELS.map((b) => <option key={b} value={b}>BSL-{b}</option>)}
              </select>
            </div>
            <div>
              <label className="mv-label">{t('list.sortBy')}</label>
              <select className="mv-input"
                value={SORT_OPTIONS.findIndex(([c, o]) => c === filters.sort && o === filters.order)}
                onChange={(e) => {
                  const [c, o] = SORT_OPTIONS[parseInt(e.target.value)];
                  updateFilter({ sort: c, order: o });
                }}>
                <option value={-1} disabled>—</option>
                {SORT_OPTIONS.map(([, , key], i) => <option key={key} value={i}>{t(`sort.${key}`)}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Potentials toggle chips */}
        <div className="mt-5">
          <label className="mv-label">{t('list.potentials')}</label>
          <div className="flex flex-wrap gap-2">
            {POTENTIALS.map(([, param, key]) => (
              <button key={param} type="button" onClick={() => togglePotential(param)}
                className={filters.potentials[param] ? 'mv-chip mv-chip-active' : 'mv-chip hover:bg-gray-200'}>
                {t(`potentials.${key}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar: result count + view toggle */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-ink-secondary">
          {activeFilterCount > 0 ? t('stats.shown') : t('list.allMatching')}:{' '}
          <span className="font-medium text-ink">{pagination.total}</span>
        </p>
        <div className="inline-flex items-center rounded-md border border-edge bg-surface p-0.5">
          {[['cards', t('list.viewCards')], ['table', t('list.viewTable')]].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} aria-pressed={view === v}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                view === v ? 'bg-primary text-white' : 'text-ink-secondary hover:text-ink'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-md mb-4 text-sm">{error}</div>
      )}

      {loading && <div className="text-center py-12 text-ink-secondary">{t('common.loading')}</div>}

      {!loading && strains.length > 0 && view === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {strains.map((strain) => (
            <StrainCard key={strain.id} strain={strain} t={t} typeLabel={typeLabel}
              user={user} onView={handleViewDetails} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {!loading && strains.length > 0 && view === 'table' && (
        <StrainTable strains={strains} t={t} typeLabel={typeLabel} user={user}
          sort={filters.sort} order={filters.order} onSort={handleSort}
          onView={handleViewDetails} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {/* Pagination */}
      {!loading && strains.length > 0 && (
        <div className="mv-panel px-4 py-3 flex items-center justify-between mt-6">
          <p className="text-sm text-ink-secondary hidden sm:block">
            {t('pagination.showing')}{' '}
            <span className="font-medium text-ink">{(pagination.page - 1) * pagination.limit + 1}</span>{' '}
            {t('pagination.to')}{' '}
            <span className="font-medium text-ink">{Math.min(pagination.page * pagination.limit, pagination.total)}</span>{' '}
            {t('pagination.of')} <span className="font-medium text-ink">{pagination.total}</span> {t('pagination.results')}
          </p>
          <div className="flex items-center gap-3">
            <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1}
              className="mv-btn-secondary mv-btn-sm">{t('pagination.previous')}</button>
            <span className="text-sm text-ink-secondary">{t('pagination.pageOf', { a: pagination.page, b: pagination.pages })}</span>
            <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages}
              className="mv-btn-secondary mv-btn-sm">{t('pagination.next')}</button>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && strains.length === 0 && (
        <div className="text-center py-16 mv-panel">
          <svg className="mx-auto h-12 w-12 text-neutral" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-3 text-sm font-medium text-ink">{t('empty.title')}</h3>
          <p className="mt-1 text-sm text-ink-secondary">{t('empty.subtitle')}</p>
        </div>
      )}

      {showDetailModal && (
        <StrainDetailModal strain={selectedStrain} onClose={() => setShowDetailModal(false)} />
      )}
      {showFormModal && (
        <StrainFormModal strain={strainToEdit} onClose={() => setShowFormModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}

// --- Card ---
function StrainCard({ strain, t, typeLabel, user, onView, onEdit, onDelete }) {
  const active = POTENTIALS.filter(([key]) => strain[key]);
  return (
    <div className="mv-card mv-card-hover flex flex-col">
      <div className="px-5 pt-5 pb-4 border-b border-edge">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-ink tracking-tight">{strain.strain_code}</h3>
          <span className={bslChipClass(strain.biosafety_level)}>BSL-{strain.biosafety_level}</span>
        </div>
        <p className="text-sm text-ink-secondary mt-1 italic">{strain.genus_species || t('fields.unidentified')}</p>
      </div>
      <div className="p-5 space-y-4 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="mv-chip mv-chip-info">{typeLabel(strain.microorganism_type)}</span>
          {strain.sample_type && <span className="mv-chip">{strain.sample_type}</span>}
        </div>
        {strain.origin_location && (
          <div>
            <p className="text-[11px] font-medium text-neutral uppercase tracking-wide">{t('fields.origin')}</p>
            <p className="text-sm text-ink">{strain.origin_location}</p>
          </div>
        )}
        <div>
          <p className="text-[11px] font-medium text-neutral uppercase tracking-wide mb-1.5">{t('fields.potentials')}</p>
          <div className="flex flex-wrap gap-1.5">
            {active.length > 0
              ? active.map(([key, , tkey]) => <span key={key} className="mv-chip">{t(`potentials.${tkey}`)}</span>)
              : <span className="text-xs text-neutral">{t('fields.noPotentials')}</span>}
          </div>
        </div>
        {(strain.storage_technique || strain.storage_location) && (
          <div>
            <p className="text-[11px] font-medium text-neutral uppercase tracking-wide mb-1">{t('fields.storage')}</p>
            {strain.storage_technique && (
              <p className="text-xs text-ink-secondary"><span className="font-medium text-ink">{t('fields.technique')}:</span> {strain.storage_technique}</p>
            )}
            {strain.storage_location && (
              <p className="text-xs text-ink-secondary"><span className="font-medium text-ink">{t('fields.location')}:</span> {strain.storage_location}</p>
            )}
          </div>
        )}
      </div>
      <div className="px-5 py-3 flex justify-between items-center border-t border-edge bg-background">
        <button onClick={() => onView(strain)} className="text-sm font-medium text-primary hover:text-primary-hover">
          {t('list.viewDetails')}
        </button>
        <div className="flex items-center gap-3">
          {user?.role !== 'technician' && (
            <button onClick={() => onEdit(strain)} className="text-sm text-ink-secondary hover:text-ink">{t('common.edit')}</button>
          )}
          {user?.role === 'admin' && (
            <button onClick={() => onDelete(strain)} className="text-sm text-error hover:opacity-80">{t('common.delete')}</button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Table ---
function SortableTh({ label, col, sort, order, onSort }) {
  const active = sort === col;
  return (
    <th className="px-4 py-3 font-medium">
      <button type="button" onClick={() => onSort(col)}
        className={`inline-flex items-center gap-1 uppercase tracking-wide hover:text-ink ${active ? 'text-primary' : ''}`}>
        {label}
        <span className="text-[10px]">{active ? (order === 'ASC' ? '▲' : '▼') : '↕'}</span>
      </button>
    </th>
  );
}

function StrainTable({ strains, t, typeLabel, user, sort, order, onSort, onView, onEdit, onDelete }) {
  const thProps = { sort, order, onSort };
  return (
    <div className="mv-panel overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-edge text-left text-[11px] uppercase tracking-wide text-neutral">
            <SortableTh label={t('fields.strainCode')} col="strain_code" {...thProps} />
            <SortableTh label={t('fields.type')} col="microorganism_type" {...thProps} />
            <SortableTh label={t('fields.genusSpecies')} col="genus_species" {...thProps} />
            <SortableTh label={t('fields.sampleType')} col="sample_type" {...thProps} />
            <SortableTh label="BSL" col="biosafety_level" {...thProps} />
            <th className="px-4 py-3 font-medium">{t('fields.potentials')}</th>
            <th className="px-4 py-3 font-medium text-right"></th>
          </tr>
        </thead>
        <tbody>
          {strains.map((strain) => {
            const active = POTENTIALS.filter(([key]) => strain[key]);
            return (
              <tr key={strain.id} className="border-b border-edge last:border-0 hover:bg-background">
                <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{strain.strain_code}</td>
                <td className="px-4 py-3"><span className="mv-chip mv-chip-info">{typeLabel(strain.microorganism_type)}</span></td>
                <td className="px-4 py-3 text-ink-secondary italic">{strain.genus_species || t('fields.unidentified')}</td>
                <td className="px-4 py-3 text-ink-secondary">{strain.sample_type || '-'}</td>
                <td className="px-4 py-3"><span className={bslChipClass(strain.biosafety_level)}>BSL-{strain.biosafety_level}</span></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {active.length > 0
                      ? active.slice(0, 3).map(([key, , tkey]) => <span key={key} className="mv-chip">{t(`potentials.${tkey}`)}</span>)
                      : <span className="text-xs text-neutral">-</span>}
                    {active.length > 3 && <span className="mv-chip">+{active.length - 3}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => onView(strain)} className="text-primary hover:text-primary-hover font-medium mr-3">
                    {t('list.view')}
                  </button>
                  {user?.role !== 'technician' && (
                    <button onClick={() => onEdit(strain)} className="text-ink-secondary hover:text-ink mr-3">{t('common.edit')}</button>
                  )}
                  {user?.role === 'admin' && (
                    <button onClick={() => onDelete(strain)} className="text-error hover:opacity-80">{t('common.delete')}</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default StrainList;
