import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Plus, Trash2, Play, Pause, StepForward, StepBack, Search, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateCircularLinkedListSteps } from '@/lib/dsaAdvancedUtils';

const CircularLinkedListVisualizer = ({ darkMode }) => {
    const [list, setList] = useState([
        { id: 1, value: 10 },
        { id: 2, value: 20 },
        { id: 3, value: 30 }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [indexValue, setIndexValue] = useState('0');
    const [activeMode, setActiveMode] = useState('insert');

    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);

    // Animation loop
    useEffect(() => {
        let interval;
        if (isPlaying && currentStep < history.length - 1) {
            interval = setInterval(() => {
                setCurrentStep(prev => prev + 1);
            }, 800);
        } else if (currentStep >= history.length - 1) {
            setIsPlaying(false);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentStep, history]);

    const handleInsert = () => {
        if (!inputValue) return;
        const val = parseInt(inputValue);
        const idx = parseInt(indexValue) || 0;

        const steps = generateCircularLinkedListSteps(list, 'insert', { value: val, index: idx });
        setHistory(steps);
        setCurrentStep(-1);
        setIsPlaying(true);
        setInputValue('');
    };

    const handleDelete = () => {
        const idx = parseInt(indexValue) || 0;
        const steps = generateCircularLinkedListSteps(list, 'delete', { index: idx });
        setHistory(steps);
        setCurrentStep(-1);
        setIsPlaying(true);
    };

    const handleSearch = () => {
        if (!inputValue) return;
        const val = parseInt(inputValue);
        const steps = generateCircularLinkedListSteps(list, 'search', { value: val });
        setHistory(steps);
        setCurrentStep(-1);
        setIsPlaying(true);
        setInputValue('');
    };

    const handlePlayPause = () => {
        if (history.length === 0 || currentStep >= history.length - 1) {
            const steps = generateCircularLinkedListSteps(list, 'traverse');
            setHistory(steps);
            setCurrentStep(-1);
            setIsPlaying(true);
        } else {
            setIsPlaying(!isPlaying);
        }
    };

    const handleStepForward = () => {
        if (history.length === 0 || currentStep >= history.length - 1) {
            const steps = generateCircularLinkedListSteps(list, 'traverse');
            setHistory(steps);
            setCurrentStep(0);
        } else {
            setCurrentStep(p => Math.min(history.length - 1, p + 1));
        }
    };

    // Determine current display state
    const displayList = currentStep >= 0 && history[currentStep] && history[currentStep].list ? history[currentStep].list : list;
    const activeIndex = currentStep >= 0 && history[currentStep] ? history[currentStep].highlightedIndex ?? history[currentStep].index : -1;
    const message = currentStep >= 0 && history[currentStep] ? history[currentStep].message : "Ready";
    const currentStepData = currentStep >= 0 && history[currentStep] ? history[currentStep] : null;
    const isCurveHighlighted = currentStepData?.type === 'highlight-curve';

    // Update actual state when animation finishes
    useEffect(() => {
        if (currentStep === history.length - 1 && history.length > 0) {
            if (history[currentStep] && history[currentStep].list) {
                setList(history[currentStep].list);
            }
        }
    }, [currentStep, history]);

    return (
        <div className="space-y-6">
            <div className={cn("p-4 rounded-lg border flex flex-col gap-4", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>

                <div className="flex justify-between items-center w-full">
                    <div className={cn("flex gap-1 p-1 rounded-md", darkMode ? "bg-slate-800" : "bg-slate-100")}>
                        <button
                            className={cn("px-3 py-1.5 text-sm font-medium rounded-sm transition-all flex items-center", activeMode === 'insert' ? (darkMode ? "bg-slate-700 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm") : (darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"))}
                            onClick={() => setActiveMode('insert')}
                        >
                            <Plus className="w-4 h-4 mr-1.5" /> Insert
                        </button>
                        <button
                            className={cn("px-3 py-1.5 text-sm font-medium rounded-sm transition-all flex items-center", activeMode === 'delete' ? (darkMode ? "bg-slate-700 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm") : (darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"))}
                            onClick={() => setActiveMode('delete')}
                        >
                            <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                        </button>
                        <button
                            className={cn("px-3 py-1.5 text-sm font-medium rounded-sm transition-all flex items-center", activeMode === 'search' ? (darkMode ? "bg-slate-700 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm") : (darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"))}
                            onClick={() => setActiveMode('search')}
                        >
                            <Search className="w-4 h-4 mr-1.5" /> Search
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => setCurrentStep(p => Math.max(-1, p - 1))} disabled={currentStep <= -1}>
                            <StepBack className="w-4 h-4" />
                        </Button>
                        <Button size="icon" className="h-9 w-9" onClick={handlePlayPause}>
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button size="icon" variant="outline" className="h-9 w-9" onClick={handleStepForward} disabled={history.length > 0 && currentStep >= history.length - 1}>
                            <StepForward className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    {activeMode === 'insert' && (
                        <>
                            <p className={darkMode ? "text-slate-200" : "text-slate-700"}>Val :</p>
                            <Input
                                className="w-20 h-9"
                                placeholder="Val"
                                type="number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <p className={darkMode ? "text-slate-200" : "text-slate-700"}> Pointer :</p>
                            <Input
                                className="w-20 h-9"
                                placeholder="Pointer"
                                type="number"
                                value={indexValue}
                                onChange={(e) => setIndexValue(e.target.value)}
                            />
                            <Button size="sm" className="h-9" onClick={handleInsert} disabled={isPlaying}>
                                Insert
                            </Button>
                        </>
                    )}
                    {activeMode === 'delete' && (
                        <>
                            <p className={darkMode ? "text-slate-200" : "text-slate-700"}> Pointer :</p>
                            <Input
                                className="w-20 h-9"
                                placeholder="Pointer"
                                type="number"
                                value={indexValue}
                                onChange={(e) => setIndexValue(e.target.value)}
                            />
                            <Button size="sm" variant="destructive" className="h-9" onClick={handleDelete} disabled={isPlaying}>
                                Delete
                            </Button>
                        </>
                    )}
                    {activeMode === 'search' && (
                        <>
                            <p className={darkMode ? "text-slate-200" : "text-slate-700"}>Val :</p>
                            <Input
                                className="w-20 h-9"
                                placeholder="Val"
                                type="number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <Button size="sm" className="h-9" onClick={handleSearch} disabled={isPlaying}>
                                Search
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div className="text-center text-sm font-medium text-slate-500 h-6">{message}</div>

            <div className={cn("relative h-[240px] p-8 rounded-xl border flex items-center justify-start overflow-x-auto", darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200")}>
                {displayList.length > 1 && (
                    <svg className="absolute left-0 top-0 pointer-events-none h-full" style={{ width: `${Math.max(800, displayList.length * 104 + 100)}px` }}>
                        <defs>
                            <marker id="circular-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill={darkMode ? "#94a3b8" : "#94a3b8"} />
                            </marker>
                            <marker id="circular-arrow-highlighted" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
                            </marker>
                        </defs>
                        <path
                            d={`M ${64 + (displayList.length - 1) * 104} 160 Q ${(64 + (displayList.length - 1) * 104 + 64) / 2} 230 64 160`}
                            fill="transparent"
                            stroke={isCurveHighlighted ? "#8b5cf6" : (darkMode ? "#94a3b8" : "#94a3b8")}
                            strokeWidth={isCurveHighlighted ? "3" : "2.5"}
                            strokeDasharray="4 4"
                            markerEnd={isCurveHighlighted ? "url(#circular-arrow-highlighted)" : "url(#circular-arrow)"}
                        />
                    </svg>
                )}

                {displayList.map((node, idx) => (
                    <div key={node.id} className="flex items-center animate-in fade-in zoom-in duration-300">
                        <div className={cn(
                            "w-16 h-16 rounded-lg flex items-center justify-center border-2 font-bold text-lg transition-colors duration-300 relative",
                            idx === activeIndex
                                ? "bg-violet-500 border-violet-400 text-white scale-110 z-10"
                                : (darkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-700")
                        )}>
                            {node.value}
                        </div>
                        {idx < displayList.length - 1 && (
                            <ArrowRight className={cn("mx-2 w-6 h-6", darkMode ? "text-slate-600" : "text-slate-300")} />
                        )}
                    </div>
                ))}
                {displayList.length === 0 && <div className="text-slate-500 italic w-full text-center">List is empty</div>}
            </div>
        </div>
    );
};

export default CircularLinkedListVisualizer;
