import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import html2canvas from 'html2canvas';
import { Download, RefreshCw, Sparkles, Copy, Check, Image as ImageIcon, AlignLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const TOPICS = [
  "The Digital Illusion (Social Media)",
  "Modern Anxiety & Overthinking",
  "Hustle Culture & Success",
  "Love & Connection in the Digital Age",
  "Artificial Intelligence & The Mind",
  "Silence in a Noisy World"
];

const THEMES = [
  {
    id: 'dark-atmospheric',
    name: 'Atmospheric Night',
    containerClass: 'bg-gradient-to-br from-zinc-900 via-black to-zinc-950 text-zinc-100',
    textClass: 'text-zinc-100 drop-shadow-md',
    authorClass: 'text-zinc-400',
    overlay: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent'
  },
  {
    id: 'warm-organic',
    name: 'Warm Clay',
    containerClass: 'bg-[#D9D0C1] text-[#2C2A28]',
    textClass: 'text-[#2C2A28]',
    authorClass: 'text-[#5A5652]',
    overlay: 'bg-noise opacity-20 mix-blend-overlay'
  },
  {
    id: 'ethereal-dawn',
    name: 'Ethereal Dawn',
    containerClass: 'bg-gradient-to-tr from-[#e0c3fc] to-[#8ec5fc] text-slate-900',
    textClass: 'text-slate-900',
    authorClass: 'text-slate-700',
    overlay: 'bg-white/10 backdrop-blur-sm'
  },
  {
    id: 'brutalist-mono',
    name: 'Brutalist Mono',
    containerClass: 'bg-[#E4E3E0] text-[#141414] border-8 border-[#141414]',
    textClass: 'text-[#141414] font-sans font-bold tracking-tighter uppercase',
    authorClass: 'text-[#141414] font-mono bg-[#141414] text-[#E4E3E0] px-2 py-1 mt-4 inline-block',
    overlay: ''
  }
];

export default function App() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [theme, setTheme] = useState(THEMES[0]);
  const [quote, setQuote] = useState("You are scrolling through a million lives, yet you have not lived your own for a single moment. Put down the screen. The real notification is the beating of your own heart.");
  const [caption, setCaption] = useState("In an age of constant connection, we have never been more disconnected from ourselves. Take a breath. Look up. Live now. ✨\n\n#Osho #ModernWisdom #Mindfulness #DigitalDetox #Awakening");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);

  const generateQuote = async () => {
    setIsGenerating(true);
    try {
      const prompt = `You are Osho, speaking to a modern audience in the year 2026. 
You speak with your characteristic poetic, paradoxical, rebellious, and deeply meditative style.
Address the topic of: "${topic}".
Create an original, profound quote suitable for an Instagram post (max 3-4 sentences). 
Do not use hashtags in the quote itself.
Also provide a short, engaging Instagram caption for this quote, including relevant hashtags.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quote: { type: Type.STRING, description: "The profound Osho quote." },
              caption: { type: Type.STRING, description: "The Instagram caption with hashtags." }
            },
            required: ["quote", "caption"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      if (result.quote && result.caption) {
        setQuote(result.quote);
        setCaption(result.caption);
      }
    } catch (error) {
      console.error("Failed to generate quote:", error);
      alert("Failed to generate quote. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!postRef.current) return;
    
    try {
      // Temporarily remove border radius for clean export if needed, 
      // but html2canvas usually handles it okay.
      const canvas = await html2canvas(postRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        backgroundColor: null,
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `osho-quote-${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-200 p-4 md:p-8 font-sans selection:bg-zinc-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 space-y-8">
          <div>
            <h1 className="text-3xl font-serif font-medium tracking-tight text-white mb-2">Modern Osho</h1>
            <p className="text-zinc-400 text-sm">AI-generated wisdom for the digital age.</p>
          </div>

          <div className="space-y-6 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50">
            {/* Topic Selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Topic
              </label>
              <div className="grid grid-cols-1 gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className={`text-left px-4 py-3 rounded-xl text-sm transition-all ${
                      topic === t 
                        ? 'bg-zinc-100 text-zinc-900 font-medium shadow-sm' 
                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-3 pt-4 border-t border-zinc-800/50">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> Aesthetic
              </label>
              <div className="grid grid-cols-2 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t)}
                    className={`px-3 py-2 rounded-lg text-xs transition-all ${
                      theme.id === t.id 
                        ? 'bg-zinc-700 text-white border border-zinc-600' 
                        : 'bg-zinc-800/30 text-zinc-400 border border-transparent hover:bg-zinc-800'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateQuote}
              disabled={isGenerating}
              className="w-full py-4 bg-white text-black rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Channeling...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Quote
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Preview & Output */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-8">
          
          {/* Instagram Post Preview (1:1 Aspect Ratio) */}
          <div className="w-full max-w-[500px] aspect-square relative group">
            <AnimatePresence mode="wait">
              <motion.div
                key={quote + theme.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                ref={postRef}
                className={`w-full h-full flex flex-col items-center justify-center p-12 text-center relative overflow-hidden ${theme.containerClass}`}
                style={{
                  // Ensure it's exactly square for export
                  width: '500px',
                  height: '500px',
                  maxWidth: '100%'
                }}
              >
                {/* Overlay for texture/gradients */}
                <div className={`absolute inset-0 pointer-events-none ${theme.overlay}`}></div>
                
                <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
                  <p 
                    className={`${theme.id === 'brutalist-mono' ? '' : 'font-serif'} text-2xl md:text-3xl lg:text-4xl leading-snug md:leading-tight mb-8 ${theme.textClass}`}
                    style={{
                      fontStyle: theme.id === 'brutalist-mono' ? 'normal' : 'italic'
                    }}
                  >
                    "{quote}"
                  </p>
                  <p className={`text-sm tracking-[0.2em] uppercase font-semibold ${theme.authorClass}`}>
                    — Osho
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Download Button Overlay */}
            <button
              onClick={downloadImage}
              className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              title="Download Image"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>

          {/* Caption Area */}
          <div className="w-full max-w-[500px] bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800/50">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <AlignLeft className="w-3 h-3" /> Suggested Caption
              </label>
              <button
                onClick={copyCaption}
                className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-medium bg-zinc-800 px-3 py-1.5 rounded-lg"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">
              {caption}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
