import { useState, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { toPng } from 'html-to-image';
import { Download, RefreshCw, Sparkles, Copy, Check, Image as ImageIcon, AlignLeft, Type as TypeIcon, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const TOPICS = [
  "The Digital Illusion",
  "Modern Anxiety",
  "Hustle Culture",
  "Love & Connection",
  "Artificial Intelligence",
  "Silence in Noise"
];

const ASPECT_RATIOS = [
  { id: '1:1', name: 'Square (IG)', class: 'aspect-square', width: 1080, height: 1080 },
  { id: '4:5', name: 'Portrait (IG)', class: 'aspect-[4/5]', width: 1080, height: 1350 },
  { id: '9:16', name: 'Story/Pin', class: 'aspect-[9/16]', width: 1080, height: 1920 }
];

const THEMES = [
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    containerClass: 'bg-[#0A0A0A] text-[#F5F5F5]',
    textClass: 'text-[#F5F5F5] font-serif font-normal tracking-wide',
    authorClass: 'text-[#F5F5F5]/50 font-sans tracking-[0.25em] text-[10px] uppercase',
    overlay: ''
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    containerClass: 'bg-[#F9F9F9] text-[#111111]',
    textClass: 'text-[#111111] font-serif font-normal tracking-wide',
    authorClass: 'text-[#111111]/50 font-sans tracking-[0.25em] text-[10px] uppercase',
    overlay: ''
  },
  {
    id: 'warm-stone',
    name: 'Warm Stone',
    containerClass: 'bg-[#EAE6DF] text-[#2C2A28]',
    textClass: 'text-[#2C2A28] font-serif font-normal tracking-wide',
    authorClass: 'text-[#2C2A28]/50 font-sans tracking-[0.25em] text-[10px] uppercase',
    overlay: 'bg-noise opacity-10 mix-blend-overlay'
  },
  {
    id: 'modern-sans',
    name: 'Modern Sans',
    containerClass: 'bg-[#1A1A1A] text-[#F5F5F5]',
    textClass: 'text-[#F5F5F5] font-sans font-normal leading-relaxed tracking-wide',
    authorClass: 'text-[#F5F5F5]/40 font-sans tracking-[0.2em] text-[10px] uppercase',
    overlay: ''
  }
];

export default function App() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [theme, setTheme] = useState(THEMES[0]);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [quote, setQuote] = useState("You are scrolling through a million lives, yet you have not lived your own for a single moment. Put down the screen. The real notification is the beating of your own heart.");
  const [caption, setCaption] = useState("In an age of constant connection, we have never been more disconnected from ourselves. Take a breath. Look up. Live now. ✨\n\n#Osho #ModernWisdom #Mindfulness #DigitalDetox #Awakening");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);

  const generateQuote = async () => {
    setIsGenerating(true);
    try {
      const activeTopic = customTopic.trim() || topic;
      const prompt = `You are a profound, modern philosopher (like Osho, but speaking to today's world).
Address the topic of: "${activeTopic}".
Create a completely original, profound, and deeply insightful quote suitable for a premium social media post (max 2-4 sentences). It should feel like a fresh, modern revelation.
Do not use hashtags in the quote itself.
Also provide a short, engaging Instagram/Pinterest caption for this quote, including relevant hashtags.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
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
      // Calculate pixel ratio to hit the target width (e.g., 1080px)
      const currentWidth = postRef.current.offsetWidth;
      const targetPixelRatio = aspectRatio.width / currentWidth;

      const dataUrl = await toPng(postRef.current, {
        quality: 1.0,
        pixelRatio: targetPixelRatio,
        backgroundColor: theme.containerClass.includes('bg-[#0A0A0A]') ? '#0A0A0A' : 
                         theme.containerClass.includes('bg-[#F9F9F9]') ? '#F9F9F9' : 
                         theme.containerClass.includes('bg-[#EAE6DF]') ? '#EAE6DF' : '#1A1A1A',
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `quote-${Date.now()}.png`;
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
    <div className="min-h-screen bg-[#050505] text-zinc-200 p-4 md:p-8 font-sans selection:bg-zinc-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <h1 className="text-3xl font-serif font-medium tracking-tight text-white mb-2">Premium Quotes</h1>
            <p className="text-zinc-400 text-sm font-light">Original, minimal wisdom for social media.</p>
          </div>

          <div className="space-y-6 bg-zinc-900/40 p-6 rounded-2xl border border-white/5">
            {/* Topic Selection */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <TypeIcon className="w-3 h-3" /> Topic or Prompt
              </label>
              <input
                type="text"
                placeholder="Type any topic (e.g., 'Letting go of the past')"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
              />
              
              <div className="flex flex-wrap gap-2 pt-2">
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTopic(t);
                      setCustomTopic("");
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      topic === t && !customTopic
                        ? 'bg-zinc-200 text-zinc-900 font-medium' 
                        : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-white/5'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Selection */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Layout className="w-3 h-3" /> Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-3 py-2 rounded-lg text-xs transition-all ${
                      aspectRatio.id === ratio.id 
                        ? 'bg-zinc-800 text-white border border-zinc-600' 
                        : 'bg-zinc-950/50 text-zinc-500 border border-transparent hover:bg-zinc-900'
                    }`}
                  >
                    {ratio.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div className="space-y-3 pt-4 border-t border-white/5">
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
                        ? 'bg-zinc-800 text-white border border-zinc-600' 
                        : 'bg-zinc-950/50 text-zinc-500 border border-transparent hover:bg-zinc-900'
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
                  Crafting...
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
        <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-8">
          
          {/* Post Preview Container */}
          <div className={`w-full max-w-[400px] ${aspectRatio.class} relative group transition-all duration-500 ease-in-out`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={quote + theme.id + aspectRatio.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                ref={postRef}
                className={`w-full h-full flex flex-col items-center justify-center p-10 md:p-14 text-center relative overflow-hidden ${theme.containerClass}`}
              >
                {/* Overlay for texture/gradients */}
                {theme.overlay && <div className={`absolute inset-0 pointer-events-none ${theme.overlay}`}></div>}
                
                <div className="relative z-10 flex flex-col items-center justify-center h-full w-full px-6">
                  <p 
                    className={`text-lg md:text-xl lg:text-[22px] leading-relaxed md:leading-loose mb-8 text-center text-balance max-w-[85%] mx-auto ${theme.textClass}`}
                    style={{
                      fontStyle: theme.id === 'modern-sans' ? 'normal' : 'italic'
                    }}
                  >
                    "{quote}"
                  </p>
                  <div className="w-6 h-[1px] bg-current opacity-20 mb-6"></div>
                  <p className={`text-[9px] md:text-[10px] ${theme.authorClass}`}>
                    MODERN WISDOM
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Download Button Overlay */}
            <button
              onClick={downloadImage}
              className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              title="Download High-Res Image"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>

          {/* Caption Area */}
          <div className="w-full max-w-[400px] bg-zinc-900/40 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <AlignLeft className="w-3 h-3" /> Caption
              </label>
              <button
                onClick={copyCaption}
                className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-medium bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-white/5"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans font-light">
              {caption}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
