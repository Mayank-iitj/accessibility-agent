"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Image as ImageIcon, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface InputZoneProps {
    onAnalyze: (data: { content: string; type: 'text' | 'image'; imageData?: string }) => void;
    isAnalyzing: boolean;
}

export function InputZone({ onAnalyze, isAnalyzing }: InputZoneProps) {
    const [text, setText] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

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
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFile = (file: File) => {
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target?.result as string);
            reader.readAsDataURL(file);
        }
        // PDF handling could go here (simplified for this iteration to text/image focus)
    };

    const submit = () => {
        if (image) {
            onAnalyze({ content: text, type: 'image', imageData: image });
        } else {
            onAnalyze({ content: text, type: 'text' });
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">

            <div
                className={cn(
                    "relative group rounded-2xl border-2 border-dashed border-white/10 bg-black/20 transition-all duration-300",
                    dragActive ? "border-primary/50 bg-primary/5" : "hover:border-white/20"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="p-8 text-center space-y-4">

                    <AnimatePresence>
                        {image ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="relative h-48 w-full object-contain mx-auto rounded-lg overflow-hidden bg-black/40"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={image} alt="Preview" className="h-full w-full object-contain" />
                                <button
                                    onClick={() => setImage(null)}
                                    className="absolute top-2 right-2 bg-black/60 hover:bg-red-500/80 p-1 rounded-full text-white transition-colors"
                                >
                                    <span className="sr-only">Remove</span>
                                    ✕
                                </button>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                                <div className="h-16 w-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Upload className="h-8 w-8 text-primary/80" />
                                </div>
                                <p className="text-lg font-medium text-white/80">Drag content here</p>
                                <p className="text-sm">or paste text / URL below</p>
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                                    accept="image/*"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="mt-4 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm cursor-pointer transition-all"
                                >
                                    Browse Device
                                </label>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="relative">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste article text, claims, or social media caption..."
                    className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                />
                <div className="absolute bottom-4 right-4">
                    <button
                        onClick={submit}
                        disabled={(!text && !image) || isAnalyzing}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all duration-300",
                            (!text && !image) || isAnalyzing
                                ? "bg-white/5 text-white/30 cursor-not-allowed"
                                : "bg-primary text-white hover:bg-primary/90 hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.6)]"
                        )}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Reasoning...
                            </>
                        ) : (
                            <>
                                Analyze
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>

        </div>
    );
}
