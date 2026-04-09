/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Copy, Sparkles, Wand2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const options = {
  genre: ['Pop', 'Indie', 'EDM', 'Dangdut', 'Lo-fi', 'Rock', 'Hip Hop', 'Orchestral', 'Trap', 'Dubstep', 'Fusion', '808 Bass', 'Future Bass', 'Afrobeats', 'Bassoon', 'TR-909', 'Megah', 'Pad', 'Synthesizer', 'Subito/Surprise', 'Bass Hits', 'Bass Kejut', 'Phonk', 'Wobble Bass', 'Drum Machine', 'Drum', 'Soul', 'Neo-soul', 'Drum Bass', 'Sub Bass', 'heavy metal', 'Snare Drum', 'Contra Bass', 'Vibe Bass', 'Bass Build Up', 'String Violin build up', 'String Cello build up', 'String Glissando build up', 'String Rise build up', 'Brass French Horn build up', 'Brass Trombone build up', 'Taiko Drum drum Jepang', 'Percussion cinematic impact hit', 'Timpani / drum cinematic', 'riser + string + brass'],
  intro: ['Slow piano', 'Viral TikTok intro', 'Beat drop', 'Ambient pad', 'Cinematic opening', 'Phonk cowbell', 'Glitchy vocal chop', 'Lo-fi vinyl crackle', 'Bass-boosted riser', 'Sped-up chipmunk vocal', 'Minimalist trap hi-hats', 'Retro synthwave arpeggio', 'ASMR whisper start'],
  moods: ['Sad', 'Happy', 'Broken', 'Romantic', 'Chill', 'Energetic', 'Dark', 'Dreamy', 'Epik', 'Melankolis', 'Membangkitkan Semangat', 'Agresif', 'Bermimpi', 'Gelap', 'Enerjik', 'Sinematik', 'Santai', 'Menyeramkan', 'Nostalgia', 'Penuh Harapan', 'Marah', 'Tenang', 'Misterius', 'Ethereal', 'Trippy', 'AnehLounge', 'Megah', 'Itens', 'Peaceful', 'Seksi', 'Heroik', 'Gotik', 'Cemas', 'Psikedelik', 'Minimalis', 'Sensual', 'Canggih', 'Epic / Dramatic Instrumental', 'Modern Classical'],
  ekspresi: ['Emotional', 'Powerful', 'Soft', 'Whisper', 'Aggressive', 'Melancholic', 'Appassionato Penuh Gairah', 'Dolce Manis & Lembut', 'Lacrimoso Penuh Air Mata', 'Con Fuoco Berapi-api', 'Cantabile Seperti Menyanyi', 'Maestoso Agung/Mulia', 'Espressivo Ekspresif', 'Agitato Gelisah/Cepat', 'Sotto Voce Berbisik', 'Grave Serius & Berat', 'Leggiero Ringan & Halus', 'Doloroso Pedih/Sedih', 'Furioso Sangat Marah', 'Amoroso Penuh Kasih', 'Misterioso Misterius', 'Manja'],
  effects: ['Effect Glitch', 'Effect FX', 'Effect Helium', 'Effect Reverb', 'Effect Delay', 'Effect Distortion', 'Effect Bitcrush', 'Effect Flanger', 'Effect Phaser', 'Effect Chorus', 'Effect Wah-wah', 'Effect Tremolo', 'Effect Vibrato', 'Effect Auto-pan', 'Effect Gate', 'Effect Compression', 'Effect Limiter', 'Effect EQ High-pass', 'Effect EQ Low-pass', 'Effect EQ Band-pass', 'Effect Sidechain', 'Effect Reverse', 'Effect Pitch Shift', 'Effect Time Stretch', 'Effect Granular', 'Effect Lo-fi Vinyl', 'Effect Tape Saturation'],
  vocals: ['Male', 'Female', 'Duo', 'Choir', 'Auto-tune', 'Robotic', 'Indie voice', 'Anak-anak', 'Berbisik', 'Berbicara', 'Menyanyi', 'Vocals Effect FX', 'Vocals Effect Glitch', 'Vocals Effect Helium', 'Vocals Effect Reverb', 'Rap', 'Vocals Lembut', 'Vocals Sensual', 'Vocals Manja'],
  tempo: ['40-60 BPM', '60-80 BPM', '80-100 BPM', '100-120 BPM', 'Cepat 140+ BPM', 'Sangat Cepat 180+ BPM', 'Adagio Sangat Lambat', 'Andante Kecepatan Jalan', 'Moderato Sedang', 'Allegro Cepat & Ceria', 'Presto Sangat Cepat', 'Accelerando Semakin Cepat', 'Rubato Tempo Ekspresif', 'Staccato Terputus-putus', 'Legato Mengalir'],
};

const vibePresets: Record<string, Record<string, string[]>> = {
  'Disco Vibe Tiktok': {
    genre: ['Pop', 'EDM'],
    intro: ['Beat drop'],
    moods: ['Happy', 'Energetic'],
    ekspresi: ['Powerful'],
    vocals: ['Female'],
    tempo: ['100-120 BPM']
  },
  'Dj Vibe Tiktok': {
    genre: ['EDM', 'Trap', '808 Bass'],
    intro: ['Beat drop', 'Viral TikTok intro'],
    moods: ['Energetic', 'Trippy', 'Itens'],
    ekspresi: ['Agitato Gelisah/Cepat'],
    vocals: ['Auto-tune'],
    tempo: ['Cepat 140+ BPM']
  },
  'Dangdut Vibe Tiktok': {
    genre: ['Dangdut'],
    intro: ['Viral TikTok intro'],
    moods: ['Happy', 'Santai'],
    ekspresi: ['Manja'],
    vocals: ['Female'],
    tempo: ['100-120 BPM']
  },
  'Orchestra Vibe Tiktok': {
    genre: ['Orchestral', 'Megah'],
    intro: ['Cinematic opening'],
    moods: ['Heroik', 'Sinematik', 'Megah'],
    ekspresi: ['Maestoso Agung/Mulia'],
    vocals: ['Choir'],
    tempo: ['40-60 BPM']
  },
  'HipHop Vibe Tiktok': {
    genre: ['Hip Hop', 'Trap'],
    intro: ['Phonk cowbell', 'Minimalist trap hi-hats'],
    moods: ['Dark', 'Energetic', 'Agresif'],
    ekspresi: ['Aggressive'],
    vocals: ['Male'],
    tempo: ['80-100 BPM']
  },
  'House Vibe Tiktok': {
    genre: ['EDM', 'Fusion'],
    intro: ['Ambient pad', 'Lo-fi vinyl crackle'],
    moods: ['Chill', 'Dreamy', 'Peaceful'],
    ekspresi: ['Soft'],
    vocals: ['Female', 'Berbisik'],
    tempo: ['100-120 BPM']
  }
};

export default function App() {
  const [lyrics, setLyrics] = useState('');
  const [selections, setSelections] = useState<Record<string, string[]>>({
    genre: [], intro: [], moods: [], ekspresi: [], effects: [], vocals: [], tempo: []
  });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [output, setOutput] = useState<{ style: string; lyrics: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleSelection = (category: string, item: string) => {
    setActivePreset(null);
    setSelections(prev => {
      const current = prev[category];
      return {
        ...prev,
        [category]: current.includes(item) ? current.filter(i => i !== item) : [...current, item]
      };
    });
  };

  const applyPreset = (presetName: string) => {
    const preset = vibePresets[presetName];
    if (preset) {
      setActivePreset(presetName);
      setSelections({
        genre: preset.genre || [],
        intro: preset.intro || [],
        moods: preset.moods || [],
        ekspresi: preset.ekspresi || [],
        effects: preset.effects || [],
        vocals: preset.vocals || [],
        tempo: preset.tempo || []
      });
    }
  };

  const randomize = () => {
    setActivePreset(null);
    const randomSelections: Record<string, string[]> = {};
    Object.keys(options).forEach(key => {
      const opts = options[key as keyof typeof options];
      randomSelections[key] = [opts[Math.floor(Math.random() * opts.length)]];
    });
    setSelections(randomSelections);
  };

  const generate = async () => {
    if (!lyrics.trim()) {
      alert('Please enter lyrics first!');
      return;
    }
    setLoading(true);
    try {
      // Enforce strict TikTok Gen Z vibe in the prompt construction
      const baseVibe = "STRICT TIKTOK GEN Z VIRAL AESTHETIC";
      const genreVibe = selections.genre.length > 0 ? `${selections.genre.join(' & ')} remixed for TikTok trends` : "TikTok viral style";
      
      const stylePrompt = `${baseVibe}: ${genreVibe}. 
        Mood: ${selections.moods.join(', ')}. 
        Expression: ${selections.ekspresi.join(', ')}. 
        Effects: ${selections.effects.join(', ')}. 
        Vocals: ${selections.vocals.join(', ')}. 
        Tempo: ${selections.tempo.join(', ')}. 
        Intro: ${selections.intro.join(', ')}. 
        Production Rules: Heavy 808s, crisp high-end, catchy earworm hooks, 15-60s viral segment focus, modern Gen Z sound design, high quality, trending TikTok audio texture.`;
      
      const aiPrompt = `You are a TikTok Gen Z music expert. 
      Your task is to take the user's lyrics and ONLY add structure tags and style instructions.
      
      STRICT RULES:
      1. Use ONLY the original words provided by the user: "${lyrics}".
      2. DO NOT add any new lyrics, words, or sentences.
      3. DO NOT change or rewrite any of the user's words.
      4. ONLY add tags like [Intro], [Verse 1], [Chorus], [Verse 2], [Bridge], [Final Chorus], [Outro].
      5. Distribute the user's existing text into these sections logically.
      6. After each tag, add the style instructions in parentheses on a new line based on these settings:
         - Genre: ${selections.genre.join(', ')}
         - Mood: ${selections.moods.join(', ')}
         - Expression: ${selections.ekspresi.join(', ')}
         - Effects: ${selections.effects.join(', ')}
         - Vocals: ${selections.vocals.join(', ')}
         - Intro Style: ${selections.intro.join(', ')}
         
      7. TEMPO DYNAMIC RULE:
         - Selected Tempo Ranges: ${selections.tempo.join(', ')}
         - For EACH section (Verse, Chorus, etc.), you MUST assign a SPECIFIC BPM number.
         - This number MUST fall within the selected ranges. 
         - Example: If "60-80 BPM" is selected, you might assign 80 BPM to Verse, 60 BPM to Pre-chorus, 65 BPM to Bridge, etc.
         - If multiple ranges are selected (e.g., "40-60 BPM" and "120-140 BPM"), ONLY pick numbers from those specific ranges.
         - Mention the specific BPM in the style instructions for each section.
      
      The goal is to format the user's EXACT lyrics into a TikTok-ready structure without any creative expansion, with dynamic BPMs per section.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: aiPrompt,
      });

      setOutput({ style: stylePrompt, lyrics: response.text || '' });
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("AI Generation failed. Please check your connection or API key.");
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <header className="max-w-4xl mx-auto mb-12 text-center">
        <div className="inline-block px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">
          Strict TikTok Gen Z Mode Only
        </div>
        <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 tracking-tighter">
          VibeGen AI
        </h1>
        <p className="text-slate-400 text-lg font-medium">
          The <span className="text-pink-500">Only</span> AI Music Generator for TikTok Gen Z Viral Hits
        </p>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        <section className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="Enter your lyrics here..."
            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none mb-4"
          />
          
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Presets: TikTok Vibes</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(vibePresets).map(preset => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className={`px-4 py-2 border rounded-xl text-sm transition-all flex items-center gap-2 group ${
                    activePreset === preset 
                    ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-purple-900/40 hover:border-purple-500/50'
                  }`}
                >
                  <Sparkles size={14} className={`${activePreset === preset ? 'text-white' : 'text-purple-400'} group-hover:scale-110 transition-transform`} />
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(options).map(([category, items]) => (
            <div key={category} className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {items.map(item => (
                  <button
                    key={item}
                    onClick={() => toggleSelection(category, item)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${selections[category].includes(item) ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>

        <div className="flex gap-4 justify-center">
          <button onClick={randomize} className="flex items-center gap-2 px-6 py-3 bg-slate-800 rounded-full hover:bg-slate-700 transition">
            <RefreshCw size={18} /> Randomize
          </button>
          <button onClick={generate} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 rounded-full font-black text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all transform hover:scale-105 active:scale-95">
            <Wand2 size={18} /> Generate Strict TikTok Vibe
          </button>
        </div>

        {loading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-purple-400">Generating vibe...</motion.div>}

        {output && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative">
              <h3 className="font-bold mb-2">Style Musik Prompt</h3>
              <textarea readOnly value={output.style} className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm font-mono" />
              <button onClick={() => copy(output.style)} className="absolute top-8 right-8 p-2 bg-slate-800 rounded-lg hover:bg-slate-700"><Copy size={16} /></button>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative">
              <h3 className="font-bold mb-2">Lirik Terstruktur</h3>
              <textarea readOnly value={output.lyrics} className="w-full h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm font-mono" />
              <button onClick={() => copy(output.lyrics)} className="absolute top-8 right-8 p-2 bg-slate-800 rounded-lg hover:bg-slate-700"><Copy size={16} /></button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
