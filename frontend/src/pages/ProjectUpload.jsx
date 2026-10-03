import { useState, useRef } from 'react';
import { FaCloudUploadAlt, FaFileArchive, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';

export default function ProjectUpload() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile.name.endsWith('.zip')) {
      toast.error('Only .zip files are supported');
      return;
    }
    
    // Optional: add file size limit validation here
    // if (selectedFile.size > 50 * 1024 * 1024) { ... }
    
    setFile(selectedFile);
    setResult(null); // Clear previous results
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    
    try {
      // We can't use our standard apiCall because it sets Content-Type to application/json
      // Need to use native fetch for multipart/form-data
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8080/api/v1/projects/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setResult(data);
      toast.success('Project analyzed successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze project. The archive might be too large or invalid.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <FaCloudUploadAlt /> Upload Project for Review
      </h1>

      {!result ? (
        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold mb-2">Architectural Code Review</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Upload a .zip file of your project. We'll automatically extract the code, ignore dependencies, and analyze the entire architecture.
            </p>
          </div>

          <div 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
              isDragging 
                ? 'border-primary-500 bg-primary-500/10 scale-[1.02]' 
                : file 
                  ? 'border-green-500 bg-green-500/5' 
                  : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".zip" 
              className="hidden" 
            />
            
            {file ? (
              <div className="flex flex-col items-center">
                <FaFileArchive className="text-6xl text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-green-400 mb-1">{file.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                <div className="flex gap-4 w-full max-w-sm">
                  <button 
                    onClick={(e) => { e.stopPropagation(); resetForm(); }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors font-medium cursor-pointer"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                    disabled={uploading}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-all flex justify-center items-center gap-2 shadow-md shadow-primary-500/20 active:scale-[0.98] cursor-pointer"
                  >
                    {uploading ? <><FaSpinner className="animate-spin" /> Analyzing...</> : 'Analyze Now'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="cursor-pointer">
                <FaCloudUploadAlt className="text-6xl text-slate-600 dark:text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">Drag & Drop your .zip file here</h3>
                <p className="text-slate-500 mb-4">or click to browse from your computer</p>
                <span className="inline-block px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-semibold transition-all shadow-md shadow-primary-500/20">
                  Browse Files
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-8 bg-amber-900/20 border border-amber-900/50 rounded-lg p-4 flex gap-3 text-amber-200 text-sm">
            <FaExclamationTriangle className="text-lg shrink-0 mt-0.5" />
            <p>For best results, exclude <code className="bg-amber-900/40 px-1 py-0.5 rounded">node_modules</code>, <code className="bg-amber-900/40 px-1 py-0.5 rounded">.git</code>, and build folders from your zip archive before uploading. Large projects may take up to a minute to analyze.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-6 rounded-xl border border-slate-700">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <FaCheckCircle className="text-green-500" /> Analysis Complete
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Project: <span className="text-slate-900 dark:text-white font-medium">{result.title}</span></p>
            </div>
            <button 
              onClick={resetForm}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-semibold transition-all shadow-md shadow-primary-500/20 active:scale-[0.98] cursor-pointer"
            >
              Upload Another
            </button>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-8 border-slate-300 dark:border-slate-700 shadow-xl prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
            <ReactMarkdown>{result.aiSummary}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
