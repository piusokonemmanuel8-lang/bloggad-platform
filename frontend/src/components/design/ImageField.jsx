import { Image as ImageIcon, Upload } from 'lucide-react';

export default function ImageField({ label, value, onChange, onUpload, uploading }) {
  return (
    <label className="affiliate-design-field affiliate-design-field-full">
      <span className="affiliate-design-label">
        <ImageIcon size={16} />
        {label}
      </span>

      <div className="affiliate-design-upload-row">
        <input
          className="affiliate-design-input"
          value={value || ''}
          onChange={onChange}
          placeholder="https://... or upload below"
        />

        <label className={`affiliate-design-upload-btn ${uploading ? 'disabled' : ''}`}>
          <Upload size={16} />
          {uploading ? 'Uploading...' : 'Upload'}
          <input
            type="file"
            accept="image/*"
            onChange={onUpload}
            disabled={uploading}
            hidden
          />
        </label>
      </div>

      {value ? (
        <div className="affiliate-design-image-preview">
          <img src={value} alt={label} />
        </div>
      ) : null}
    </label>
  );
}