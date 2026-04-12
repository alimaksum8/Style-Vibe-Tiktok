import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wand2, 
  RefreshCw, 
  Copy, 
  Youtube, 
  Sparkles, 
  Music, 
  Zap, 
  Check, 
  Info
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const API_KEY = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

const vibePresets = {
  "Sad Boy/Girl": { genre: ["Indie Pop", "Lo-fi"], moods: ["Sad", "Melancholic"], tempo: ["60-80 BPM"] },
  "Phonk Viral": { genre: ["Phonk", "Trap"], moods: ["Aggressive", "Dark"], tempo: ["120-140 BPM"] },
  "Gen Z Pop": { genre: ["Hyperpop", "Dance Pop"], moods: ["Energetic", "Happy"], tempo: ["140-160 BPM"] },
  "Cinematic Dream": { genre: ["Orchestral", "Ambient"], moods: ["Dreamy", "Cinematic"], tempo: ["40-60 BPM"] },
};

const options = {
  genre: ["Pop", "Indie", "Hip Hop", "Trap", "Phonk", "Hyperpop", "Lo-fi", "R&B", "Rock", "Orchestral", "Ambient", "Jazz", "Electronic", "Techno", "House"],
  intro: ["Slow piano", "Cinematic opening", "Drum fill", "Synth swell", "Vocal chop", "Ambient noise", "Guitar riff", "Bass drop", "Silence", "Fade in"],
  moods: ["Happy", "Sad", "Energetic", "Chill", "Dark", "Aggressive", "Dreamy", "Melancholic", "Romantic", "Epic", "Mysterious", "Tense", "Nostalgic", "Hopeful", "Calm"],
  ekspresi: ["Soft", "Powerful", "Emotional", "Aggressive", "Whispered", "Smooth", "Rough", "Bright", "Dark", "Expressive", "Dolce", "Espressivo", "Staccato", "Legato"],
  effects: ["Reverb", "Delay", "Distortion", "Autotune", "Chorus", "Flanger", "Phaser", "Bitcrush", "Vinyl crackle", "Telephone effect", "Underwater", "Echo"],
  vocals: ["Male", "Female", "Duo", "Group", "Choir", "Whisper", "Scream", "Rap", "Melodic", "Harmonized", "Solo", "Instrumental"],
  tempo: ["40-60 BPM", "60-80 BPM", "80-100 BPM", "100-120 BPM", "120-140 BPM", "140-160 BPM", "160-180 BPM", "180+ BPM"]
};

export default function App() {
  const [lyrics, setLyrics] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [selections, setSelections] = useState<Record<string, string[]>>({
    genre: [], intro: [], moods: [], ekspresi: [], effects: [], vocals: [], tempo: []
  });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [output, setOutput] = useState<{ style: string, lyrics: string } | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const toggleSelection = (category: string, item: string) => {
    setSelections(prev => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter(i => i !== item)
        : [...prev[category], item]
    }));
    setActivePreset(null);
  };

  const applyPreset = (name: string) => {
    const preset = vibePresets[name as keyof typeof vibePresets];
    const newSelections = {
      genre: [], intro: [], moods: [], ekspresi: [], effects: [], vocals: [], tempo: []
    };
    Object.entries(preset).forEach(([key, val]) => {
      newSelections[key as keyof typeof newSelections] = val;
    });
    setSelections(newSelections);
    setActivePreset(name);
  };

  const randomize = () => {
    const newSelections = {} as Record<string, string[]>;
    Object.entries(options).forEach(([category, items]) => {
      const count = Math.floor(Math.random() * 2) + 1;
      newSelections[category] = [...items].sort(() => 0.5 - Math.random()).slice(0, count);
    });
    setSelections(newSelections);
    setActivePreset(null);
  };

  const analyzeYouTubeLink = async () => {
    if (!youtubeLink.trim()) return;
    if (!API_KEY) {
      setAnalysisResult("⚠️ API Key tidak ditemukan. Pastikan GEMINI_API_KEY sudah diatur di Environment Variables Vercel.");
      return;
    }
    
    setAnalyzing(true);
    setAnalysisResult(null);
    
    const prompt = `Analyze this YouTube video: ${youtubeLink}. 
    Based on its vibe, recommend the best music tags from these categories: ${JSON.stringify(options)}.
    Return ONLY a JSON object with these keys: genre, intro, moods, ekspresi, effects, vocals, tempo.
    The values should be arrays of strings selected from the provided options.`;

    try {
      // Attempt 1: With Google Search Grounding (High Quota Usage)
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [{ text: prompt }] },
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const resultText = response.text || '{}';
      const cleanJson = resultText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      setSelections(parsed);
      setAnalysisResult(JSON.stringify(parsed, null, 2));
    } catch (error: any) {
      console.error("Primary analysis failed, trying fallback...", error);
      
      // Fallback: Try without Google Search Grounding (Lower Quota Usage)
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: { parts: [{ text: `(Fallback Mode) Guess the vibe for this video link: ${youtubeLink}. Options: ${JSON.stringify(options)}. Return ONLY JSON.` }] },
        });
        
        const resultText = fallbackResponse.text || '{}';
        const cleanJson = resultText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        
        setSelections(parsed);
        setAnalysisResult("(Mode Hemat Kuota Aktif)\n" + JSON.stringify(parsed, null, 2));
      } catch (fallbackError: any) {
        let friendlyMessage = "Gagal menganalisis video.";
        if (fallbackError?.message?.includes("429") || fallbackError?.message?.includes("RESOURCE_EXHAUSTED")) {
          friendlyMessage = "⚠️ Kuota API Benar-benar Habis. Google membatasi akun gratis Anda secara ketat. Mohon tunggu beberapa jam atau gunakan API Key lain.";
        }
        setAnalysisResult(friendlyMessage);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const generate = async () => {
    if (!lyrics.trim()) return;
    setLoading(true);
    
    try {
      const baseVibe = "STRICT TIKTOK GEN Z VIRAL AESTHETIC";
      const genreVibe = selections.genre.length > 0 ? `${selections.genre.join(' & ')} remixed for TikTok trends` : "TikTok viral style";
      
      const stylePrompt = `${baseVibe}: ${genreVibe}. 
        Mood: ${selections.moods.join(', ')}. 
        Expression: ${selections.ekspresi.join(', ')}. 
        Effects: ${selections.effects.join(', ')}. 
        Vocals: ${selections.vocals.join(', ')}. 
        Tempo: ${selections.tempo.join(', ')}. 
        Intro: ${selections.intro.join(', ')}. 
        Production Rules: Heavy 808s, crisp high-end, catchy earworm hooks, 15-60s viral segment focus, modern Gen Z sound design, high quality, trending TikTok audio texture.`.substring(0, 950);

      const aiPrompt = `You are a TikTok Gen Z music expert. 
      User Lyrics: "${lyrics}"
      
      STRICT RULES:
      1. Use ONLY the original words. DO NOT add or change words.
      2. Add structure tags: [Intro], [Verse 1], [Chorus], [Verse 2], [Bridge], [Final Chorus], [Outro].
      3. After each tag, add style instructions in parentheses on a new line.
      4. Assign a SPECIFIC BPM for each section within these ranges: ${selections.tempo.join(', ')}.
      
      Style Context:
      - Genre: ${selections.genre.join(', ')}
      - Mood: ${selections.moods.join(', ')}
      - Expression: ${selections.ekspresi.join(', ')}
      - Effects: ${selections.effects.join(', ')}
      - Vocals: ${selections.vocals.join(', ')}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [{ text: aiPrompt }] },
      });

      setOutput({ style: stylePrompt, lyrics: response.text || '' });
    } catch (error: any) {
      console.error("Generation failed:", error);
      let friendlyMessage = "Gagal membuat lirik.";
      if (error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
        friendlyMessage = "⚠️ Kuota API Terlampaui. Silakan tunggu sebentar.";
      }
      alert(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-slate-100 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-pink-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 md:py-20">
        <header className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] mb-6 backdrop-blur-sm"
          >
            <Zap size={12} className="fill-current" />
            Production Grade AI Engine
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-7xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent"
          >
            VibeGen<span className="text-purple-500">.</span>AI
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed"
          >
            Transform your lyrics into <span className="text-white font-medium">viral TikTok hits</span> using advanced audio analysis and Gen Z aesthetic grounding.
          </motion.p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input & Analysis */}
          <div className="lg:col-span-7 space-y-8">
            {/* Lyrics Input */}
            <section className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Music size={16} /> 01. Lyrics Input
                </h2>
              </div>
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Paste your lyrics here..."
                className="w-full h-48 bg-black/40 border border-white/5 rounded-2xl p-6 text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all resize-none font-mono text-sm leading-relaxed"
              />
            </section>

            {/* YouTube Analysis */}
            <section className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-6">
                <Youtube size={16} /> 02. Vibe Analysis
              </h2>
              <div className="flex gap-3 mb-6">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    placeholder="Paste YouTube reference link..."
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-slate-200 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  />
                  <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                </div>
                <button 
                  onClick={analyzeYouTubeLink}
                  disabled={analyzing || !youtubeLink}
                  className="px-8 bg-white text-black rounded-2xl font-bold hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {analyzing ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                  {analyzing ? 'Analyzing' : 'Analyze'}
                </button>
              </div>

              <AnimatePresence>
                {analysisResult && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Analysis Result</span>
                        <button 
                          onClick={() => setAnalysisResult(null)}
                          className="text-[10px] text-slate-500 hover:text-white transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                      <pre className={`text-xs font-mono whitespace-pre-wrap leading-relaxed ${analysisResult.includes('⚠️') ? 'text-orange-400 font-bold' : 'text-purple-200/70'}`}>
                        {analysisResult.startsWith('{') ? JSON.stringify(JSON.parse(analysisResult), null, 2) : analysisResult}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Presets */}
            <section className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-6">
                <Sparkles size={16} /> 03. Viral Presets
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.keys(vibePresets).map(preset => (
                  <button
                    key={preset}
                    onClick={() => applyPreset(preset)}
                    className={`px-4 py-4 rounded-2xl text-xs font-bold transition-all border ${
                      activePreset === preset 
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/20' 
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Options & Output */}
          <div className="lg:col-span-5 space-y-8">
            {/* Tag Selection Grid */}
            <section className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl max-h-[600px] overflow-y-auto custom-scrollbar">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-8 sticky top-0 bg-[#0a0502]/80 backdrop-blur-md py-2 z-10">
                <Zap size={16} /> 04. Style Matrix
              </h2>
              <div className="space-y-8">
                {Object.entries(options).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {items.map(item => (
                        <button
                          key={item}
                          onClick={() => toggleSelection(category, item)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${
                            selections[category].includes(item) 
                            ? 'bg-white text-black border-white shadow-lg shadow-white/10' 
                            : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <button 
                onClick={randomize}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-slate-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} /> Randomize Matrix
              </button>
              <button 
                onClick={generate}
                disabled={loading || !lyrics}
                className="w-full py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[24px] font-black text-white text-lg hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <RefreshCw className="animate-spin" size={24} /> : <Wand2 size={24} />}
                {loading ? 'Generating Vibe...' : 'Generate Viral Vibe'}
              </button>
            </div>
          </div>
        </main>

        {/* Output Section */}
        <AnimatePresence>
          {output && (
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-20 space-y-8"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-grow bg-gradient-to-r from-transparent to-white/10" />
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <Zap className="text-purple-500" size={24} /> Generated Output
                </h2>
                <div className="h-px flex-grow bg-gradient-to-l from-transparent to-white/10" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Style Prompt */}
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-[32px] relative group">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Style Musik Prompt</h3>
                    <span className="text-[10px] font-mono text-slate-600">{output.style.length}/950</span>
                  </div>
                  <div className="bg-black/40 rounded-2xl p-6 font-mono text-sm text-purple-200/80 leading-relaxed min-h-[160px]">
                    {output.style}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(output.style, 'style')}
                    className="absolute top-8 right-8 p-3 bg-white/5 rounded-xl hover:bg-purple-600 transition-all text-slate-400 hover:text-white"
                  >
                    {copyStatus === 'style' ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>

                {/* Structured Lyrics */}
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-[32px] relative group">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Structured Lyrics</h3>
                    <Music size={14} className="text-slate-600" />
                  </div>
                  <div className="bg-black/40 rounded-2xl p-6 font-mono text-sm text-slate-300 leading-relaxed min-h-[160px] whitespace-pre-wrap">
                    {output.lyrics}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(output.lyrics, 'lyrics')}
                    className="absolute top-8 right-8 p-3 bg-white/5 rounded-xl hover:bg-purple-600 transition-all text-slate-400 hover:text-white"
                  >
                    {copyStatus === 'lyrics' ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <footer className="mt-32 pt-12 border-t border-white/5 text-center space-y-4">
          <p className="text-slate-600 text-xs font-medium tracking-[0.3em] uppercase">
            Developed by <span className="text-slate-400">Ali Maksum</span>
          </p>
          <div className="flex justify-center gap-6 text-slate-700">
            <a href="#" className="hover:text-purple-500 transition-colors"><Youtube size={20} /></a>
            <a href="#" className="hover:text-purple-500 transition-colors"><Zap size={20} /></a>
            <a href="#" className="hover:text-purple-500 transition-colors"><Sparkles size={20} /></a>
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}} />
    </div>
  );
}
