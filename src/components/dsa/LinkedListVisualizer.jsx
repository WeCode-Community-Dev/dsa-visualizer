import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Plus, Trash2, Play, Pause, StepForward, StepBack, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateLinkedListSteps } from '@/lib/dsaAdvancedUtils';
import { Card } from '@/components/ui/card';

const LinkedListVisualizer = ({ darkMode }) => {
    const [list, setList] = useState([
        { id: 1, value: 10 },
        { id: 2, value: 20 },
        { id: 3, value: 30 }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [indexValue, setIndexValue] = useState('0');
    
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
        
        const steps = generateLinkedListSteps(list, 'insert', { value: val, index: idx });
        setHistory(steps);
        setCurrentStep(-1);
        setIsPlaying(true);
        setInputValue('');
    };

    const handleDelete = () => {
        const idx = parseInt(indexValue) || 0;
        const steps = generateLinkedListSteps(list, 'delete', { index: idx });
        setHistory(steps);
        setCurrentStep(-1);
        setIsPlaying(true);
    };

    // Determine current display state
    const displayList = currentStep >= 0 && history[currentStep].list ? history[currentStep].list : list;
    const activeIndex = currentStep >= 0 ? history[currentStep].highlightedIndex ?? history[currentStep].index : -1;
    const message = currentStep >= 0 ? history[currentStep].message : "Ready";

    // Update actual state when animation finishes
    useEffect(() => {
        if (currentStep === history.length - 1 && history.length > 0) {
             if (history[currentStep].list) {
                 setList(history[currentStep].list);
             }
        }
    }, [currentStep, history]);

    return (
        <div className="space-y-6">
             <div className={cn("p-4 rounded-lg border flex flex-wrap gap-4 items-center justify-between", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
                <div className="flex gap-2 items-center">
                    <Input 
                        className="w-20 h-8" 
                        placeholder="Val" 
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <Input 
                        className="w-16 h-8" 
                        placeholder="Idx" 
                        type="number"
                        value={indexValue}
                        onChange={(e) => setIndexValue(e.target.value)}
                    />
                    <Button size="sm" onClick={handleInsert} disabled={isPlaying}>
                        <Plus className="w-4 h-4 mr-1" /> Insert
                    </Button>
                    <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isPlaying}>
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                </div>

                <div className="flex gap-2">
                     <Button size="icon" variant="outline" onClick={() => setCurrentStep(p => Math.max(-1, p - 1))} disabled={currentStep <= -1}>
                         <StepBack className="w-4 h-4" />
                     </Button>
                     <Button size="icon" onClick={() => setIsPlaying(!isPlaying)}>
                         {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                     </Button>
                     <Button size="icon" variant="outline" onClick={() => setCurrentStep(p => Math.min(history.length - 1, p + 1))} disabled={currentStep >= history.length - 1}>
                         <StepForward className="w-4 h-4" />
                     </Button>
                </div>
            </div>

            <div className="text-center text-sm font-medium text-slate-500 h-6">{message}</div>

            <div className={cn("min-h-[200px] p-8 rounded-xl border flex items-center justify-start overflow-x-auto", darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200")}>
                {displayList.map((node, idx) => (
                    <div key={node.id} className="flex items-center animate-in fade-in zoom-in duration-300">
                        <div className={cn(
                            "w-16 h-16 rounded-lg flex items-center justify-center border-2 font-bold text-lg transition-colors duration-300",
                            idx === activeIndex 
                                ? "bg-cyan-500 border-cyan-400 text-white scale-110" 
                                : (darkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-300 text-slate-700")
                        )}>
                            {node.value}
                        </div>
                        {idx < displayList.length - 1 && (
                            <ArrowRight className={cn("mx-2 w-6 h-6", darkMode ? "text-slate-600" : "text-slate-300")} />
                        )}
                        {idx === displayList.length - 1 && (
                             <div className={cn("mx-2 text-xs font-mono", darkMode ? "text-slate-600" : "text-slate-400")}>NULL</div>
                        )}
                    </div>
                ))}
                {displayList.length === 0 && <div className="text-slate-500 italic w-full text-center">List is empty</div>}
            </div>
        </div>
    );
};

export default LinkedListVisualizer;