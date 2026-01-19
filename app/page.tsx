"use client";

import { useState } from "react";
import { InputZone } from "@/components/InputZone";
import { ResultsView } from "@/components/ResultsDashboard";
import { Sparkles, BrainCircuit } from "lucide-react";

export default function Home() {
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleAnalyze = async (data: any) => {
        setAnalyzing(true);
        setResult(null);
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();
            setResult(json);
        } catch (e) {
            console.error(e);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-12">
            <header className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center mb-16 space-y-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm font-medium tracking-wide text-primary/80 uppercase">
                    <BrainCircuit className="h-4 w-4" />
                    <span>Powered by Gemini</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                    Reason3
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground">
                    Advanced claim intelligence. Detect logical fallacies, verify statistics, and uncover the truth behind viral content.
                </p>
            </header>

            <main className="max-w-5xl mx-auto">
                {!result && (
                    <div className="transition-all duration-500 ease-in-out">
                        <InputZone onAnalyze={handleAnalyze} isAnalyzing={analyzing} />
                    </div>
                )}

                {result && (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
                        <ResultsView result={result} />

                        <div className="flex justify-center mt-12">
                            <button
                                onClick={() => setResult(null)}
                                className="text-white/40 hover:text-white transition-colors text-sm"
                            >
                                Analyze Another Claim
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <footer className="fixed bottom-4 left-0 w-full text-center text-xs text-white/20 pointer-events-none">
                Deepmind Advanced Agentic Coding Validation • Non-Production Build
            </footer>
        </div>
    );
}
