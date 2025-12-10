import React, { useState } from 'react';
import { WatermarkSettings, FONTS } from '../types';
import { Type, ImageIcon, Grid, Move, RotateCw, Sparkles, Upload } from './ui/Icons';
import { suggestWatermarkText } from '../services/geminiService';

interface ControlsProps {
  settings: WatermarkSettings;
  updateSettings: (newSettings: Partial<WatermarkSettings> | ((prev: WatermarkSettings) => WatermarkSettings)) => void;
  mainImage: File;
}

const Controls: React.FC<ControlsProps> = ({ settings, updateSettings, mainImage }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSmartSuggestion = async () => {
    setIsGenerating(true);
    try {
      const suggestion = await suggestWatermarkText(mainImage);
      updateSettings(prev => ({
        ...prev,
        text: {
          ...prev.text,
          content: suggestion
        }
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      updateSettings(prev => ({
        ...prev,
        image: {
          ...prev.image,
          file: file,
          previewUrl: url
        }
      }));
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto bg-gray-900 border-l border-gray-800 text-sm">
      
      {/* Type Selection */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Watermark Type</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => updateSettings(prev => ({ ...prev, type: 'text' }))}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
              settings.type === 'text' 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
            }`}
          >
            <Type size={18} />
            <span>Text</span>
          </button>
          <button
            onClick={() => updateSettings(prev => ({ ...prev, type: 'image' }))}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
              settings.type === 'image' 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
            }`}
          >
            <ImageIcon size={18} />
            <span>Image</span>
          </button>
        </div>
      </div>

      <div className="h-px bg-gray-800" />

      {/* Content Controls */}
      <div className="space-y-4 animate-fadeIn">
        <div className="flex justify-between items-center">
             <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Content</label>
             {settings.type === 'text' && (
               <button 
                onClick={handleSmartSuggestion}
                disabled={isGenerating}
                className="text-xs flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
               >
                 <Sparkles size={12} />
                 {isGenerating ? 'Analyzing...' : 'AI Suggest'}
               </button>
             )}
        </div>

        {settings.type === 'text' ? (
          <div className="space-y-3">
            <textarea
              value={settings.text?.content || ''}
              onChange={(e) => updateSettings(prev => ({ ...prev, text: { ...prev.text, content: e.target.value } }))}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-24"
              placeholder="Enter text..."
            />
            
            <div className="grid grid-cols-2 gap-2">
              <select
                value={settings.text?.fontFamily || 'Arial'}
                onChange={(e) => updateSettings(prev => ({ ...prev, text: { ...prev.text, fontFamily: e.target.value } }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white outline-none"
              >
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <input 
                 type="color" 
                 value={settings.text?.color || '#ffffff'}
                 onChange={(e) => updateSettings(prev => ({ ...prev, text: { ...prev.text, color: e.target.value } }))}
                 className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg cursor-pointer p-1"
              />
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => updateSettings(prev => ({...prev, text: {...prev.text, isBold: !prev.text.isBold}}))}
                    className={`flex-1 p-2 rounded border ${settings.text?.isBold ? 'bg-gray-700 border-gray-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                >
                    Bold
                </button>
                <button
                    onClick={() => updateSettings(prev => ({...prev, text: {...prev.text, isItalic: !prev.text.isItalic}}))}
                    className={`flex-1 p-2 rounded border ${settings.text?.isItalic ? 'bg-gray-700 border-gray-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400'}`}
                >
                    Italic
                </button>
            </div>
            
             <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400 text-xs">Size</span>
                <span className="text-gray-400 text-xs">{settings.text?.fontSize || 48}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                value={settings.text?.fontSize || 48}
                onChange={(e) => updateSettings(prev => ({ ...prev, text: { ...prev.text, fontSize: Number(e.target.value) } }))}
                className="w-full accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:bg-gray-800/50 transition-colors">
                <input 
                    type="file" 
                    id="watermark-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleWatermarkImageUpload}
                />
                <label htmlFor="watermark-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    {settings.image?.previewUrl ? (
                         <img src={settings.image.previewUrl} alt="Watermark" className="h-20 object-contain rounded" />
                    ) : (
                        <>
                             <Upload className="text-gray-500" />
                             <span className="text-gray-400">Upload Logo</span>
                        </>
                    )}
                </label>
             </div>
             {settings.image?.previewUrl && (
                 <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Scale</span>
                    <span className="text-gray-400 text-xs">{settings.image?.scale}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    value={settings.image?.scale || 50}
                    onChange={(e) => updateSettings(prev => ({ ...prev, image: { ...prev.image, scale: Number(e.target.value) } }))}
                    className="w-full accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
             )}
          </div>
        )}
      </div>

      <div className="h-px bg-gray-800" />

      {/* Appearance Controls */}
      <div className="space-y-4">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Appearance</label>
        
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">Opacity</span>
            <span className="text-gray-400 text-xs">
                {Math.round(((settings.type === 'text' ? settings.text?.opacity : settings.image?.opacity) || 0) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={(settings.type === 'text' ? settings.text?.opacity : settings.image?.opacity) || 1}
            onChange={(e) => {
                const val = Number(e.target.value);
                updateSettings(prev => ({ 
                    ...prev, 
                    [settings.type]: { ...prev[settings.type], opacity: val } 
                }));
            }}
            className="w-full accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400 text-xs">Rotation</span>
            <span className="text-gray-400 text-xs">
                {(settings.type === 'text' ? settings.text?.rotation : settings.image?.rotation) || 0}°
            </span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCw size={14} className="text-gray-500" />
            <input
                type="range"
                min="0"
                max="360"
                value={(settings.type === 'text' ? settings.text?.rotation : settings.image?.rotation) || 0}
                onChange={(e) => {
                    const val = Number(e.target.value);
                    updateSettings(prev => ({ 
                        ...prev, 
                        [settings.type]: { ...prev[settings.type], rotation: val } 
                    }));
                }}
                className="w-full accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

       <div className="h-px bg-gray-800" />

      {/* Position Controls */}
      <div className="space-y-4">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Position</label>
        
        <div className="grid grid-cols-3 gap-2">
            {['top-left', 'center', 'top-right', 'bottom-left', 'tile', 'bottom-right'].map((pos) => (
                <button
                    key={pos}
                    onClick={() => updateSettings(prev => ({ ...prev, position: pos as any }))}
                    className={`p-2 rounded border flex flex-col items-center justify-center gap-1 ${
                        settings.position === pos 
                        ? 'bg-blue-600 border-blue-500 text-white' 
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
                    }`}
                >
                    {pos === 'tile' ? <Grid size={14} /> : <Move size={14} />}
                    <span className="text-[10px] capitalize">{pos.replace('-', ' ')}</span>
                </button>
            ))}
        </div>

        {settings.position === 'custom' && (
            <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-4">X</span>
                    <input 
                        type="range" min="0" max="100" 
                        value={settings.x} 
                        onChange={(e) => updateSettings(prev => ({ ...prev, x: Number(e.target.value) }))}
                        className="w-full accent-blue-500 h-1 bg-gray-700" 
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-4">Y</span>
                    <input 
                        type="range" min="0" max="100" 
                        value={settings.y} 
                        onChange={(e) => updateSettings(prev => ({ ...prev, y: Number(e.target.value) }))}
                        className="w-full accent-blue-500 h-1 bg-gray-700" 
                    />
                </div>
            </div>
        )}
        
        {settings.position === 'tile' && (
            <div className="space-y-1">
                 <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Gap</span>
                </div>
                <input 
                    type="range" min="0" max="500" 
                    value={settings.gap} 
                    onChange={(e) => updateSettings(prev => ({ ...prev, gap: Number(e.target.value) }))}
                    className="w-full accent-blue-500 h-1 bg-gray-700" 
                />
            </div>
        )}
      </div>

    </div>
  );
};

export default Controls;