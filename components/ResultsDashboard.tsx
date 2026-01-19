"use client";

import { AlertTriangle, CheckCircle2, HelpCircle, XCircle, ChevronDown, ChevronUp, Lightbulb, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Types matching our backend response
type Claim = {
    claim_id: string;
    claim_text: string;
    claim_type: string;
    verdict: "Well-Supported" | "Partially Supported" | "Misleading" | "Insufficient Information";
    confidence_score: number;
    logical_issues: string[];
    statistical_issues: string[];
    explanation: string;
    what_would_make_this_true: string;
};

type AnalysisResult = {
    analysis_target: string;
    claims: Claim[];
    overall_risk_score: number;
    summary_insight: string;
};

const VerdictBadge = ({ verdict, score }: { verdict: string, score: number }) => {
    const config = {
        "Well-Supported": { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", icon: CheckCircle2 },
        "Partially Supported": { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", icon: AlertTriangle },
        "Misleading": { color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: XCircle },
        "Insufficient Information": { color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", icon: HelpCircle },
    }[verdict] || { color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/20", icon: HelpCircle };

    const Icon = config.icon;

    return (
        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border", config.bg, config.border)}>
            <Icon className={cn("h-4 w-4", config.color)} />
            <span className={cn("text-sm font-medium", config.color)}>{verdict}</span>
            <span className="text-xs text-white/40">| {score}% Confidence</span>
        </div>
    );
}

export function ClaimCard({ claim, index }: { claim: Claim, index: number }) {
    const [expanded, setExpanded] = useState(index === 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="w-full glass-card rounded-xl overflow-hidden mb-4"
        >
            <div
                className="p-4 flex items-start gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="mt-1">
                    <VerdictBadge verdict={claim.verdict} score={claim.confidence_score} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-medium leading-tight text-white mb-1">{claim.claim_text}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {claim.logical_issues.map((issue, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/20">
                                {issue}
                            </span>
                        ))}
                    </div>
                </div>
                <button className="text-white/40 hover:text-white">
                    {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-0 border-t border-white/10 bg-black/20 space-y-6">

                            {/* Explanation Section */}
                            <div className="mt-4">
                                <h4 className="text-sm uppercase tracking-wider text-white/50 mb-2 font-semibold">Gemini Analysis</h4>
                                <p className="text-white/80 leading-relaxed text-sm">{claim.explanation}</p>
                            </div>

                            {/* What Would Make This True */}
                            {claim.verdict !== "Well-Supported" && (
                                <div className="rounded-lg bg-blue-500/5 border border-blue-500/10 p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="h-4 w-4 text-blue-400" />
                                        <h4 className="text-sm font-semibold text-blue-400">What Would Make This True?</h4>
                                    </div>
                                    <p className="text-sm text-blue-100/70 italic">
                                        {claim.what_would_make_this_true}
                                    </p>
                                </div>
                            )}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export function ResultsView({ result }: { result: AnalysisResult }) {
    if (!result) return null;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 pb-20">

            {/* Header Summary */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-2 mb-8"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-sm text-white/60 mb-2">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Risk Score: <span className={cn("font-bold", result.overall_risk_score > 50 ? "text-red-400" : "text-green-400")}>{result.overall_risk_score}/100</span></span>
                </div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white">
                    {result.summary_insight}
                </h2>
            </motion.div>

            {/* Claims Stack */}
            <div className="space-y-4">
                {result.claims.map((claim, idx) => (
                    <ClaimCard key={claim.claim_id} claim={claim} index={idx} />
                ))}
            </div>

        </div>
    );
}
