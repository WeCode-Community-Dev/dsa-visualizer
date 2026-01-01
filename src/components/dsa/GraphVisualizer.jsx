
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Move, PlusCircle, Network, Trash2, StepBack, StepForward, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as algorithms from '@/lib/dsaAlgorithms';

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

export default GraphVisualizer;
