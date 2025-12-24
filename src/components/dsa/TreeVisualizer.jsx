import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, RotateCcw, Plus, StepForward, StepBack } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateBSTSteps } from '@/lib/dsaAdvancedUtils';

const TreeVisualizer = ({ darkMode }) => {
    const [root, setRoot] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const svgRef = useRef(null);

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
        const { steps, finalRoot } = generateBSTSteps(root, 'insert', val);
        
        // Store final root to update later, but visualizing steps needs intermediate trees
        // For simplicity, we just track active nodes on a static "final" tree structure for now
        // or we use the snapshot provided in steps.
        setHistory(steps);
        setCurrentStep(-1);
        setIsPlaying(true);
        setInputValue('');
        
        // Hack: Update root immediately for structure, but color based on step
        // In a real rigorous impl, steps would contain full tree snapshots. 
        // Here, `generateBSTSteps` returns cloned trees in each step for correctness.
        // We'll update the "real" root at the end.
        setTimeout(() => setRoot(finalRoot), steps.length * 800); 
    };

    const displayRoot = (currentStep >= 0 && history[currentStep].root) ? history[currentStep].root : root;
    const activeId = currentStep >= 0 ? history[currentStep].activeId : null;
    const message = currentStep >= 0 ? history[currentStep].message : "Tree Ready";

    // Recursive rendering of tree
    const renderTree = (node, x, y, level, range) => {
        if (!node) return null;
        
        // Simple layout logic
        const offset = range / 2;
        
        return (
            <g key={node.id}>
                {/* Edges */}
                {node.left && (
                    <line 
                        x1={x} y1={y} 
                        x2={x - offset} y2={y + 60} 
                        stroke={darkMode ? "#334155" : "#cbd5e1"} 
                        strokeWidth="2" 
                    />
                )}
                {node.right && (
                    <line 
                        x1={x} y1={y} 
                        x2={x + offset} y2={y + 60} 
                        stroke={darkMode ? "#334155" : "#cbd5e1"} 
                        strokeWidth="2" 
                    />
                )}
                
                {/* Recursive calls */}
                {renderTree(node.left, x - offset, y + 60, level + 1, offset)}
                {renderTree(node.right, x + offset, y + 60, level + 1, offset)}

                {/* Node */}
                <circle 
                    cx={x} cy={y} r="20" 
                    fill={node.id === activeId ? "#06b6d4" : (darkMode ? "#1e293b" : "white")} 
                    stroke={node.id === activeId ? "#22d3ee" : (darkMode ? "#475569" : "#94a3b8")}
                    strokeWidth={node.id === activeId ? 3 : 2}
                    className="transition-all duration-300"
                />
                <text 
                    x={x} y={y} dy=".3em" textAnchor="middle" 
                    className={cn("text-xs font-bold pointer-events-none", darkMode ? "fill-slate-200" : "fill-slate-700")}
                >
                    {node.value}
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
                    <Button size="sm" variant="outline" onClick={() => setRoot(null)}>Clear</Button>
                </div>
                <div className="text-sm text-slate-500 font-medium">{message}</div>
            </div>

            <div className={cn("relative w-full h-[400px] border rounded-xl overflow-hidden", darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200")}>
                <svg width="100%" height="100%" ref={svgRef} viewBox="0 0 800 400">
                    <g transform="translate(400, 40)">
                        {renderTree(displayRoot, 0, 0, 1, 200)}
                    </g>
                </svg>
                {(!displayRoot) && <div className="absolute inset-0 flex items-center justify-center text-slate-500">Empty Tree</div>}
            </div>
        </div>
    );
};

export default TreeVisualizer;