import { Download, ArrowLeft, Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface ResultProps {
  onBack: () => void;
  onStartOver: () => void;
  generatedImageUrl: string;
  isGenerating: boolean;
  error: string;
  debugInfo: Record<string, unknown> | null;
}

function DebugRow({ label, value }: { label: string; value: unknown }) {
  const display = typeof value === 'object' && value !== null
    ? JSON.stringify(value, null, 2)
    : String(value ?? '—');
  return (
    <div className="mb-3">
      <div className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-1">{label}</div>
      <pre className="text-xs text-slate-300 bg-black/30 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed border border-white/5">{display}</pre>
    </div>
  );
}

function DebugPanel({ debug }: { debug: Record<string, unknown> }) {
  const images = debug.images as Record<string, Record<string, unknown>> | undefined;
  const finalInput = debug.final_input_sent as Record<string, unknown> | undefined;

  return (
    <div className="mt-8 glass-card rounded-2xl p-6 border border-amber-500/20">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">Debug Output</h3>
      </div>

      <DebugRow label="Model Name" value={debug.model} />
      <DebugRow label="Model Version" value={debug.version} />

      <div className="mb-3">
        <div className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-1">Prompt Value</div>
        <pre className="text-xs text-slate-300 bg-black/30 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed border border-white/5">{String(debug.prompt_value ?? '—')}</pre>
        <div className="text-xs text-slate-500 mt-1">Length: {String(debug.prompt_length ?? '—')} chars</div>
      </div>

      {images && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-2">Image Inputs</div>
          {(['reference', 'person1', 'person2'] as const).map((key) => {
            const img = images[key];
            if (!img) return null;
            return (
              <div key={key} className="bg-black/30 rounded-lg p-3 mb-2 border border-white/5">
                <div className="text-xs font-semibold text-slate-200 mb-1.5 capitalize">{key}</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <span className="text-slate-500">Exists:</span>
                  <span className={String(img.exists) === 'true' ? 'text-green-400' : 'text-red-400'}>{String(img.exists)}</span>
                  <span className="text-slate-500">Is data URL:</span>
                  <span className={String(img.is_data_url) === 'true' ? 'text-green-400' : 'text-red-400'}>{String(img.is_data_url)}</span>
                  <span className="text-slate-500">Size (chars):</span>
                  <span className="text-slate-300">{String(img.size_chars)}</span>
                  <span className="text-slate-500">Preview:</span>
                  <span className="text-slate-300 break-all font-mono">{String(img.preview)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {finalInput && (
        <div className="mb-3">
          <div className="text-xs font-semibold text-sky-400 uppercase tracking-widest mb-2">Final Input Sent to Replicate</div>
          <div className="bg-black/30 rounded-lg p-3 border border-white/5">
            <div className="text-xs text-slate-500 mb-1">prompt:</div>
            <pre className="text-xs text-slate-300 whitespace-pre-wrap break-all mb-3">{String(finalInput.prompt)}</pre>
            <div className="text-xs text-slate-500 mb-1">image_input lengths:</div>
            <pre className="text-xs text-slate-300">{JSON.stringify(finalInput.image_input_lengths)}</pre>
            <div className="text-xs text-slate-500 mt-2 mb-1">image_input previews:</div>
            {(finalInput.image_input_previews as string[])?.map((p, i) => (
              <pre key={i} className="text-xs text-slate-300 break-all font-mono mb-1">[{i}] {p}</pre>
            ))}
          </div>
        </div>
      )}

      <DebugRow label="Replicate Response Status" value={debug.replicate_response_status} />
      <DebugRow label="Replicate Raw Body" value={debug.replicate_raw_body} />
    </div>
  );
}

export default function Result({ onBack, onStartOver, generatedImageUrl, isGenerating, error, debugInfo }: ResultProps) {
  const handleDownload = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = 'duo-style-fusion.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">

        <div className="flex items-center justify-between mb-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-sky-400 transition-colors duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to upload
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs text-sky-400 font-medium border border-sky-500/20">
            <Sparkles className="w-3 h-3" />
            DuoStyle
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            {isGenerating ? 'Creating Your Fusion' : error ? 'Generation Failed' : 'Your Styled Fusion'}
          </h2>
          <p className="text-slate-300 font-light text-sm sm:text-base">
            {isGenerating
              ? 'AI is crafting your styled photo — this may take a minute'
              : error
              ? 'Something went wrong during generation'
              : 'Your AI-generated fusion is ready to download'}
          </p>
        </div>

        <div className="glass-card rounded-2xl glow-shadow-lg overflow-hidden mb-8">
          <div className="aspect-square flex items-center justify-center relative" style={{ background: 'rgba(255,255,255,0.02)' }}>
            {isGenerating ? (
              <div className="text-center p-12">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-sky-500/15" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-sky-400 animate-spin" />
                  <div className="absolute inset-3 rounded-full bg-sky-500/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                  </div>
                </div>
                <p className="text-white font-medium text-lg mb-2">Generating your fusion...</p>
                <p className="text-slate-400 text-sm">This may take a few moments</p>
                <div className="mt-6 flex justify-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-sky-500/60 animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-center p-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                </div>
                <p className="text-white font-semibold text-lg mb-2">Generation Error</p>
                <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">{error}</p>
              </div>
            ) : generatedImageUrl ? (
              <img
                src={generatedImageUrl}
                alt="Generated fusion result"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-sky-400/60" />
                </div>
                <p className="text-slate-400 text-base">Generated result will appear here</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownload}
            disabled={isGenerating || !generatedImageUrl || !!error}
            className="btn-generate flex items-center justify-center gap-2.5 px-10 py-4 rounded-xl text-white font-semibold text-base"
          >
            <Download className="w-5 h-5" />
            Download Image
          </button>
          <button
            onClick={onStartOver}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2.5 px-10 py-4 rounded-xl glass-card-hover text-slate-300 hover:text-white font-semibold text-base border border-white/8 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Another
          </button>
        </div>

        {debugInfo && <DebugPanel debug={debugInfo} />}
      </div>
    </div>
  );
}
