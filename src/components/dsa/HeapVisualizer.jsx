import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, Plus, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateHeapSteps } from '@/lib/dsaAdvancedUtils';

const HeapVisualizer = ({ darkMode, heapType }) => {
    const [heap, setHeap] = useState([10, 20, 15, 30, 40]);
    const [inputValue, setInputValue] = useState('');
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);

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
        const steps = generateHeapSteps(heap, 'insert', val, heapType);
        setHistory(steps);
        setCurrentStep(-1);
        setIsPlaying(true);
        setInputValue('');
        
        // Update final state
        if(steps.length > 0) {
            setTimeout(() => setHeap(steps[steps.length-1].heap), steps.length * 800);
        }
    };

    const displayHeap = (currentStep >= 0 && history[currentStep].heap) ? history[currentStep].heap : heap;
    const activeIdx = currentStep >= 0 ? history[currentStep].activeIdx : null;
    const compareIndices = currentStep >= 0 && history[currentStep].type === 'compare' ? history[currentStep].indices : [];
    const message = currentStep >= 0 ? history[currentStep].message : `Heap Ready (${heapType})`;

    // Render as tree
    const renderTree = (idx, x, y, offset) => {
        if (idx >= displayHeap.length) return null;

        const leftIdx = 2 * idx + 1;
        const rightIdx = 2 * idx + 2;

        const isActive = idx === activeIdx;
        const isComparing = compareIndices.includes(idx);

        return (
            <g key={idx}>
                {leftIdx < displayHeap.length && (
                    <line x1={x} y1={y} x2={x - offset} y2={y + 50} stroke={darkMode ? "#334155" : "#cbd5e1"} strokeWidth="2" />
                )}
                {rightIdx < displayHeap.length && (
                    <line x1={x} y1={y} x2={x + offset} y2={y + 50} stroke={darkMode ? "#334155" : "#cbd5e1"} strokeWidth="2" />
                )}
                
                {renderTree(leftIdx, x - offset, y + 50, offset / 2)}
                {renderTree(rightIdx, x + offset, y + 50, offset / 2)}
                
                <circle 
                    cx={x} cy={y} r="18" 
                    fill={isActive ? "#22c55e" : isComparing ? "#eab308" : (darkMode ? "#1e293b" : "white")}
                    stroke={isActive ? "#22c55e" : isComparing ? "#eab308" : (darkMode ? "#475569" : "#94a3b8")}
                    strokeWidth="2"
                />
                <text 
                    x={x} y={y} dy=".3em" textAnchor="middle" 
                    className={cn("text-xs font-bold pointer-events-none", isActive || isComparing ? "fill-white" : (darkMode ? "fill-slate-200" : "fill-slate-700"))}
                >
                    {displayHeap[idx]}
                </text>
            </g>
        );
    };

    return (
        <div className="space-y-6">
            <div className={cn("p-4 rounded-lg border flex gap-4 items-center justify-between", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
                <div className="flex gap-2">
                    <Input 
                        className="w-24 h-8" 
                        placeholder="Value" 
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <Button size="sm" onClick={handleInsert} disabled={isPlaying}>
                        <Plus className="w-4 h-4 mr-1" /> Insert
                    </Button>
                </div>
                <div className="text-sm text-slate-500 font-medium">{message}</div>
            </div>

            {/* Array View - Fix: Added explicit text colors for readability */}
            <div className="flex gap-1 justify-center overflow-x-auto p-4 bg-slate-100 dark:bg-slate-900 rounded-lg">
                {displayHeap.map((val, i) => (
                    <div key={i} className={cn(
                        "w-10 h-10 flex items-center justify-center border rounded font-bold transition-colors",
                        i === activeIdx ? "bg-green-500 text-white border-green-600" :
                        compareIndices.includes(i) ? "bg-yellow-500 text-white border-yellow-600" : 
                        "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                    )}>
                        {val}
                    </div>
                ))}
            </div>

            {/* Tree View */}
            <div className={cn("relative w-full h-[350px] border rounded-xl overflow-hidden", darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200")}>
                <svg width="100%" height="100%" viewBox="0 0 800 350">
                    <g transform="translate(400, 40)">
                        {renderTree(0, 0, 0, 160)}
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default HeapVisualizer;