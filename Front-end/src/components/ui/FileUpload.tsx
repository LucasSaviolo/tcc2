import React, { useRef, useState } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  label: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // em MB
  maxFiles?: number;
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
  required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  description,
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  multiple = false,
  maxSize = 5, // 5MB padrão
  maxFiles = 1,
  files,
  onChange,
  error,
  required = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles);
    const validFiles: File[] = [];
    const errors: string[] = [];

    newFiles.forEach(file => {
      // Verificar tamanho
      if (file.size > maxSize * 1024 * 1024) {
        errors.push(`${file.name}: Arquivo muito grande (máximo ${maxSize}MB)`);
        return;
      }

      // Verificar tipo
      if (accept && accept !== "*") {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!acceptedTypes.includes(fileExtension)) {
          errors.push(`${file.name}: Tipo de arquivo não aceito`);
          return;
        }
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    if (multiple) {
      const totalFiles = files.length + validFiles.length;
      if (totalFiles > maxFiles) {
        alert(`Máximo de ${maxFiles} arquivos permitidos`);
        return;
      }
      onChange([...files, ...validFiles]);
    } else {
      onChange(validFiles.slice(0, 1));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Clique para selecionar ou arraste arquivos aqui
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {accept === "*" ? "Todos os tipos" : accept.replace(/\./g, '').toUpperCase()} 
          - Máximo {maxSize}MB por arquivo
          {multiple && ` - Até ${maxFiles} arquivos`}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Lista de arquivos selecionados */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Arquivos selecionados ({files.length}/{multiple ? maxFiles : 1}):
          </p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="p-1 text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

