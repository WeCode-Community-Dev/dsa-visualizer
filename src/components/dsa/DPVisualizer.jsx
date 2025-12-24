import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Play, RotateCcw, Dice5, Pause, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateDPSteps } from '@/lib/dsaAdvancedUtils';

const DPVisualizer = ({ darkMode }) => {
    const [problem, setProblem] = useState('LCS');
    
    // LCS States
    const [s1, setS1] = useState('');
    const [s2, setS2] = useState('ABC');
    const [customS2, setCustomS2] = useState('ABC');
    
    // Fibonacci States
    const [fibN, setFibN] = useState(10);

    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        // Generate random string on mount
        generateRandomS1();
    }, []);

    // Animation Loop
    useEffect(() => {
        let interval;
        if (isPlaying) {
            if (history.length === 0) {
                setIsPlaying(false);
                return;
            }

            if (currentStep < history.length - 1) {
                interval = setInterval(() => {
                    setCurrentStep(prev => prev + 1);
                }, 600); // Speed for Two Pointers
            } else {
                setIsPlaying(false);
            }
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentStep, history]);

    const generateRandomS1 = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let result = "";
        for (let i = 0; i < 16; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setS1(result);
        setHistory([]);
        setCurrentStep(-1);
        setIsPlaying(false);
    };

    const handleS2Change = (e) => {
        setCustomS2(e.target.value.toUpperCase());
    };

    const startVisualizer = () => {
        setS2(customS2); // Commit the input
        
        let params = {};
        if (problem === 'LCS') {
            // Ensure S1 exists synchronously for the step generator
            let currentS1 = s1;
            if (!currentS1) {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                currentS1 = "";
                for (let i = 0; i < 16; i++) {
                    currentS1 += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                setS1(currentS1);
            }
            params = { s1: currentS1, s2: customS2 };
        } else if (problem === 'Fibonacci') {
            params = { n: fibN };
        }
        
        const steps = generateDPSteps(problem, params);
        setHistory(steps);
        setCurrentStep(-1);
        setIsPlaying(true);
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            setIsPlaying(false);
        } else {
            // If history is empty or we finished the animation, start fresh
            if (history.length === 0 || currentStep >= history.length - 1) {
                startVisualizer();
            } else {
                // Otherwise, just resume
                setIsPlaying(true);
            }
        }
    };

    const handleReset = () => {
        setIsPlaying(false);
        setCurrentStep(-1);
    };

    // --- Rendering Helpers ---

    const renderFibonacci = () => {
        const table = (currentStep >= 0 && history[currentStep].table) ? history[currentStep].table : [];
        const activeCell = currentStep >= 0 ? { r: history[currentStep].i } : null;

        return (
            <div className="flex flex-wrap gap-2 justify-center">
                {table.map((val, i) => (
                    <div key={i} className={cn(
                        "min-w-[60px] h-16 flex flex-col items-center justify-center border rounded",
                        darkMode ? "bg-slate-900 text-slate-100 border-slate-700" : "bg-white text-slate-900 border-slate-200", 
                        (activeCell && activeCell.r === i) ? "border-purple-500 ring-2 ring-purple-500/20 scale-110 transition-transform" : ""
                    )}>
                        <span className="text-xs text-slate-400 border-b w-full text-center pb-1 mb-1">n={i}</span>
                        <span className="font-bold">{val !== null ? val : '-'}</span>
                    </div>
                ))}
            </div>
        );
    };

    const renderLCS = () => {
        if (currentStep < 0 && history.length === 0) {
             // Initial State
             return (
                 <div className="flex flex-col items-center gap-8 w-full py-8">
                      <div className="space-y-4 text-center">
                        <h3 className="text-sm text-slate-500 uppercase font-bold">Initial String (S1)</h3>
                        <div className="flex flex-wrap gap-1 justify-center font-mono">
                            {s1.split('').map((char, idx) => (
                                <div key={idx} className={cn(
                                    "w-10 h-10 flex items-center justify-center border rounded text-lg font-bold",
                                    darkMode ? "bg-slate-900 text-slate-500 border-slate-800" : "bg-white text-slate-300 border-slate-200"
                                )}>
                                    {char}
                                </div>
                            ))}
                        </div>
                      </div>
                      <div className="text-slate-500 animate-pulse">Click "Start" to begin Two Pointer Search</div>
                 </div>
             );
        }

        const step = history[currentStep] || history[history.length - 1];
        const { i, j, matchedIndicesS1 } = step;
        
        const isMatching = step.type === 'match';

        return (
            <div className="flex flex-col items-center gap-10 w-full py-4">
                {/* Stats */}
                <div className={cn("px-4 py-2 rounded-full border text-sm font-bold flex gap-4 shadow-sm", darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200")}>
                    <span>Pointers: <span className="text-cyan-500">i={i}</span>, <span className="text-purple-500">j={j}</span></span>
                    <span className="w-px bg-slate-700"></span>
                    <span>Matches Found: <span className="text-green-500">{matchedIndicesS1.length}</span> / {step.s2.length}</span>
                </div>

                {/* S1 Visualization (Main String) */}
                <div className="flex flex-col items-center gap-1 w-full">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Text String (S1)</div>
                    <div className="flex flex-wrap gap-1 justify-center font-mono relative px-2">
                        {step.s1.split('').map((char, idx) => {
                            const isCurrent = idx === i;
                            const isMatched = matchedIndicesS1.includes(idx);
                            
                            return (
                                <div key={idx} className="flex flex-col items-center gap-1">
                                    <div className={cn(
                                        "w-10 h-10 flex items-center justify-center border rounded text-lg font-bold transition-all duration-300",
                                        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
                                        isMatched ? "bg-green-500 text-white border-green-600 scale-110" : (darkMode ? "text-slate-300" : "text-slate-700"),
                                        isCurrent && !isMatched && "border-cyan-500 ring-2 ring-cyan-500/30 scale-110 z-10 bg-cyan-500/10"
                                    )}>
                                        {char}
                                    </div>
                                    {/* Pointer Indicator */}
                                    <div className={cn("h-4 transition-opacity duration-300", isCurrent ? "opacity-100" : "opacity-0")}>
                                        <ArrowUp className="w-4 h-4 text-cyan-500 animate-bounce" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* S2 Visualization (Pattern) */}
                <div className="flex flex-col items-center gap-1 w-full">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Pattern (S2)</div>
                    <div className="flex flex-wrap gap-1 justify-center font-mono relative px-2">
                        {step.s2.split('').map((char, idx) => {
                            const isCurrent = idx === j;
                            // In greedy matching, all chars < j are matched
                            const isMatched = idx < j || (step.type === 'match' && idx === j);

                            return (
                                <div key={idx} className="flex flex-col items-center gap-1">
                                     <div className={cn("h-4 transition-opacity duration-300", isCurrent ? "opacity-100" : "opacity-0")}>
                                        <div className="text-xs font-bold text-purple-500 mb-1">j</div>
                                    </div>
                                    <div className={cn(
                                        "w-10 h-10 flex items-center justify-center border rounded text-lg font-bold transition-all duration-300",
                                        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
                                        isMatched ? "bg-green-500 text-white border-green-600" : (darkMode ? "text-slate-300" : "text-slate-700"),
                                        isCurrent && !isMatched && "border-purple-500 ring-2 ring-purple-500/30 scale-110 z-10 bg-purple-500/10"
                                    )}>
                                        {char}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const message = currentStep >= 0 ? history[currentStep].message : `Ready to visualize ${problem}`;

    return (
        <div className="space-y-6">
            <div className={cn("p-4 rounded-lg border flex flex-col md:flex-row gap-4 items-start md:items-center justify-between", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full md:w-auto">
                    <Select value={problem} onValueChange={(val) => { setProblem(val); setHistory([]); setCurrentStep(-1); setIsPlaying(false); }} disabled={isPlaying}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Problem" />
                        </SelectTrigger>
                        <SelectContent className={cn(darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
                            <SelectItem value="LCS" className={darkMode ? "text-slate-100" : "text-slate-900"}>Longest Common Subsequence (Greedy)</SelectItem>
                            <SelectItem value="Fibonacci" className={darkMode ? "text-slate-100" : "text-slate-900"}>Fibonacci (Memoization)</SelectItem>
                        </SelectContent>
                    </Select>

                    {problem === 'LCS' && (
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Input 
                                value={customS2} 
                                onChange={handleS2Change} 
                                placeholder="Pattern (e.g. ABC)" 
                                maxLength={8}
                                className="w-32 font-mono uppercase"
                                disabled={isPlaying}
                            />
                            <Button variant="outline" size="icon" onClick={generateRandomS1} disabled={isPlaying} title="Randomize Long String">
                                <Dice5 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    <Button 
                        onClick={handlePlayPause} 
                        className={cn(isPlaying ? "bg-red-500 hover:bg-red-600" : "")}
                    >
                        {isPlaying ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> {history.length > 0 && currentStep > -1 ? "Resume" : "Start"}</>}
                    </Button>
                    
                    {(history.length > 0 || currentStep > -1) && (
                        <Button variant="outline" size="icon" onClick={handleReset} title="Reset">
                            <RotateCcw className="w-4 h-4" />
                        </Button>
                    )}
                </div>
                <div className="text-sm text-slate-500 font-medium animate-pulse">{isPlaying && "Playing..."}</div>
            </div>

            <div className={cn("p-6 rounded-xl border overflow-auto flex flex-col items-center justify-start min-h-[400px]", darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200")}>
                 <div className="w-full text-center mb-6 text-sm text-slate-500 font-medium h-6">
                    {message}
                 </div>
                 
                 {problem === 'LCS' ? renderLCS() : renderFibonacci()}
            </div>
        </div>
    );
};

export default DPVisualizer;