
// Utility functions for advanced DSA visualizations

export const generateLinkedListSteps = (currentList, operation, params) => {
    const steps = [];
    // list is array of { id, value }
    // operations: 'insert', 'delete', 'search'
    
    const newList = [...currentList];
    
    if (operation === 'insert') {
        const { value, index } = params;
        const validIndex = Math.max(0, Math.min(index, newList.length));
        const newNode = { id: Date.now(), value };

        // Step 1: Visualize finding position
        for (let i = 0; i < validIndex; i++) {
            steps.push({ type: 'highlight', index: i, message: `Traversing to index ${i}...` });
        }

        // Step 2: Insert
        newList.splice(validIndex, 0, newNode);
        steps.push({ type: 'update', list: [...newList], highlightedIndex: validIndex, message: `Inserted ${value} at index ${validIndex}` });
    } 
    else if (operation === 'delete') {
        const { index } = params;
        if (index < 0 || index >= newList.length) return [];

        for (let i = 0; i < index; i++) {
            steps.push({ type: 'highlight', index: i, message: `Traversing to index ${i}...` });
        }

        const removedVal = newList[index].value;
        newList.splice(index, 1);
        steps.push({ type: 'update', list: [...newList], message: `Deleted node with value ${removedVal}` });
    }
    
    return steps;
};

// BST Logic
export const generateBSTSteps = (root, operation, value) => {
    const steps = [];
    
    // Deep clone helper
    const clone = (node) => node ? { ...node, left: clone(node.left), right: clone(node.right) } : null;
    let newRoot = clone(root);

    if (operation === 'insert') {
        if (!newRoot) {
            newRoot = { id: Date.now(), value, x: 0, y: 0 }; // coordinates calculated in UI
            steps.push({ type: 'update', root: newRoot, activeId: newRoot.id, message: 'Tree was empty. Created root.' });
            return { steps, finalRoot: newRoot };
        }

        let curr = newRoot;
        while (true) {
            steps.push({ type: 'visit', activeId: curr.id, root: clone(newRoot), message: `Comparing ${value} with ${curr.value}` });
            
            if (value < curr.value) {
                if (!curr.left) {
                    curr.left = { id: Date.now(), value };
                    steps.push({ type: 'update', root: clone(newRoot), activeId: curr.left.id, message: `Inserted ${value} to the left of ${curr.value}` });
                    break;
                }
                curr = curr.left;
            } else {
                if (!curr.right) {
                    curr.right = { id: Date.now(), value };
                    steps.push({ type: 'update', root: clone(newRoot), activeId: curr.right.id, message: `Inserted ${value} to the right of ${curr.value}` });
                    break;
                }
                curr = curr.right;
            }
        }
    }

    return { steps, finalRoot: newRoot };
};

// Heap Logic (Max Heap)
export const generateHeapSteps = (heap, operation, value) => {
    const steps = [];
    let newHeap = [...heap];

    if (operation === 'insert') {
        newHeap.push(value);
        steps.push({ type: 'update', heap: [...newHeap], activeIdx: newHeap.length - 1, message: `Added ${value} at the end` });
        
        // Heapify Up
        let idx = newHeap.length - 1;
        while (idx > 0) {
            let parentIdx = Math.floor((idx - 1) / 2);
            steps.push({ type: 'compare', heap: [...newHeap], indices: [idx, parentIdx], message: `Comparing ${newHeap[idx]} with parent ${newHeap[parentIdx]}` });
            
            if (newHeap[idx] > newHeap[parentIdx]) {
                [newHeap[idx], newHeap[parentIdx]] = [newHeap[parentIdx], newHeap[idx]];
                steps.push({ type: 'swap', heap: [...newHeap], indices: [idx, parentIdx], message: 'Child is larger, swapping' });
                idx = parentIdx;
            } else {
                break;
            }
        }
        steps.push({ type: 'finish', heap: [...newHeap], message: 'Heap property restored' });
    }

    return steps;
};

// DP: Steps Generator
export const generateDPSteps = (type, params) => {
    const steps = [];
    
    if (type === 'LCS') {
        const { s1, s2 } = params;
        // Two Pointers Approach for "Is Subsequence" / Greedy LCS check
        // i points to s1 (text), j points to s2 (pattern)
        let i = 0;
        let j = 0;
        const matchedIndicesS1 = []; // Indices in s1 that matched
        
        steps.push({
            type: 'init',
            i: 0, j: 0, 
            matchedIndicesS1: [],
            s1, s2,
            message: 'Initialized pointers. Looking for characters of Pattern in String.'
        });

        while (i < s1.length && j < s2.length) {
            // Visualize comparison
            steps.push({
                type: 'compare',
                i, j, 
                matchedIndicesS1: [...matchedIndicesS1],
                s1, s2,
                message: `Comparing String[${i}] ('${s1[i]}') with Pattern[${j}] ('${s2[j]}').`
            });

            if (s1[i] === s2[j]) {
                // Match found
                matchedIndicesS1.push(i);
                steps.push({
                    type: 'match',
                    i, j, 
                    matchedIndicesS1: [...matchedIndicesS1],
                    s1, s2,
                    message: `Match! Found '${s2[j]}' at index ${i}. Moving both pointers.`
                });
                i++;
                j++;
            } else {
                // No match
                steps.push({
                    type: 'mismatch',
                    i, j, 
                    matchedIndicesS1: [...matchedIndicesS1],
                    s1, s2,
                    message: `Mismatch. '${s1[i]}' is not '${s2[j]}'. Moving String pointer.`
                });
                i++;
            }
        }
        
        // Final state
        steps.push({
            type: 'finish',
            i, j, 
            matchedIndicesS1: [...matchedIndicesS1],
            s1, s2,
            message: j === s2.length 
                ? `Success! Found full subsequence "${s2}".` 
                : `Finished. Found partial subsequence: "${s2.substring(0, j)}".`
        });

    } else if (type === 'Fibonacci') {
        const { n } = params;
        const memo = Array(n + 1).fill(null);
        // Iterative for visualization simplicity
        memo[0] = 0;
        memo[1] = 1;
        steps.push({ type: 'init', table: [...memo], message: 'Base cases: Fib(0)=0, Fib(1)=1' });
        
        for(let i=2; i<=n; i++) {
             steps.push({ type: 'calc', i, table: [...memo], message: `Calculating Fib(${i}) = Fib(${i-1}) + Fib(${i-2})` });
             memo[i] = memo[i-1] + memo[i-2];
             steps.push({ type: 'update', i, val: memo[i], table: [...memo], message: `Fib(${i}) = ${memo[i]}` });
        }
    }

    return steps;
};
