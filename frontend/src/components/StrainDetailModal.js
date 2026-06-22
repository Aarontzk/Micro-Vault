import React from 'react';

const bslChipClass = (level) =>
  level === 1 ? 'mv-chip mv-chip-success' :
  level === 2 ? 'mv-chip mv-chip-warning' :
  level === 3 ? 'mv-chip mv-chip-error' :
  'mv-chip bg-[#C0392B]/10 text-[#C0392B]';

const POTENTIALS = [
  ['potential_nitrogen_fixer', 'Nitrogen Fixer'],
  ['potential_phosphate_solubilizer', 'Phosphate Solubilizer'],
  ['potential_proteolytic', 'Proteolytic'],
  ['potential_lipolytic', 'Lipolytic'],
  ['potential_amylolytic', 'Amylolytic'],
  ['potential_cellulolytic', 'Cellulolytic'],
  ['potential_antimicrobial', 'Antimicrobial'],
  ['potential_iaa_hormone', 'IAA Hormone'],
];

const Field = ({ label, children }) => (
  <div>
    <p className="text-[11px] font-medium text-neutral uppercase tracking-wide">{label}</p>
    <p className="mt-0.5 text-sm text-ink">{children}</p>
  </div>
);

function StrainDetailModal({ strain, onClose }) {
  if (!strain) return null;

  const activePotentials = POTENTIALS.filter(([key]) => strain[key]);

  return (
    <div
      className="fixed inset-0 bg-ink/40 backdrop-blur-sm overflow-y-auto h-full w-full z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative top-10 mx-auto w-11/12 max-w-4xl bg-surface border border-edge rounded-xl shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-edge">
          <h3 className="text-2xl font-bold text-ink tracking-tighter">{strain.strain_code}</h3>
          <button
            onClick={onClose}
            className="text-neutral hover:text-ink text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Microorganism Type">{strain.microorganism_type}</Field>
            <div>
              <p className="text-[11px] font-medium text-neutral uppercase tracking-wide">Biosafety Level</p>
              <p className="mt-1">
                <span className={bslChipClass(strain.biosafety_level)}>
                  BSL-{strain.biosafety_level}
                </span>
              </p>
            </div>
            <Field label="Genus/Species">{strain.genus_species || '-'}</Field>
            <Field label="Sample Type">{strain.sample_type || '-'}</Field>
          </div>

          {/* Origin */}
          {strain.origin_location && (
            <Field label="Origin Location">{strain.origin_location}</Field>
          )}

          {/* Characteristics */}
          {(strain.characteristics_macroscopic || strain.characteristics_microscopic || strain.characteristics_biochemical) && (
            <div>
              <p className="text-[11px] font-medium text-neutral uppercase tracking-wide mb-2">Characteristics</p>

              {strain.characteristics_macroscopic && (
                <div className="mb-2 p-3 bg-background border border-edge rounded-lg">
                  <p className="text-[11px] font-semibold text-ink-secondary uppercase mb-1">Macroscopic</p>
                  <p className="text-sm text-ink">{strain.characteristics_macroscopic}</p>
                </div>
              )}

              {strain.characteristics_microscopic && (
                <div className="mb-2 p-3 bg-background border border-edge rounded-lg">
                  <p className="text-[11px] font-semibold text-ink-secondary uppercase mb-1">Microscopic</p>
                  <p className="text-sm text-ink">{strain.characteristics_microscopic}</p>
                </div>
              )}

              {strain.characteristics_biochemical && (
                <div className="p-3 bg-background border border-edge rounded-lg">
                  <p className="text-[11px] font-semibold text-ink-secondary uppercase mb-1">Biochemical</p>
                  <p className="text-sm text-ink">{strain.characteristics_biochemical}</p>
                </div>
              )}
            </div>
          )}

          {/* Potentials */}
          <div>
            <p className="text-[11px] font-medium text-neutral uppercase tracking-wide mb-2">Potentials</p>
            <div className="flex flex-wrap gap-2">
              {activePotentials.length > 0 ? (
                activePotentials.map(([key, label]) => (
                  <span key={key} className="mv-chip">{label}</span>
                ))
              ) : (
                <span className="text-sm text-neutral">No potentials recorded</span>
              )}
            </div>
          </div>

          {/* Storage */}
          <div className="grid grid-cols-2 gap-4">
            {strain.storage_technique && <Field label="Storage Technique">{strain.storage_technique}</Field>}
            {strain.storage_location && <Field label="Storage Location">{strain.storage_location}</Field>}
            {strain.culture_stock && <Field label="Culture Stock">{strain.culture_stock}</Field>}
          </div>

          {/* System Info */}
          <div className="pt-4 border-t border-edge grid grid-cols-2 gap-4 text-xs text-neutral">
            <div>
              <p>Created by: {strain.created_by_name || 'Unknown'}</p>
              <p>Created at: {new Date(strain.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p>Updated at: {new Date(strain.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="mv-btn-secondary mv-btn-md">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default StrainDetailModal;
