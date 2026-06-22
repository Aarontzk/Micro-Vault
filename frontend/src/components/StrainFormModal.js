import React, { useState, useEffect } from 'react';

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

function StrainFormModal({ strain, onClose, onSave }) {
  const [formData, setFormData] = useState({
    strain_code: '',
    microorganism_type: 'BAKTERI',
    genus_species: '',
    genus: '',
    species: '',
    sample_type: '',
    origin_location: '',
    isolation_date: '',
    characteristics_macroscopic: '',
    characteristics_microscopic: '',
    characteristics_biochemical: '',
    potential_nitrogen_fixer: false,
    potential_phosphate_solubilizer: false,
    potential_proteolytic: false,
    potential_lipolytic: false,
    potential_amylolytic: false,
    potential_cellulolytic: false,
    potential_antimicrobial: false,
    potential_iaa_hormone: false,
    storage_technique: '',
    culture_stock: '',
    storage_location: '',
    biosafety_level: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (strain) {
      // Handle null values from database
      setFormData({
        ...strain,
        genus_species: strain.genus_species || '',
        genus: strain.genus || '',
        species: strain.species || '',
        sample_type: strain.sample_type || '',
        origin_location: strain.origin_location || '',
        isolation_date: strain.isolation_date || '',
        characteristics_macroscopic: strain.characteristics_macroscopic || '',
        characteristics_microscopic: strain.characteristics_microscopic || '',
        characteristics_biochemical: strain.characteristics_biochemical || '',
        storage_technique: strain.storage_technique || '',
        culture_stock: strain.culture_stock || '',
        storage_location: strain.storage_location || '',
      });
    }
  }, [strain]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for numeric fields
    if (name === 'biosafety_level') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.strain_code || !formData.microorganism_type) {
      setError('Strain code and microorganism type are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Clean up data
      const cleanedData = {
        ...formData,
        // Ensure biosafety_level is integer
        biosafety_level: parseInt(formData.biosafety_level),
        // Convert empty strings to null
        genus_species: formData.genus_species?.trim() || null,
        genus: formData.genus?.trim() || null,
        species: formData.species?.trim() || null,
        sample_type: formData.sample_type?.trim() || null,
        origin_location: formData.origin_location?.trim() || null,
        isolation_date: formData.isolation_date || null,
        characteristics_macroscopic: formData.characteristics_macroscopic?.trim() || null,
        characteristics_microscopic: formData.characteristics_microscopic?.trim() || null,
        characteristics_biochemical: formData.characteristics_biochemical?.trim() || null,
        storage_technique: formData.storage_technique?.trim() || null,
        culture_stock: formData.culture_stock?.trim() || null,
        storage_location: formData.storage_location?.trim() || null,
      };

      await onSave(cleanedData);
      onClose();
    } catch (err) {
      console.error('Save error:', err);

      // Better error messages
      if (err.response?.data?.errors) {
        // Express-validator errors array
        const errorMessages = err.response.data.errors
          .map(e => `${e.param}: ${e.msg}`)
          .join(', ');
        setError(errorMessages);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to save strain. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-ink/40 backdrop-blur-sm overflow-y-auto h-full w-full z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative top-6 mx-auto w-11/12 max-w-4xl bg-surface border border-edge rounded-xl shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-edge">
          <h3 className="text-2xl font-bold text-ink tracking-tighter">
            {strain ? 'Edit Strain' : 'Add New Strain'}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="text-neutral hover:text-ink text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-error/10 border border-error/30 text-error px-4 py-3 rounded-md">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="max-h-[60vh] overflow-y-auto space-y-5 pr-1">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mv-label">
                  Strain Code <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  name="strain_code"
                  value={formData.strain_code}
                  onChange={handleChange}
                  required
                  disabled={!!strain}
                  className="mv-input disabled:bg-background disabled:text-neutral"
                />
              </div>

              <div>
                <label className="mv-label">
                  Microorganism Type <span className="text-error">*</span>
                </label>
                <select
                  name="microorganism_type"
                  value={formData.microorganism_type}
                  onChange={handleChange}
                  required
                  className="mv-input"
                >
                  <option value="BAKTERI">Bakteri</option>
                  <option value="YEAST">Yeast</option>
                  <option value="KAPANG">Kapang</option>
                  <option value="ACTINOMYCETES">Actinomycetes</option>
                </select>
              </div>

              <div>
                <label className="mv-label">Genus/Species</label>
                <input
                  type="text"
                  name="genus_species"
                  value={formData.genus_species}
                  onChange={handleChange}
                  placeholder="e.g., Bacillus subtilis"
                  className="mv-input"
                />
              </div>

              <div>
                <label className="mv-label">Sample Type</label>
                <input
                  type="text"
                  name="sample_type"
                  value={formData.sample_type}
                  onChange={handleChange}
                  placeholder="e.g., Tanah, Air"
                  className="mv-input"
                />
              </div>

              <div className="col-span-2">
                <label className="mv-label">Origin Location</label>
                <input
                  type="text"
                  name="origin_location"
                  value={formData.origin_location}
                  onChange={handleChange}
                  placeholder="e.g., Mangrove Jenu Tuban"
                  className="mv-input"
                />
              </div>
            </div>

            {/* Characteristics */}
            <div>
              <label className="mv-label">Characteristics - Macroscopic</label>
              <textarea
                name="characteristics_macroscopic"
                value={formData.characteristics_macroscopic}
                onChange={handleChange}
                rows="2"
                placeholder="Warna Koloni, Bentuk, Tepian, Elevasi…"
                className="mv-input"
              />
            </div>

            <div>
              <label className="mv-label">Characteristics - Microscopic</label>
              <textarea
                name="characteristics_microscopic"
                value={formData.characteristics_microscopic}
                onChange={handleChange}
                rows="2"
                placeholder="Bentuk sel, Gram staining…"
                className="mv-input"
              />
            </div>

            <div>
              <label className="mv-label">Characteristics - Biochemical</label>
              <textarea
                name="characteristics_biochemical"
                value={formData.characteristics_biochemical}
                onChange={handleChange}
                rows="2"
                placeholder="Test results…"
                className="mv-input"
              />
            </div>

            {/* Potentials */}
            <div>
              <label className="mv-label">Potentials</label>
              <div className="grid grid-cols-2 gap-3">
                {POTENTIALS.map(([name, label]) => (
                  <label key={name} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name={name}
                      checked={formData[name]}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-edge accent-primary"
                    />
                    <span className="ml-2 text-sm text-ink-secondary">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Storage */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mv-label">Storage Technique</label>
                <input
                  type="text"
                  name="storage_technique"
                  value={formData.storage_technique}
                  onChange={handleChange}
                  placeholder="e.g., Slant Agar (NA)"
                  className="mv-input"
                />
              </div>

              <div>
                <label className="mv-label">Storage Location</label>
                <input
                  type="text"
                  name="storage_location"
                  value={formData.storage_location}
                  onChange={handleChange}
                  placeholder="e.g., Freezer-A-1-1"
                  className="mv-input"
                />
              </div>

              <div>
                <label className="mv-label">Culture Stock</label>
                <input
                  type="text"
                  name="culture_stock"
                  value={formData.culture_stock}
                  onChange={handleChange}
                  placeholder="e.g., Available"
                  className="mv-input"
                />
              </div>

              <div>
                <label className="mv-label">Biosafety Level</label>
                <select
                  name="biosafety_level"
                  value={formData.biosafety_level}
                  onChange={handleChange}
                  className="mv-input"
                >
                  <option value={1}>BSL-1</option>
                  <option value={2}>BSL-2</option>
                  <option value={3}>BSL-3</option>
                  <option value={4}>BSL-4</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer - Inside Form */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-edge">
            <button
              type="button"
              onClick={onClose}
              className="mv-btn-secondary mv-btn-md"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="mv-btn-primary mv-btn-md"
            >
              {loading ? 'Saving…' : 'Save Strain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StrainFormModal;
