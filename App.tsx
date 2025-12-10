import React, { useState, useRef, useCallback } from 'react';
import WatermarkCanvas, { WatermarkCanvasHandle } from './components/WatermarkCanvas';
import Controls from './components/Controls';
import { WatermarkSettings } from './types';
import { Upload, Download, Trash2, Sparkles } from './components/ui/Icons';

const DEFAULT_SETTINGS: WatermarkSettings = {
  type: 'text',
  position: 'center',
  x: 50,
  y: 50,
  gap: 50,
  text: {
    content: 'CONFIDENTIAL',
    fontFamily: 'Arial',
    fontSize: 48,
    color: '#ffffff',
    opacity: 0.8,
    rotation: 0,
    isBold: true,
    isItalic: false,
  },
  image: {
    file: null,
    previewUrl: null,
    scale: 50,
    opacity: 0.8,
    rotation: 0,
  }
};

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<WatermarkSettings>(DEFAULT_SETTINGS);
  const [dragActive, setDragActive] = useState(false);
  const canvasRef = useRef<WatermarkCanvasHandle>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="flex h-screen w-full bg-gray-950 text-white overflow-hidden selection:bg-blue-500/30">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Header */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Sparkles size={18} className="text-white" />
                </div>
                <h1 className="font-bold text-lg tracking-tight">Watermark Pro</h1>
            </div>

            <div className="flex items-center gap-3">
                 {imageFile && (
                    <button 
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-400 transition-colors text-sm font-medium"
                    >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Reset</span>
                    </button>
                 )}
                <button 
                    onClick={() => canvasRef.current?.downloadImage()}
                    disabled={!imageFile}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                    <Download size={18} />
                    <span>Export</span>
                </button>
            </div>
        </header>

        {/* Canvas / Upload Area */}
        <main className="flex-1 overflow-hidden relative p-6 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 to-gray-950">
            {!imageFile ? (
                <div 
                    className={`w-full max-w-xl aspect-video rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 cursor-pointer relative group
                        ${dragActive ? 'border-blue-500 bg-blue-500/5' : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <div className="p-4 rounded-full bg-gray-800 group-hover:scale-110 transition-transform duration-300">
                        <Upload size={32} className="text-blue-500" />
                    </div>
                    <div className="text-center space-y-1">
                        <h3 className="text-lg font-medium text-gray-200">Upload an Image</h3>
                        <p className="text-gray-500 text-sm">Drag & drop or click to browse</p>
                    </div>
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <WatermarkCanvas 
                        ref={canvasRef}
                        imageFile={imageFile} 
                        settings={settings}
                    />
                </div>
            )}
        </main>
      </div>

      {/* Sidebar Controls */}
      <div className={`w-80 bg-gray-900 h-full border-l border-gray-800 transition-transform duration-300 transform absolute right-0 z-20 md:relative md:transform-none ${!imageFile ? 'translate-x-full md:translate-x-0 md:opacity-50 md:pointer-events-none' : 'translate-x-0'}`}>
         {imageFile ? (
             <Controls 
                settings={settings} 
                updateSettings={setSettings} 
                mainImage={imageFile}
             />
         ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm p-8 text-center">
                Upload an image to unlock controls
            </div>
         )}
      </div>

    </div>
  );
};

export default App;