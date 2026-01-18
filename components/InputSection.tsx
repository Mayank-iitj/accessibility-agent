import React, { useState } from 'react';
import { Persona, AuditConfig } from '../types';
import { Scan, Upload, Github, Globe, Terminal, FileCode, PlayCircle } from 'lucide-react';

interface InputSectionProps {
  onStartAudit: (config: AuditConfig) => void;
  isLoading: boolean;
}

const DEMO_SCENARIOS = {
  basic: {
    url: "https://bad-demo.com/basic",
    html: `<!DOCTYPE html>
<html lang="en">
<body>
  <!-- Header with non-semantic navigation -->
  <div class="header">
    <div onclick="goHome()">Logo (Div button)</div> 
    <div class="nav">
       <span>Menu</span> 
       <a href="#">Click here</a> <!-- Vague link text -->
    </div>
  </div>
  
  <div class="hero">
    <img src="hero-banner.jpg"> <!-- Missing Alt Text -->
    <h1>Welcome to our site</h1>
    <h3>Latest News</h3> <!-- Skipped Heading Level (h1 -> h3) -->
  </div>

  <div class="content">
    <button></button> <!-- Empty button -->
    <p>Call us at 555-0199</p>
  </div>
</body>
</html>`
  },
  forms: {
    url: "https://bad-demo.com/forms",
    html: `<!DOCTYPE html>
<html>
<body>
  <h1>Contact Us</h1>
  <form>
    <!-- Missing Labels -->
    <div class="field">
      <input type="text" placeholder="Enter Name" /> 
    </div>
    <div class="field">
      <input type="email" placeholder="Enter Email" />
    </div>
    
    <!-- Tabindex > 0 disrupts flow -->
    <button tabindex="5">Submit</button>
    
    <!-- Div button (not accessible via keyboard) -->
    <div class="btn" onclick="cancel()" role="button">
      Cancel
    </div>
  </form>

  <!-- Keyboard trap simulation -->
  <div id="modal" aria-hidden="false">
    <input type="text" placeholder="Trap Input">
    <!-- No close button or focus management -->
  </div>
</body>
</html>`
  },
  contrast: {
    url: "https://bad-demo.com/contrast",
    html: `<!DOCTYPE html>
<html>
<body>
  <!-- Low Contrast: Light grey on white is often < 4.5:1 -->
  <div style="background-color: #ffffff; color: #cccccc; padding: 20px;">
    <h1>Low Contrast Header</h1>
    <p style="color: #e0e0e0;">This text is very hard to read against the white background.</p>
  </div>

  <div style="background-color: #ff0000; color: #000000; padding: 20px;">
    <p>Red background with black text.</p>
    <a href="#" style="color: #440000;">Dark link on red</a>
  </div>

  <!-- Information conveyed only by color -->
  <p>Required fields are marked in <span style="color: red">red</span>.</p>
  <p>Status: <span style="color: green;">●</span></p> 
</body>
</html>`
  }
};

const InputSection: React.FC<InputSectionProps> = ({ onStartAudit, isLoading }) => {
  const [url, setUrl] = useState('https://example.com');
  const [githubRepo, setGithubRepo] = useState('');
  const [selectedPersonas, setSelectedPersonas] = useState<Persona[]>([Persona.VISUAL, Persona.COLOR, Persona.MOTOR]);
  const [htmlInput, setHtmlInput] = useState('');
  const [hasScreenshot, setHasScreenshot] = useState(false);
  const [screenshotBase64, setScreenshotBase64] = useState<string>('');

  const togglePersona = (p: Persona) => {
    setSelectedPersonas(prev => 
      prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotBase64(reader.result as string);
        setHasScreenshot(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadScenario = (type: 'basic' | 'forms' | 'contrast') => {
    const data = DEMO_SCENARIOS[type];
    setUrl(data.url);
    setHtmlInput(data.html);
    setHasScreenshot(false);
    setScreenshotBase64('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartAudit({
      url,
      githubRepo,
      personas: selectedPersonas,
      rawHtml: htmlInput,
      screenshotBase64: hasScreenshot ? screenshotBase64 : undefined
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Scan className="w-6 h-6 text-brand-500" />
            New Audit
          </h2>
          <p className="text-slate-400 text-sm mt-1">Configure your accessibility agent.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-lg border border-slate-700/50">
           <span className="text-[10px] uppercase font-bold text-slate-500 px-2 tracking-wider">Test Data:</span>
           <button 
             type="button"
             onClick={() => loadScenario('basic')}
             className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-colors border border-slate-600 hover:border-slate-500"
           >
             Basic
           </button>
           <button 
             type="button"
             onClick={() => loadScenario('forms')}
             className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-colors border border-slate-600 hover:border-slate-500"
           >
             Forms
           </button>
           <button 
             type="button"
             onClick={() => loadScenario('contrast')}
             className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-colors border border-slate-600 hover:border-slate-500"
           >
             Color
           </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personas */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">Target Personas</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => togglePersona(Persona.VISUAL)}
              className={`flex items-center p-4 rounded-xl border transition-all ${selectedPersonas.includes(Persona.VISUAL) ? 'bg-brand-900/30 border-brand-500 text-brand-100' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${selectedPersonas.includes(Persona.VISUAL) ? 'bg-brand-500 text-white' : 'bg-slate-700'}`}>
                <Globe className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Screen Reader</div>
                <div className="text-xs opacity-70">Visual Impairment</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => togglePersona(Persona.COLOR)}
              className={`flex items-center p-4 rounded-xl border transition-all ${selectedPersonas.includes(Persona.COLOR) ? 'bg-brand-900/30 border-brand-500 text-brand-100' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${selectedPersonas.includes(Persona.COLOR) ? 'bg-brand-500 text-white' : 'bg-slate-700'}`}>
                <Scan className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Color Blind</div>
                <div className="text-xs opacity-70">Deuteranopia/Protanopia</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => togglePersona(Persona.MOTOR)}
              className={`flex items-center p-4 rounded-xl border transition-all ${selectedPersonas.includes(Persona.MOTOR) ? 'bg-brand-900/30 border-brand-500 text-brand-100' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${selectedPersonas.includes(Persona.MOTOR) ? 'bg-brand-500 text-white' : 'bg-slate-700'}`}>
                <Terminal className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Motor Impaired</div>
                <div className="text-xs opacity-70">Keyboard Navigation</div>
              </div>
            </button>
          </div>
        </div>

        {/* URL Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Target URL</label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="https://example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">GitHub Repository (Optional)</label>
            <div className="relative">
              <Github className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="username/repo"
              />
            </div>
          </div>
        </div>

        {/* Source Data Inputs (Simulation Bypass) */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <FileCode className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-semibold text-slate-200">Source Data (Required for Client-Side Demo)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Paste HTML Source</label>
              <textarea
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="<html>... paste source code here ...</html>"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Upload Screenshot</label>
              <div className="relative border-2 border-dashed border-slate-700 rounded-lg h-32 flex flex-col items-center justify-center hover:bg-slate-800/50 transition-colors group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {hasScreenshot ? (
                   <div className="flex flex-col items-center">
                     <span className="text-brand-400 text-sm font-medium">Screenshot Loaded</span>
                     <span className="text-xs text-slate-500 mt-1">Ready for visual analysis</span>
                   </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-6 h-6 text-slate-500 mb-2 group-hover:text-brand-400" />
                    <span className="text-xs text-slate-400">Drop image or click to upload</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || (!htmlInput && !hasScreenshot)}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] ${isLoading || (!htmlInput && !hasScreenshot) ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:from-brand-500 hover:to-brand-400'}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running Agentic Analysis...
            </>
          ) : (
            <>
              <PlayCircle className="w-5 h-5" />
              Run Accessibility Audit
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputSection;