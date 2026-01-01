
import React, { useState, useEffect, useRef } from 'react';
import * as algorithms from '@/lib/dsaAlgorithms';
import { cn } from '@/lib/utils';

const SortingVisualizer = ({ array, algorithmName, isPlaying, speed, onFinished, className, searchTarget }) => {
    const [displayArray, setDisplayArray] = useState([...array]);
    const timeoutsRef = useRef([]);
    
    const showLabels = array.length <= 35;

    useEffect(() => {
        setDisplayArray([...array]);
        clearAllTimeouts();
    }, [array]);

    useEffect(() => {
        if (isPlaying) {
            runAlgorithm();
        } else {
            clearAllTimeouts();
        }
        return () => clearAllTimeouts();
    }, [isPlaying, algorithmName]);

    const clearAllTimeouts = () => {
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
    };

    const runAlgorithm = () => {
        clearAllTimeouts();
        let steps = [];
        const algoFunc = algorithms[`generate${algorithmName}Steps`];
        if (!algoFunc) return;
        
        // Pass searchTarget if it's a search algorithm
        if (algorithmName.includes('Search')) {
            steps = algoFunc(array, searchTarget);
        } else {
            steps = algoFunc(array);
        }
        
        animate(steps);
    };

    const animate = (steps) => {
        const delay = Math.max(1, 100 - speed);
        steps.forEach((step, index) => {
            const timeoutId = setTimeout(() => {
                setDisplayArray(prev => {
                    // Use a new array reference to trigger re-renders
                    const newArr = [...prev];
                    if (step.type === 'swap') {
                        newArr[step.indices[0]] = step.values[0];
                        newArr[step.indices[1]] = step.values[1];
                    } else if (step.type === 'overwrite') {
                        newArr[step.indices[0]] = step.value;
                    }
                    return newArr;
                });

                const bars = document.getElementsByClassName(`bar-${className}`);
                if(bars.length > 0) {
                    if (step.type === 'compare') {
                         step.indices.forEach(idx => { if(bars[idx]) bars[idx].style.backgroundColor = '#ef4444' });
                    } else if (step.type === 'swap' || step.type === 'overwrite') {
                         step.indices.forEach(idx => { if(bars[idx]) bars[idx].style.backgroundColor = '#eab308' });
                    } else if (step.type === 'sorted' || step.type === 'found') {
                         step.indices.forEach(idx => { if(bars[idx]) bars[idx].style.backgroundColor = '#10b981' });
                    } else if (step.type === 'revert') {
                        step.indices.forEach(idx => { if(bars[idx]) bars[idx].style.backgroundColor = '' }); 
                    } else if (step.type === 'discard') {
                         // Gray out discarded parts of the array for Binary Search
                         if (step.range) {
                             for(let i=step.range[0]; i<=step.range[1]; i++) {
                                 if(bars[i]) bars[i].style.opacity = '0.2';
                             }
                         }
                    }
                }

                if (index === steps.length - 1) {
                    if (onFinished) onFinished();
                }
            }, index * delay);
            timeoutsRef.current.push(timeoutId);
        });
    };

    return (
        <div className={cn("flex items-end justify-center h-64 w-full p-4 bg-slate-900/50 rounded-xl border border-slate-800 select-none", className, showLabels ? "gap-1" : "gap-[1px]")}>
            {displayArray.map((val, idx) => (
                <div key={idx} className="relative flex flex-col justify-end items-center w-full h-full group">
                    {showLabels && (
                        <span 
                            className="absolute text-[10px] font-bold text-slate-500 dark:text-slate-400 transition-all duration-75 text-center w-full pointer-events-none z-10"
                            style={{ 
                                bottom: `${(val / Math.max(...array)) * 100}%`, 
                                marginBottom: '2px',
                                textShadow: '0 1px 2px rgba(0,0,0,0.1)' 
                            }}
                        >
                            {val}
                        </span>
                    )}
                    <div
                        className={`bar-${className} w-full rounded-t-md transition-all duration-75 ease-linear hover:opacity-80`}
                        style={{
                            height: `${(val / Math.max(...array)) * 100}%`,
                            backgroundColor: 'rgba(148, 163, 184, 0.5)' 
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

export default SortingVisualizer;
