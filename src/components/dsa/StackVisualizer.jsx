
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDown, ArrowUp, Trash2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const StackVisualizer = ({ darkMode }) => {
    const [stack, setStack] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [message, setMessage] = useState('Stack is empty');

    const handlePush = () => {
        if (!inputValue) return;
        if (stack.length >= 10) {
            setMessage('Stack Overflow! Max size reached.');
            return;
        }
        const newVal = inputValue;
        setStack(prev => [...prev, newVal]);
        setInputValue('');
        setMessage(`Pushed ${newVal} onto the stack`);
    };

    const handlePop = () => {
        if (stack.length === 0) {
            setMessage('Stack Underflow! Stack is empty.');
            return;
        }
        const popped = stack[stack.length - 1];
        setStack(prev => prev.slice(0, -1));
        setMessage(`Popped ${popped} from the stack`);
    };

    const handlePeek = () => {
        if (stack.length === 0) {
            setMessage('Stack is empty');
        } else {
            setMessage(`Top element is ${stack[stack.length - 1]}`);
        }
    };

    const clearStack = () => {
        setStack([]);
        setMessage('Stack cleared');
    };

    return (
        <div className="space-y-6">
            <div className={cn("p-4 rounded-lg border flex flex-wrap gap-4 items-center justify-between", darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
                <div className="flex items-center gap-2">
                    <Input
                        className="w-24 h-9"
                        placeholder="Value"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePush()}
                    />
                    <Button size="sm" onClick={handlePush} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                        <ArrowDown className="w-4 h-4 mr-1" /> Push
                    </Button>
                    <Button size="sm" onClick={handlePop} variant="destructive">
                        <ArrowUp className="w-4 h-4 mr-1" /> Pop
                    </Button>
                    <Button size="sm" variant="outline" onClick={handlePeek} className="border-cyan-500 text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950">
                        <Layers className="w-4 h-4 mr-1" /> Peek
                    </Button>
                    <Button size="sm" variant="ghost" onClick={clearStack} title="Clear Stack">
                        <Trash2 className="w-4 h-4 text-slate-500" />
                    </Button>
                </div>
                <div className="text-sm font-bold text-slate-500 animate-pulse">
                    {message}
                </div>
            </div>

            <div className={cn("flex justify-center items-end h-[400px] border rounded-xl p-8 overflow-hidden relative", darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200")}>
                {/* Stack Container */}
                <div className={cn("w-32 border-b-4 border-l-4 border-r-4 rounded-b-lg flex flex-col-reverse items-center p-2 min-h-[50px] transition-colors duration-300 relative", darkMode ? "border-slate-700 bg-slate-900/50" : "border-slate-300 bg-white")}>
                    <AnimatePresence>
                        {stack.map((item, index) => (
                            <motion.div
                                key={`${index}-${item}`}
                                initial={{ opacity: 0, y: -50, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -50, scale: 0.5 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className={cn(
                                    "w-full h-10 mb-1 rounded flex items-center justify-center font-bold text-lg shadow-sm border select-none",
                                    index === stack.length - 1 ? "bg-cyan-500 text-white border-cyan-400 z-10" : (darkMode ? "bg-slate-800 text-slate-200 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-200")
                                )}
                            >
                                {item}
                                {index === stack.length - 1 && (
                                    <span className="absolute -right-12 text-xs font-mono text-cyan-500 flex items-center">
                                        ← Top
                                    </span>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {stack.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500/30 text-xs uppercase font-bold pointer-events-none">
                            Empty
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center text-xs text-slate-500">
                LIFO (Last-In, First-Out) Principle
            </div>
        </div>
    );
};

export default StackVisualizer;
