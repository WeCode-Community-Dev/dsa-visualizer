
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

// --- Existing Sorting/Graph Components ---

const SortingVisualizer = ({ array, algorithmName, isPlaying, speed, onFinished, className, searchTarget, darkMode }) => {
    const [displayArray, setDisplayArray] = useState([...array]);
    const [description, setDescription] = useState('');
    const timeoutsRef = useRef([]);

    const showLabels = array.length <= 35;

    useEffect(() => {
        setDisplayArray([...array]);
        setDescription('');
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
        const delay = speed === 100 ? 1 : (101 - speed) * 3;
        steps.forEach((step, index) => {
            const timeoutId = setTimeout(() => {
                setDisplayArray(prev => {
                    const newArr = [...prev];
                    if (step.type === 'swap') {
                        newArr[step.indices[0]] = step.values[0];
                        newArr[step.indices[1]] = step.values[1];
                    } else if (step.type === 'overwrite') {
                        newArr[step.indices[0]] = step.value;
                    }
                    return newArr;
                });

                // Update Description
                if (step.type === 'compare') {
                    if (step.minVal !== undefined) {
                        setDescription(`Comparing ${step.values[0]} with current min ${step.minVal}`);
                    } else if (step.pivotVal !== undefined) {
                        setDescription(`Comparing ${step.values[0]} with pivot ${step.pivotVal}`);
                    } else if (step.values && step.values.length === 2) {
                        setDescription(`Comparing ${step.values[0]} and ${step.values[1]}`);
                    } else {
                        setDescription('Comparing elements...');
                    }
                } else if (step.type === 'swap') {
                    if (step.values && step.values.length === 2) {
                        setDescription(`Swapping ${step.values[0]} and ${step.values[1]}`);
                    } else {
                        setDescription('Swapping elements...');
                    }
                } else if (step.type === 'overwrite') {
                    setDescription(`Overwriting value at index ${step.indices[0]} with ${step.value}`);
                } else if (step.type === 'highlight-min') {
                    if (step.message) setDescription(step.message);
                    else if (step.val !== undefined) setDescription(`New minimum found: ${step.val}`);
                } else if (step.type === 'select') {
                    if (step.val !== undefined) setDescription(`Selected ${step.val} to insert`);
                } else if (step.type === 'sorted') {
                    setDescription('Element is sorted');
                } else if (step.type === 'found') {
                    setDescription(`Found target ${searchTarget} at index ${step.indices[0]}!`);
                }

                const bars = document.getElementsByClassName(`bar-${className}`);
                if (bars.length > 0) {
                    if (step.type === 'compare') {
                        step.indices.forEach(idx => { if (bars[idx]) bars[idx].style.backgroundColor = '#ef4444' });
                    } else if (step.type === 'swap' || step.type === 'overwrite') {
                        step.indices.forEach(idx => { if (bars[idx]) bars[idx].style.backgroundColor = '#eab308' });
                    } else if (step.type === 'sorted' || step.type === 'found') {
                        step.indices.forEach(idx => { if (bars[idx]) bars[idx].style.backgroundColor = '#10b981' });
                    } else if (step.type === 'revert') {
                        step.indices.forEach(idx => { if (bars[idx]) bars[idx].style.backgroundColor = '' });
                    } else if (step.type === 'discard') {
                        if (step.range) {
                            for (let i = step.range[0]; i <= step.range[1]; i++) {
                                if (bars[i]) bars[i].style.opacity = '0.2';
                            }
                        }
                    } else if (step.type === 'highlight-min' || step.type === 'select') {
                        step.indices.forEach(idx => { if (bars[idx]) bars[idx].style.backgroundColor = '#a855f7' }); // Purple for special highlights
                    }
                }

                if (index === steps.length - 1) {
                    if (onFinished) onFinished();
                    setDescription('Finished!');
                }
            }, index * delay);
            timeoutsRef.current.push(timeoutId);
        });
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className={cn("flex items-end justify-center h-64 w-full p-4 rounded-xl border select-none transition-colors", className, showLabels ? "gap-1" : "gap-[1px]", darkMode ? "bg-slate-900/50 border-slate-800" : "bg-slate-100 border-slate-300")}>
                {displayArray.map((val, idx) => (
                    <div key={idx} className={cn("relative flex flex-col justify-end items-center w-full h-full group rounded-t-md overflow-hidden", darkMode ? "bg-slate-800/30" : "bg-slate-200/50")}>
                        {showLabels && (
                            <span
                                className={cn("absolute text-[10px] font-bold transition-all duration-75 text-center w-full pointer-events-none z-10", darkMode ? "text-slate-400" : "text-slate-600")}
                                style={{
                                    bottom: `${(val / Math.max(...array)) * 100}%`,
                                    marginBottom: '2px',
                                    textShadow: darkMode ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                {val}
                            </span>
                        )}
                        <div
                            className={`bar-${className} w-full rounded-t-md transition-all duration-75 ease-linear hover:opacity-80`}
                            style={{
                                height: `${(val / Math.max(...array)) * 90}%`,
                                backgroundColor: darkMode ? 'rgba(148, 163, 184, 0.5)' : '#64748b'
                            }}
                        />
                    </div>
                ))}
            </div>
            <div className={cn("h-8 flex items-center justify-center text-sm font-medium transition-colors rounded-md", darkMode ? "bg-slate-900 text-slate-300" : "bg-white text-slate-600 border border-slate-200")}>
                {description || "Ready to start..."}
            </div>
        </div>
    );
};

const GraphVisualizer = ({ algorithmName, isPlaying, setIsPlaying, speed, onFinished, darkMode }) => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [isDirected, setIsDirected] = useState(false);
    const [isWeighted, setIsWeighted] = useState(false);
    const [editMode, setEditMode] = useState('move');
    const [history, setHistory] = useState([]);
    const [currentStep, setCurrentStep] = useState(-1);
    const [startNode, setStartNode] = useState(0);
    const [endNode, setEndNode] = useState(null);
    const [draggingNode, setDraggingNode] = useState(null);
    const [edgeStartNode, setEdgeStartNode] = useState(null);
    const containerRef = useRef(null);
    const animationRef = useRef(null);

    const visualState = useMemo(() => {
        const visited = new Set();
        const path = new Set();
        const dists = {};
        let activeLink = null;

        if (currentStep >= 0 && currentStep < history.length) {
            for (let i = 0; i <= currentStep; i++) {
                const step = history[i];
                if (step.type === 'visit' || step.type === 'visit-node') {
                    visited.add(step.node);
                } else if (step.type === 'path') {
                    step.path.forEach(n => path.add(n));
                } else if (step.type === 'update-dist') {
                    dists[step.node] = step.dist;
                }
                if (i === currentStep) {
                    if (step.type === 'traverse' || step.type === 'check-edge') {
                        activeLink = { from: step.from, to: step.to };
                    }
                }
            }
        }
        return { visited, path, dists, activeLink };
    }, [currentStep, history]);

    useEffect(() => { resetGraph(); }, []);

    useEffect(() => {
        if (!isPlaying && nodes.length > 0) {
            calculateAlgorithmSteps();
        }
    }, [nodes, edges, startNode, endNode, algorithmName, isDirected]);

    const calculateAlgorithmSteps = () => {
        const numNodes = Math.max(...nodes.map(n => n.id), -1) + 1;
        const adj = Array.from({ length: numNodes }, () => []);
        edges.forEach(edge => {
            if (nodes.find(n => n.id === edge.from) && nodes.find(n => n.id === edge.to)) {
                adj[edge.from].push({ to: edge.to, weight: edge.weight });
                if (!isDirected) adj[edge.to].push({ to: edge.from, weight: edge.weight });
            }
        });
        if (!nodes.find(n => n.id === startNode)) return;
        let actualEnd = endNode;
        if (endNode === null && nodes.length > 0) actualEnd = nodes[nodes.length - 1].id;

        const algoFunc = algorithms[`generate${algorithmName}Steps`];
        if (algoFunc) {
            let steps = [];
            if (algorithmName === 'AStar') {
                const nodeObjMap = nodes.reduce((acc, n) => ({ ...acc, [n.id]: n }), {});
                steps = algoFunc(numNodes, adj, startNode, actualEnd, nodeObjMap);
            } else {
                steps = algoFunc(numNodes, adj, startNode, actualEnd);
            }
            setHistory(steps);
        }
    };

    useEffect(() => {
        if (isPlaying) {
            const delay = Math.max(50, 1000 - (speed * 9));
            animationRef.current = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev < history.length - 1) return prev + 1;
                    setIsPlaying(false);
                    if (onFinished) onFinished();
                    return prev;
                });
            }, delay);
        } else {
            clearInterval(animationRef.current);
        }
        return () => clearInterval(animationRef.current);
    }, [isPlaying, history.length, speed]);

    const resetGraph = () => {
        setIsPlaying(false);
        setCurrentStep(-1);
        const width = containerRef.current ? containerRef.current.clientWidth : 800;
        const height = 400;
        const numNodes = 10;
        const newNodes = [];
        for (let i = 0; i < numNodes; i++) newNodes.push({ id: i, x: Math.random() * (width - 100) + 50, y: Math.random() * (height - 100) + 50 });
        const newEdges = [];
        for (let i = 1; i < numNodes; i++) {
            const target = Math.floor(Math.random() * i);
            const weight = Math.floor(Math.random() * 20) + 1;
            newEdges.push({ from: i, to: target, weight });
        }
        for (let i = 0; i < numNodes / 2; i++) {
            const u = Math.floor(Math.random() * numNodes);
            const v = Math.floor(Math.random() * numNodes);
            if (u !== v && !newEdges.find(e => (e.from === u && e.to === v) || (e.from === v && e.to === u))) {
                newEdges.push({ from: u, to: v, weight: Math.floor(Math.random() * 20) + 1 });
            }
        }
        setNodes(newNodes);
        setEdges(newEdges);
        setStartNode(0);
        setEndNode(numNodes - 1);
    };

    const handleMouseDown = (e, nodeId) => {
        if (isPlaying) return;
        e.stopPropagation();
        if (editMode === 'move' && nodeId !== undefined) setDraggingNode(nodeId);
        else if (editMode === 'add-edge' && nodeId !== undefined) {
            if (edgeStartNode === null) setEdgeStartNode(nodeId);
            else {
                if (edgeStartNode !== nodeId) {
                    const weight = isWeighted ? Math.floor(Math.random() * 20) + 1 : 1;
                    const exists = edges.some(edge => (edge.from === edgeStartNode && edge.to === nodeId) || (!isDirected && edge.from === nodeId && edge.to === edgeStartNode));
                    if (!exists) setEdges(prev => [...prev, { from: edgeStartNode, to: nodeId, weight }]);
                }
                setEdgeStartNode(null);
            }
        } else if (editMode === 'delete' && nodeId !== undefined) {
            setNodes(prev => prev.filter(n => n.id !== nodeId));
            setEdges(prev => prev.filter(e => e.from !== nodeId && e.to !== nodeId));
            if (startNode === nodeId) setStartNode(nodes.length > 0 ? nodes[0].id : null);
        }
    };

    const handleCanvasClick = (e) => {
        if (isPlaying) return;
        if (editMode === 'add-node') {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const newId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 0;
            setNodes(prev => [...prev, { id: newId, x, y }]);
        }
    };

    const handleMouseMove = (e) => {
        if (draggingNode === null || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setNodes(prev => prev.map(n => n.id === draggingNode ? { ...n, x, y } : n));
    };

    const handleMouseUp = () => setDraggingNode(null);

    const handleNodeContext = (e, nodeId) => {
        e.preventDefault();
        if (editMode === 'move') { setStartNode(nodeId); setCurrentStep(-1); }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className={cn("flex flex-wrap gap-4 p-4 rounded-lg border", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
                {/* Graph Toolbar Buttons: Added explicit colors for visibility */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-md">
                    <Button
                        size="sm" variant={editMode === 'move' ? "default" : "ghost"}
                        className={cn(editMode !== 'move' && "text-slate-700 dark:text-slate-200")}
                        onClick={() => setEditMode('move')} title="Move Nodes"
                    >
                        <Move className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm" variant={editMode === 'add-node' ? "default" : "ghost"}
                        className={cn(editMode !== 'add-node' && "text-slate-700 dark:text-slate-200")}
                        onClick={() => setEditMode('add-node')} title="Add Node"
                    >
                        <PlusCircle className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm" variant={editMode === 'add-edge' ? "default" : "ghost"}
                        className={cn(editMode !== 'add-edge' && "text-slate-700 dark:text-slate-200")}
                        onClick={() => setEditMode('add-edge')} title="Add Edge"
                    >
                        <Network className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm" variant={editMode === 'delete' ? "destructive" : "ghost"}
                        className={cn(editMode !== 'delete' && "text-slate-700 dark:text-slate-200")}
                        onClick={() => setEditMode('delete')} title="Delete Node"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1" />
                <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2"><Switch checked={isDirected} onCheckedChange={setIsDirected} id="directed-mode" /><label htmlFor="directed-mode">Directed</label></div>
                    <div className="flex items-center gap-2"><Switch checked={isWeighted} onCheckedChange={setIsWeighted} id="weighted-mode" /><label htmlFor="weighted-mode">Weighted</label></div>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1 ml-auto" />
                <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" disabled={currentStep <= -1} onClick={() => { setIsPlaying(false); setCurrentStep(prev => Math.max(-1, prev - 1)); }}><StepBack className="h-4 w-4" /></Button>
                    <Button size="icon" variant={isPlaying ? "destructive" : "default"} onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
                    <Button size="icon" variant="outline" disabled={currentStep >= history.length - 1} onClick={() => { setIsPlaying(false); setCurrentStep(prev => Math.min(history.length - 1, prev + 1)); }}><StepForward className="h-4 w-4" /></Button>
                </div>
            </div>

            <div ref={containerRef} className={cn("relative w-full h-[450px] border rounded-xl overflow-hidden select-none", darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200", editMode === 'add-node' && "cursor-crosshair")} onClick={handleCanvasClick} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur text-white text-xs px-3 py-2 rounded-lg space-y-1">
                        <p><span className="text-emerald-400 font-bold">Start:</span> {startNode}</p>
                        <p><span className="text-red-400 font-bold">End:</span> {endNode ?? 'Last'}</p>
                        <p className="opacity-80">{editMode === 'move' ? "Drag nodes. Right-click to set Start." : "Click to edit."}</p>
                    </div>
                </div>
                <svg width="0" height="0"><defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill={darkMode ? "#64748b" : "#94a3b8"} /></marker><marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#eab308" /></marker></defs></svg>
                <svg width="100%" height="100%" className="pointer-events-none">
                    {edges.map((edge, idx) => {
                        const start = nodes.find(n => n.id === edge.from);
                        const end = nodes.find(n => n.id === edge.to);
                        if (!start || !end) return null;
                        const isActive = visualState.activeLink && ((visualState.activeLink.from === edge.from && visualState.activeLink.to === edge.to) || (!isDirected && visualState.activeLink.from === edge.to && visualState.activeLink.to === edge.from));
                        return (<g key={`edge-${idx}`}><line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={isActive ? '#eab308' : (darkMode ? '#334155' : '#cbd5e1')} strokeWidth={isActive ? 3 : 2} markerEnd={isDirected ? (isActive ? "url(#arrowhead-active)" : "url(#arrowhead)") : undefined} className="transition-colors duration-200" />{isWeighted && (<g transform={`translate(${(start.x + end.x) / 2}, ${(start.y + end.y) / 2})`}><rect x="-8" y="-8" width="16" height="16" rx="4" fill={darkMode ? "#0f172a" : "#ffffff"} /><text dy="4" textAnchor="middle" fill={darkMode ? '#94a3b8' : '#475569'} fontSize="10" fontWeight="bold">{edge.weight}</text></g>)}</g>);
                    })}
                    {editMode === 'add-edge' && edgeStartNode !== null && (() => { const start = nodes.find(n => n.id === edgeStartNode); if (start) return <circle cx={start.x} cy={start.y} r={22} fill="none" stroke="#eab308" strokeWidth="2" strokeDasharray="4 4" className="animate-spin-slow" />; return null; })()}
                    {nodes.map((node) => {
                        const isStart = node.id === startNode;
                        const isEnd = node.id === endNode;
                        const isVisited = visualState.visited.has(node.id);
                        const isPath = visualState.path.has(node.id);
                        const dist = visualState.dists[node.id];
                        return (<g key={node.id} transform={`translate(${node.x},${node.y})`} className="pointer-events-auto cursor-pointer transition-transform duration-200 hover:scale-110" onMouseDown={(e) => handleMouseDown(e, node.id)} onClick={() => editMode === 'move' && setEndNode(node.id)} onContextMenu={(e) => handleNodeContext(e, node.id)}><circle r={18} fill={isStart ? '#10b981' : isEnd ? '#ef4444' : isPath ? '#8b5cf6' : isVisited ? '#3b82f6' : (darkMode ? '#1e293b' : '#ffffff')} stroke={isStart || isEnd || isPath || isVisited ? 'white' : (darkMode ? '#475569' : '#94a3b8')} strokeWidth={2} className="transition-colors duration-300" /><text dy=".3em" textAnchor="middle" fill={isStart || isEnd || isPath || isVisited ? 'white' : (darkMode ? '#e2e8f0' : '#1e293b')} fontSize="12" fontWeight="bold" className="pointer-events-none">{node.id}</text>{(algorithmName === 'Dijkstra' || algorithmName === 'AStar') && dist !== undefined && (<text dy="-1.8em" textAnchor="middle" fill={darkMode ? '#cbd5e1' : '#475569'} fontSize="10" className="font-mono">{dist === Infinity ? '∞' : dist}</text>)}</g>);
                    })}
                </svg>
            </div>
        </div>
    );
};

// --- Main Page ---

const DsaVisualization = () => {
    const { toast } = useToast();
    const [sortingAlgorithms, setSortingAlgorithms] = useState(['BubbleSort']);
    const [finishedCount, setFinishedCount] = useState(0);

    // Keep legacy state for non-sorting tabs
    const [algorithm, setAlgorithm] = useState('BFS');

    const [activeTab, setActiveTab] = useState('sorting');
    const [arraySize, setArraySize] = useState(20);
    const [speed, setSpeed] = useState(50);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isComparisonMode, setIsComparisonMode] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [customInput, setCustomInput] = useState('');
    const [searchTarget, setSearchTarget] = useState(42);
    const [array, setArray] = useState([]);

    // Independent effect for sortingAlgorithms initialization if needed, 
    // but we initialized it with default ['BubbleSort'].

    // Helper for algo options (moved inside or kept outside if static, assuming it was static or defined inside)
    const algoOptions = {
        sorting: ['BubbleSort', 'SelectionSort', 'InsertionSort', 'MergeSort', 'QuickSort'],
        searching: ['BinarySearch', 'LinearSearch'],
        graphs: ['BFS', 'DFS', 'Dijkstra', 'AStar'],
        linkedlist: [],
        trees: [],
        heaps: [],
        dp: []
    };

    const resetArray = () => {
        setIsPlaying(false);
        setFinishedCount(0);
        const newArr = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 5);
        setArray(newArr);

        // Reset bar styles
        const bars = document.querySelectorAll('[class^="bar-"]');
        bars.forEach(bar => {
            bar.style.backgroundColor = darkMode ? 'rgba(148, 163, 184, 0.5)' : '#64748b';
            bar.style.opacity = '1';
        });
    };

    const handlePlay = () => { setIsPlaying(!isPlaying); };

    const handleCustomInput = () => {
        if (!customInput) return;
        const arr = customInput.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (arr.length > 0) { setArray(arr); setArraySize(arr.length); setIsPlaying(false); }
    };

    // Auto-sort for BinarySearch logic (if applicable for single algo viewing)
    useEffect(() => {
        if (activeTab === 'searching' && algorithm === 'BinarySearch') {
            setArray(prev => [...prev].sort((a, b) => a - b));
        }
    }, [algorithm, activeTab]);


    useEffect(() => {
        if (activeTab === 'sorting' || activeTab === 'searching') {
            resetArray();
        }
    }, [arraySize, activeTab]);

    // Cleanup finishedCount when playing starts or specific changes happen
    useEffect(() => {
        if (isPlaying) {
            setFinishedCount(0);
        }
    }, [isPlaying]);

    // Check if all algorithms finished
    useEffect(() => {
        if (activeTab === 'sorting' && isPlaying && finishedCount >= sortingAlgorithms.length && sortingAlgorithms.length > 0) {
            setIsPlaying(false);
        }
    }, [finishedCount, sortingAlgorithms.length, isPlaying, activeTab]);

    const handleAlgorithmFinished = () => {
        setFinishedCount(prev => prev + 1);
    }

    const addAlgorithm = () => {
        if (sortingAlgorithms.length < 6) {
            setSortingAlgorithms([...sortingAlgorithms, 'BubbleSort']);
        }
    };

    const removeAlgorithm = (index) => {
        if (sortingAlgorithms.length > 1) {
            const newAlgos = [...sortingAlgorithms];
            newAlgos.splice(index, 1);
            setSortingAlgorithms(newAlgos);
        }
    };

    const updateAlgorithm = (index, value) => {
        const newAlgos = [...sortingAlgorithms];
        newAlgos[index] = value;
        setSortingAlgorithms(newAlgos);
    };

    // ...

    // Inside SortingVisualizer (Update style height logic)
    // style={{ height: `${(val / Math.max(...array)) * 90}%`, ... }}

    // ... Selection Options Logic ...
    // If activeTab === 'sorting', render list of selects

    // ... Grid Logic ...
    // sortingAlgorithms.map(...)

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
                                                if (algoOptions[cat]?.length > 0) setAlgorithm(algoOptions[cat][0]);
                                            }}
                                            className="w-full text-xs capitalize"
                                        >
                                            {cat === 'dp' ? 'DP / Adv' : cat}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            {/* Sidebar */}
                            {
                                (activeTab === 'sorting') && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Algorithms</h3>
                                        <div className="space-y-3">
                                            {sortingAlgorithms.map((algo, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <Select value={algo} onValueChange={(val) => updateAlgorithm(index, val)} disabled={isPlaying}>
                                                        <SelectTrigger className="flex-1">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className={cn(darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
                                                            {algoOptions.sorting.map(opt => (
                                                                <SelectItem key={opt} value={opt} className={cn("cursor-pointer", darkMode ? "text-slate-100 focus:text-white focus:bg-slate-800" : "text-slate-900 focus:text-black focus:bg-slate-100")}>
                                                                    {opt.replace(/([A-Z])/g, ' $1').trim()}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {sortingAlgorithms.length > 1 && (
                                                        <Button variant="ghost" size="icon" onClick={() => removeAlgorithm(index)} disabled={isPlaying} className="text-slate-400 hover:text-red-500">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            {sortingAlgorithms.length < 6 && (
                                                <Button variant="outline" size="sm" onClick={addAlgorithm} disabled={isPlaying} className="w-full border-dashed text-slate-500 hover:text-cyan-500 hover:border-cyan-500">
                                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Algorithm
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            }

                            {
                                (activeTab === 'searching' || activeTab === 'graphs') && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Algorithm</h3>
                                        <Select value={algorithm} onValueChange={setAlgorithm} disabled={isPlaying}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Algorithm" />
                                            </SelectTrigger>
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
                                    </div>
                                )
                            }

                            {(activeTab === 'sorting' || activeTab === 'searching') && (
                                <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <div className="space-y-2">
                                        <div className={cn("flex justify-between text-sm", darkMode ? "text-slate-300" : "text-slate-700")}><span>Size</span><span className="text-slate-500">{arraySize}</span></div>
                                        <Slider value={[arraySize]} max={100} min={10} step={5} onValueChange={(val) => setArraySize(val[0])} disabled={isPlaying} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className={cn("flex justify-between text-sm", darkMode ? "text-slate-300" : "text-slate-700")}><span>Speed</span><span className="text-slate-500">{speed}%</span></div>
                                        <Slider value={[speed]} max={99} min={1} onValueChange={(val) => setSpeed(val[0])} />
                                    </div>
                                </div>
                            )}

                            {(activeTab === 'sorting' || activeTab === 'searching') && (
                                <div className="pt-4 space-y-3">
                                    <Button className={cn("w-full font-bold", isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-cyan-500 hover:bg-cyan-600")} onClick={handlePlay}>
                                        {isPlaying ? <><Pause className="mr-2 h-4 w-4" /> Pause</> : <><Play className="mr-2 h-4 w-4" /> Start</>}
                                    </Button>
                                    <Button variant="outline" className="w-full" onClick={resetArray} disabled={isPlaying}><RotateCcw className="mr-2 h-4 w-4" /> Reset / Randomize</Button>
                                </div>
                            )}

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
                        {
                            activeTab === 'sorting' ? (
                                <div className={cn("grid gap-6", sortingAlgorithms.length === 1 ? "grid-cols-1" : sortingAlgorithms.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3")}>
                                    {sortingAlgorithms.map((algo, index) => (
                                        <Card key={`${algo}-${index}`} className={cn("overflow-hidden border-0 shadow-2xl", darkMode ? "bg-slate-900" : "bg-white")}>
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className={cn("font-bold text-xl", index === 0 ? "text-cyan-400" : index === 1 ? "text-purple-400" : index === 2 ? "text-emerald-400" : "text-orange-400")}>
                                                        {algo.replace(/([A-Z])/g, ' $1').trim()}
                                                    </h3>
                                                </div>
                                                <SortingVisualizer
                                                    array={array}
                                                    algorithmName={algo}
                                                    isPlaying={isPlaying}
                                                    speed={speed}
                                                    className={`sort-${index}`}
                                                    onFinished={handleAlgorithmFinished}
                                                    darkMode={darkMode}
                                                />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : activeTab === 'searching' ? (
                                // Searching View
                                // Use 'algorithm' state instead of 'sortingAlgorithms[0]'
                                <div className="grid grid-cols-1">
                                    <Card className={cn("overflow-hidden border-0 shadow-2xl", darkMode ? "bg-slate-900" : "bg-white")}>
                                        <CardContent className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-xl text-cyan-400">{algorithm.replace(/([A-Z])/g, ' $1').trim()}</h3>
                                                <div className="text-sm text-slate-400">Target: <span className="font-bold text-white bg-cyan-600 px-2 py-0.5 rounded">{searchTarget}</span></div>
                                            </div>
                                            <SortingVisualizer array={array} algorithmName={algorithm} isPlaying={isPlaying} speed={speed} className="primary" searchTarget={searchTarget} onFinished={() => setIsPlaying(false)} darkMode={darkMode} />
                                        </CardContent>
                                    </Card>
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
                            )
                        }
                    </div >
                </div >
                <ContributorsSection darkMode={darkMode} />
            </div >
        </div >
    );
};

export default DsaVisualization;
