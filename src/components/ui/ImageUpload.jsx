import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Button from './Button';

export default function ImageUpload({ 
  value, 
  onChange, 
  error,
  multiple = false,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  className = ''
}) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = async (files) => {
    setUploading(true);
    const fileArray = Array.from(files);
    
    // Validate files
    for (const file of fileArray) {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
        setUploading(false);
        return;
      }
    }

    try {
      // Simulate upload with file preview
      const uploadedFiles = await Promise.all(
        fileArray.map(async (file) => {
          // Create preview URL
          const preview = URL.createObjectURL(file);
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            url: preview, // In real app, this would be the uploaded URL
            size: file.size,
            type: file.type
          };
        })
      );

      if (multiple) {
        onChange([...(value || []), ...uploadedFiles]);
      } else {
        onChange(uploadedFiles[0]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    if (multiple) {
      const newFiles = [...value];
      newFiles.splice(index, 1);
      onChange(newFiles);
    } else {
      onChange(null);
    }
  };

  const files = multiple ? (value || []) : (value ? [value] : []);

  return (
    <div className={`space-y-4 ${className}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-primary-400 bg-primary-50' : 'border-surface-300'}
          ${error ? 'border-error-300 bg-error-50' : ''}
          hover:border-primary-400 hover:bg-primary-50
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-surface-200">
            <Upload className="w-6 h-6 text-surface-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-900">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-surface-600 mt-1">
              PNG, JPG, GIF up to {maxSize / 1024 / 1024}MB
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Uploading...' : 'Choose Files'}
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-error-600">{error}</p>
      )}

      {/* Preview uploaded files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-surface-900">Uploaded Files:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={file.id || index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-surface-200">
                  {file.url ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-surface-400" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 p-1 bg-error-500 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="mt-1 text-xs text-surface-600 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}