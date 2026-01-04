
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { 
  Play, Pause, RotateCcw, Settings, ChevronRight, ChevronLeft, 
  LayoutGrid, List, BarChart2, Activity, Moon, Sun, 
  GitCompare, SplitSquareHorizontal, ArrowRight, Network, 
  PlusCircle, Move, MousePointer2, Trash2, StepForward, 
  StepBack, Binary, BoxSelect, Layers, Search, Github
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import * as algorithms from '@/lib/dsaAlgorithms';
import { useToast } from '@/components/ui/use-toast';

// Import new visualizers
import LinkedListVisualizer from '@/components/dsa/LinkedListVisualizer';
import TreeVisualizer from '@/components/dsa/TreeVisualizer';
import HeapVisualizer from '@/components/dsa/HeapVisualizer';
import DPVisualizer from '@/components/dsa/DPVisualizer';
import ContributorsSection from '@/components/dsa/ContributorsSection';
import GraphVisualizer from '../components/dsa/GraphVisualizer';

// --- Sorting ---

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

// --- Main Page ---

const DsaVisualization = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('sorting');
    const [algorithm, setAlgorithm] = useState('BubbleSort');
    const [secondAlgorithm, setSecondAlgorithm] = useState('QuickSort');
    const [arraySize, setArraySize] = useState(20); 
    const [speed, setSpeed] = useState(50);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isComparisonMode, setIsComparisonMode] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [customInput, setCustomInput] = useState('');
    const [searchTarget, setSearchTarget] = useState(42); // Default target
    
    const [array, setArray] = useState([]);

    useEffect(() => {
        if (activeTab === 'sorting' || activeTab === 'searching') {
            resetArray();
        }
    }, [arraySize, activeTab]);

    const resetArray = () => {
        setIsPlaying(false);
        // If binary search, we should ideally sort, but random is fine for linear.
        // To keep it simple, we generate random. 
        // If user selects BinarySearch, we might want to auto-sort or let them visualize fail/sort.
        const newArr = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 5);
        
        // If searching, ensure the target is present randomly 50% of the time for fun, or just random.
        // Let's just keep random.
        setArray(newArr);
        const bars = document.querySelectorAll('[class^="bar-"]');
        bars.forEach(bar => {
            bar.style.backgroundColor = 'rgba(148, 163, 184, 0.5)';
            bar.style.opacity = '1';
        });
    };
    
    // Auto-sort if switching to Binary Search to avoid confusion
    useEffect(() => {
        if (algorithm === 'BinarySearch') {
            setArray(prev => [...prev].sort((a,b) => a-b));
        }
    }, [algorithm]);

    const handlePlay = () => { setIsPlaying(!isPlaying); };

    const handleCustomInput = () => {
        if (!customInput) return;
        const arr = customInput.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (arr.length > 0) { setArray(arr); setArraySize(arr.length); setIsPlaying(false); }
    };

    const algoOptions = {
        sorting: ['BubbleSort', 'SelectionSort', 'InsertionSort', 'MergeSort', 'QuickSort'],
        searching: ['BinarySearch', 'LinearSearch'],
        graphs: ['BFS', 'DFS', 'Dijkstra', 'AStar'],
        linkedlist: [],
        trees: [],
        heaps: [],
        dp: []
    };

    return (
        <div className={cn("min-h-screen p-4 md:p-8 transition-colors duration-300", darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900")}>
            <Helmet>
                <title>DSA Visualization | WeCode</title>
                <meta name="description" content="Interactive Data Structures and Algorithms Visualizer" />
            </Helmet>

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2"><Activity className="text-cyan-400" /> DSA Visualizer</h1>
                        <p className="text-slate-400">Explore, Visualize, and Compare Algorithms</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
                            <Button variant={darkMode ? "default" : "ghost"} size="icon" onClick={() => setDarkMode(true)} className="h-8 w-8"><Moon className="h-4 w-4" /></Button>
                            <Button variant={!darkMode ? "default" : "ghost"} size="icon" onClick={() => setDarkMode(false)} className="h-8 w-8"><Sun className="h-4 w-4" /></Button>
                        </div>
                    </div>
                </div>

                {/* Open Source Contribution Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={cn(
                        "flex flex-col md:flex-row items-center justify-between p-4 mb-8 rounded-lg shadow-xl",
                        darkMode ? "bg-gradient-to-r from-slate-800 to-slate-700 text-white border border-slate-700" : "bg-gradient-to-r from-blue-100 to-indigo-100 text-slate-800 border border-blue-200"
                    )}
                >
                    <div className="flex items-center gap-3 text-center md:text-left mb-4 md:mb-0">
                        <Github className={cn("w-8 h-8", darkMode ? "text-cyan-400" : "text-blue-600")} />
                        <div>
                            <h2 className="text-lg font-bold">This is an Open-Source Project!</h2>
                            <p className={cn("text-sm", darkMode ? "text-slate-300" : "text-slate-700")}>
                                Anyone can contribute to improve and expand this visualizer.
                            </p>
                        </div>
                    </div>
                    <Button 
                        asChild 
                        className={cn(
                            "w-full md:w-auto px-6 py-2 rounded-md font-semibold transition-all duration-300",
                            darkMode ? "bg-cyan-500 hover:bg-cyan-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                        )}
                    >
                        <a href="https://github.com/WeCode-Community-Dev/dsa-visualizer" target="_blank" rel="noopener noreferrer">
                            <Github className="mr-2 h-4 w-4" /> Contribute on GitHub
                        </a>
                    </Button>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <Card className={cn("lg:col-span-3 border-0 shadow-lg h-fit", darkMode ? "bg-slate-900/80" : "bg-white")}>
                        <CardContent className="p-6 space-y-8">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Category</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {['sorting', 'searching', 'graphs', 'linkedlist', 'trees', 'heaps', 'dp'].map(cat => (
                                        <Button
                                            key={cat}
                                            variant={activeTab === cat ? 'default' : 'outline'}
                                            onClick={() => { 
                                                setActiveTab(cat); 
                                                setIsPlaying(false); 
                                                setIsComparisonMode(false);
                                                if(algoOptions[cat]?.length > 0) setAlgorithm(algoOptions[cat][0]);
                                            }}
                                            className="w-full text-xs capitalize"
                                        >
                                            {cat === 'dp' ? 'DP / Adv' : cat}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {(activeTab === 'sorting' || activeTab === 'searching' || activeTab === 'graphs') && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Algorithm</h3>
                                    <Select value={algorithm} onValueChange={setAlgorithm} disabled={isPlaying}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Algorithm" />
                                        </SelectTrigger>
                                        {/* Fix: Explicit text colors for dropdown items to ensure contrast */}
                                        <SelectContent className={cn(darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
                                            {algoOptions[activeTab]?.map(algo => (
                                                <SelectItem 
                                                    key={algo} 
                                                    value={algo} 
                                                    className={cn(
                                                        "cursor-pointer",
                                                        darkMode ? "text-slate-100 focus:text-white focus:bg-slate-800" : "text-slate-900 focus:text-black focus:bg-slate-100"
                                                    )}
                                                >
                                                    {algo.replace(/([A-Z])/g, ' $1').trim()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {activeTab === 'sorting' && (
                                        <div className="flex items-center justify-between pt-2">
                                            <label className="text-sm font-medium flex items-center gap-2"><GitCompare className="h-4 w-4" /> Compare</label>
                                            <Switch checked={isComparisonMode} onCheckedChange={setIsComparisonMode} disabled={isPlaying} />
                                        </div>
                                    )}
                                    {isComparisonMode && activeTab === 'sorting' && (
                                        <Select value={secondAlgorithm} onValueChange={setSecondAlgorithm} disabled={isPlaying}>
                                            <SelectTrigger className="mt-2"><SelectValue placeholder="Select 2nd Algorithm" /></SelectTrigger>
                                            <SelectContent className={cn(darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
                                                {algoOptions[activeTab]?.map(algo => (
                                                    <SelectItem 
                                                        key={algo} 
                                                        value={algo} 
                                                        className={cn(
                                                            "cursor-pointer",
                                                            darkMode ? "text-slate-100 focus:text-white focus:bg-slate-800" : "text-slate-900 focus:text-black focus:bg-slate-100"
                                                        )}
                                                    >
                                                        {algo.replace(/([A-Z])/g, ' $1').trim()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            )}

                            {(activeTab === 'sorting' || activeTab === 'searching') && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm"><span>Size</span><span className="text-slate-500">{arraySize}</span></div>
                                        <Slider value={[arraySize]} max={100} min={10} step={5} onValueChange={(val) => setArraySize(val[0])} disabled={isPlaying}/>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm"><span>Speed</span><span className="text-slate-500">{speed}%</span></div>
                                        <Slider value={[speed]} max={99} min={1} onValueChange={(val) => setSpeed(val[0])} />
                                    </div>
                                </div>
                            )}

                            {(activeTab === 'sorting' || activeTab === 'searching') && (
                                <div className="pt-4 space-y-3">
                                    <Button className={cn("w-full font-bold", isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-cyan-500 hover:bg-cyan-600")} onClick={handlePlay}>
                                        {isPlaying ? <><Pause className="mr-2 h-4 w-4"/> Pause</> : <><Play className="mr-2 h-4 w-4"/> Start</>}
                                    </Button>
                                    <Button variant="outline" className="w-full" onClick={resetArray} disabled={isPlaying}><RotateCcw className="mr-2 h-4 w-4" /> Reset / Randomize</Button>
                                </div>
                            )}
                            
                            {/* Fix: Added Search Target Input */}
                            {activeTab === 'searching' && (
                                <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <label className="text-xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-2">
                                        <Search className="w-3 h-3" /> Search Target
                                    </label>
                                    <div className="flex gap-2">
                                        <Input 
                                            type="number" 
                                            placeholder="Target Value" 
                                            value={searchTarget} 
                                            onChange={(e) => setSearchTarget(parseInt(e.target.value) || 0)} 
                                            className="h-9 text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {(activeTab === 'sorting') && (
                                <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Custom Input</label>
                                    <div className="flex gap-2">
                                        <Input placeholder="10, 5, 8, 20..." value={customInput} onChange={(e) => setCustomInput(e.target.value)} className="h-8 text-xs" />
                                        <Button size="sm" variant="secondary" className="h-8" onClick={handleCustomInput}>Go</Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="lg:col-span-9 space-y-6">
                        {activeTab === 'sorting' || activeTab === 'searching' ? (
                            <div className={cn("grid gap-6", isComparisonMode ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
                                <Card className={cn("overflow-hidden border-0 shadow-2xl", darkMode ? "bg-slate-900" : "bg-white")}>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-xl text-cyan-400">{algorithm.replace(/([A-Z])/g, ' $1').trim()}</h3>
                                            {activeTab === 'searching' && <div className="text-sm text-slate-400">Target: <span className="font-bold text-white bg-cyan-600 px-2 py-0.5 rounded">{searchTarget}</span></div>}
                                        </div>
                                        <SortingVisualizer array={array} algorithmName={algorithm} isPlaying={isPlaying} speed={speed} className="primary" searchTarget={searchTarget} />
                                    </CardContent>
                                공급                                </Card>
                                {isComparisonMode && (
                                    <Card className={cn("overflow-hidden border-0 shadow-2xl", darkMode ? "bg-slate-900" : "bg-white")}>
                                        <CardContent className="p-6">
                                             <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-xl text-purple-400">{secondAlgorithm.replace(/([A-Z])/g, ' $1').trim()}</h3>
                                            </div>
                                            <SortingVisualizer array={array} algorithmName={secondAlgorithm} isPlaying={isPlaying} speed={speed} className="secondary" searchTarget={searchTarget} />
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        ) : activeTab === 'graphs' ? (
                            <Card className={cn("overflow-hidden border-0 shadow-2xl", darkMode ? "bg-slate-900" : "bg-white")}>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-xl text-purple-400 flex items-center gap-2"><Network className="h-5 w-5" /> Graph Algorithms</h3>
                                    </div>
                                    <GraphVisualizer algorithmName={algorithm} isPlaying={isPlaying} setIsPlaying={setIsPlaying} speed={speed} onFinished={() => setIsPlaying(false)} darkMode={darkMode} />
                                </CardContent>
                            </Card>
                        ) : activeTab === 'linkedlist' ? (
                             <Card className={cn("overflow-hidden border-0 shadow-2xl", darkMode ? "bg-slate-900" : "bg-white")}>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-xl text-emerald-400 flex items-center gap-2"><List className="h-5 w-5" /> Linked List Visualizer</h3>
                                    </div>
                                    <LinkedListVisualizer darkMode={darkMode} />
                                </CardContent>
                            </Card>
                        ) : activeTab === 'trees' ? (
                            <Card className={cn("overflow-hidden border-0 shadow-2xl", darkMode ? "bg-slate-900" : "bg-white")}>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-xl text-orange-400 flex items-center gap-2"><Binary className="h-5 w-5" /> Binary Search Tree</h3>
                                    </div>
                                    <TreeVisualizer darkMode={darkMode} />
                                </CardContent>
                            </Card>
                        ) : activeTab === 'heaps' ? (
                             <Card className={cn("overflow-hidden border-0 shadow-2xl", darkMode ? "bg-slate-900" : "bg-white")}>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-xl text-yellow-400 flex items-center gap-2"><Layers className="h-5 w-5" /> Heap Visualizer (Max)</h3>
                                    </div>
                                    <HeapVisualizer darkMode={darkMode} />
                                </CardContent>
                            </Card>
                        ) : activeTab === 'dp' ? (
                             <Card className={cn("overflow-hidden border-0 shadow-2xl", darkMode ? "bg-slate-900" : "bg-white")}>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-xl text-pink-400 flex items-center gap-2"><BoxSelect className="h-5 w-5" /> Dynamic Programming</h3>
                                    </div>
                                    <DPVisualizer darkMode={darkMode} />
                                </CardContent>
                            </Card>
                        ) : (
                             <Card className={cn("h-96 flex flex-col items-center justify-center border-0 shadow-2xl text-center p-8", darkMode ? "bg-slate-900" : "bg-white")}>
                                <h3 className="text-2xl font-bold">Under Construction</h3>
                            </Card>
                        )}
                    </div>
                </div>
                <ContributorsSection darkMode={darkMode} />
            </div>
        </div>
    );
};

export default DsaVisualization;
