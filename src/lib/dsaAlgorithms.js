
// Helper to swap elements
const swap = (arr, i, j) => {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
};

// --- Sorting Algorithms ---

export const generateBubbleSortSteps = (array) => {
  const steps = [];
  const arr = [...array];
  const n = arr.length;
  let swapped;

  for (let i = 0; i < n - 1; i++) {
    swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      // Compare
      steps.push({ type: 'compare', indices: [j, j + 1] });
      if (arr[j] > arr[j + 1]) {
        // Swap
        steps.push({ type: 'swap', indices: [j, j + 1], values: [arr[j + 1], arr[j]] });
        swap(arr, j, j + 1);
        swapped = true;
      }
      // Revert color (implied by next step or timeout)
      steps.push({ type: 'revert', indices: [j, j + 1] });
    }
    // Mark as sorted
    steps.push({ type: 'sorted', indices: [n - i - 1] });
    if (!swapped) {
        // Mark remaining as sorted
        for(let k=0; k < n-i-1; k++) {
             steps.push({ type: 'sorted', indices: [k] });
        }
        break;
    }
  }
  steps.push({ type: 'sorted', indices: [0] }); // First element is sorted
  return steps;
};

export const generateSelectionSortSteps = (array) => {
  const steps = [];
  const arr = [...array];
  const n = arr.length;

  for (let i = 0; i < n; i++) {
    let minIdx = i;
    steps.push({ type: 'select', indices: [i] }); // Highlight current position

    for (let j = i + 1; j < n; j++) {
      steps.push({ type: 'compare', indices: [j, minIdx] });
      if (arr[j] < arr[minIdx]) {
        steps.push({ type: 'revert', indices: [minIdx] }); // Unmark old min
        minIdx = j;
        steps.push({ type: 'highlight-min', indices: [minIdx] }); // Mark new min
      } else {
        steps.push({ type: 'revert', indices: [j] });
      }
    }

    if (minIdx !== i) {
      steps.push({ type: 'swap', indices: [i, minIdx], values: [arr[minIdx], arr[i]] });
      swap(arr, i, minIdx);
    }
    steps.push({ type: 'revert', indices: [minIdx] });
    steps.push({ type: 'sorted', indices: [i] });
  }
  return steps;
};

export const generateInsertionSortSteps = (array) => {
  const steps = [];
  const arr = [...array];
  const n = arr.length;

  steps.push({ type: 'sorted', indices: [0] });

  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    steps.push({ type: 'select', indices: [i] }); // Current element to insert

    while (j >= 0 && arr[j] > key) {
      steps.push({ type: 'compare', indices: [j, j + 1] });
      steps.push({ type: 'overwrite', indices: [j + 1], value: arr[j] }); // Shift
      arr[j + 1] = arr[j];
      steps.push({ type: 'revert', indices: [j, j+1] });
      j = j - 1;
    }
    steps.push({ type: 'overwrite', indices: [j + 1], value: key }); // Insert
    arr[j + 1] = key;
    
    // Mark all up to i as sorted (conceptually)
    for(let k=0; k<=i; k++) steps.push({ type: 'sorted', indices: [k] });
  }
  return steps;
};

export const generateMergeSortSteps = (array) => {
  const steps = [];
  const arr = [...array];
  if (arr.length <= 1) return steps;

  const aux = [...arr];
  mergeSortHelper(arr, 0, arr.length - 1, aux, steps);
  return steps;
};

function mergeSortHelper(mainArray, startIdx, endIdx, auxArray, steps) {
  if (startIdx === endIdx) return;
  const middleIdx = Math.floor((startIdx + endIdx) / 2);
  mergeSortHelper(auxArray, startIdx, middleIdx, mainArray, steps);
  mergeSortHelper(auxArray, middleIdx + 1, endIdx, mainArray, steps);
  doMerge(mainArray, startIdx, middleIdx, endIdx, auxArray, steps);
}

function doMerge(mainArray, startIdx, middleIdx, endIdx, auxArray, steps) {
  let k = startIdx;
  let i = startIdx;
  let j = middleIdx + 1;

  while (i <= middleIdx && j <= endIdx) {
    steps.push({ type: 'compare', indices: [i, j] });
    if (auxArray[i] <= auxArray[j]) {
      steps.push({ type: 'overwrite', indices: [k], value: auxArray[i] });
      mainArray[k++] = auxArray[i++];
    } else {
      steps.push({ type: 'overwrite', indices: [k], value: auxArray[j] });
      mainArray[k++] = auxArray[j++];
    }
    steps.push({ type: 'revert', indices: [i-1, j-1] }); // Rough revert for visualization
    steps.push({ type: 'sorted', indices: [k-1] }); // Mark placed items as sorted (temporarily)
  }
  while (i <= middleIdx) {
    steps.push({ type: 'overwrite', indices: [k], value: auxArray[i] });
    mainArray[k++] = auxArray[i++];
    steps.push({ type: 'sorted', indices: [k-1] });
  }
  while (j <= endIdx) {
    steps.push({ type: 'overwrite', indices: [k], value: auxArray[j] });
    mainArray[k++] = auxArray[j++];
    steps.push({ type: 'sorted', indices: [k-1] });
  }
}

export const generateQuickSortSteps = (array) => {
  const steps = [];
  const arr = [...array];
  quickSortHelper(arr, 0, arr.length - 1, steps);
  return steps;
};

function quickSortHelper(arr, low, high, steps) {
  if (low < high) {
    let pi = partition(arr, low, high, steps);
    // Mark pivot as sorted
    steps.push({ type: 'sorted', indices: [pi] });
    quickSortHelper(arr, low, pi - 1, steps);
    quickSortHelper(arr, pi + 1, high, steps);
  } else if (low === high) {
      steps.push({ type: 'sorted', indices: [low] });
  }
}

function partition(arr, low, high, steps) {
  let pivot = arr[high];
  steps.push({ type: 'highlight-min', indices: [high] }); // Highlight pivot
  let i = (low - 1);

  for (let j = low; j <= high - 1; j++) {
    steps.push({ type: 'compare', indices: [j, high] });
    if (arr[j] < pivot) {
      i++;
      steps.push({ type: 'swap', indices: [i, j], values: [arr[j], arr[i]] });
      swap(arr, i, j);
      steps.push({ type: 'revert', indices: [i, j] });
    } else {
        steps.push({ type: 'revert', indices: [j] });
    }
  }
  steps.push({ type: 'swap', indices: [i + 1, high], values: [arr[high], arr[i + 1]] });
  swap(arr, i + 1, high);
  steps.push({ type: 'revert', indices: [high] }); // Unhighlight old pivot pos
  return (i + 1);
}

export const generateShellSortSteps = (array) => {
  const steps = [];
  const arr = [...array];
  const n = arr.length;

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {

    for (let i = gap; i < n; i++) {
      let temp = arr[i];
      let j = i;

      steps.push({ type: 'select', indices: [i] }); 
      while (j >= gap) {
        steps.push({ type: 'compare', indices: [j, j - gap] });
        
        if (arr[j - gap] > temp) {
      
          steps.push({ 
            type: 'overwrite', 
            indices: [j], 
            value: arr[j - gap] 
          });
          arr[j] = arr[j - gap];
          
          steps.push({ type: 'revert', indices: [j, j - gap] });
          j -= gap;
        } else {
          steps.push({ type: 'revert', indices: [j, j - gap] });
          break;
        }
      }
      steps.push({ type: 'overwrite', indices: [j], value: temp });
      arr[j] = temp;
    }
  }

  // Final pass to mark everything as sorted
  for (let k = 0; k < n; k++) {
    steps.push({ type: 'sorted', indices: [k] });
  }

  return steps;
};

// --- Searching Algorithms ---

export const generateLinearSearchSteps = (array, target) => {
    const steps = [];
    for (let i = 0; i < array.length; i++) {
        steps.push({ type: 'compare', indices: [i] });
        if (array[i] === target) {
            steps.push({ type: 'found', indices: [i] });
            return steps;
        }
        steps.push({ type: 'visited', indices: [i] });
    }
    return steps;
}

export const generateBinarySearchSteps = (array, target) => {
    // Expects sorted array, but for visualization we might run it on unsorted to show failure or sort first.
    // We will assume the UI sorts it or provides sorted data for BS.
    const steps = [];
    let left = 0;
    let right = array.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        steps.push({ type: 'compare', indices: [mid], range: [left, right] }); // Highlight mid and range

        if (array[mid] === target) {
            steps.push({ type: 'found', indices: [mid] });
            return steps;
        }
        
        if (array[mid] < target) {
            steps.push({ type: 'discard', indices: [], range: [left, mid] }); // Grey out left half
            left = mid + 1;
        } else {
            steps.push({ type: 'discard', indices: [], range: [mid, right] }); // Grey out right half
            right = mid - 1;
        }
    }
    return steps;
}

// --- Graph Algorithms ---

// Helper to get Euclidean distance for A* heuristic
const getDist = (nodeA, nodeB) => {
    return Math.sqrt(Math.pow(nodeA.x - nodeB.x, 2) + Math.pow(nodeA.y - nodeB.y, 2));
};

export const generateBFSSteps = (numNodes, adj, startNode, endNode) => {
    const steps = [];
    const visited = new Array(numNodes).fill(false);
    const queue = [startNode];
    visited[startNode] = true;
    const prev = new Array(numNodes).fill(null);
    
    steps.push({ type: 'visit', node: startNode });

    while(queue.length > 0) {
        const u = queue.shift();
        if (u === endNode) break;

        for(let edge of adj[u]) {
            const v = edge.to;
            if(!visited[v]) {
                visited[v] = true;
                prev[v] = u;
                steps.push({ type: 'traverse', from: u, to: v });
                steps.push({ type: 'visit', node: v });
                queue.push(v);
                if (v === endNode) break;
            }
        }
    }

    // Reconstruct path
    if (visited[endNode]) {
        const path = [];
        let curr = endNode;
        while(curr !== null) {
            path.unshift(curr);
            curr = prev[curr];
        }
        steps.push({ type: 'path', path });
    }

    return steps;
};

export const generateDFSSteps = (numNodes, adj, startNode, endNode) => {
    const steps = [];
    const visited = new Array(numNodes).fill(false);
    const prev = new Array(numNodes).fill(null);
    
    const dfs = (u) => {
        visited[u] = true;
        steps.push({ type: 'visit', node: u });
        
        if (u === endNode) return true;

        for(let edge of adj[u]) {
            const v = edge.to;
            if(!visited[v]) {
                prev[v] = u;
                steps.push({ type: 'traverse', from: u, to: v });
                if (dfs(v)) return true;
            }
        }
        return false;
    };

    dfs(startNode);

    // Reconstruct path
    if (visited[endNode]) {
        const path = [];
        let curr = endNode;
        while(curr !== null) {
            path.unshift(curr);
            curr = prev[curr];
        }
        steps.push({ type: 'path', path });
    }
    return steps;
};

export const generateDijkstraSteps = (numNodes, adj, startNode, endNode) => {
    const steps = [];
    const dist = new Array(numNodes).fill(Infinity);
    const prev = new Array(numNodes).fill(null);
    const visited = new Array(numNodes).fill(false);
    
    dist[startNode] = 0;
    // Using array as priority queue for simplicity in visualization
    const pq = [{ node: startNode, dist: 0 }];

    steps.push({ type: 'update-dist', node: startNode, dist: 0 });

    while (pq.length > 0) {
        pq.sort((a, b) => a.dist - b.dist);
        const { node: u } = pq.shift();

        if (visited[u]) continue;
        visited[u] = true;
        steps.push({ type: 'visit', node: u });

        if (u === endNode) break;

        for (let edge of adj[u]) {
            const v = edge.to;
            const weight = edge.weight;
            if (!visited[v]) {
                steps.push({ type: 'check-edge', from: u, to: v });
                const alt = dist[u] + weight;
                if (alt < dist[v]) {
                    dist[v] = alt;
                    prev[v] = u;
                    pq.push({ node: v, dist: alt });
                    steps.push({ type: 'update-dist', node: v, dist: alt });
                }
            }
        }
    }
    
    // Path reconstruction
    if (dist[endNode] !== Infinity) {
        const path = [];
        let curr = endNode;
        while (curr !== null) {
            path.unshift(curr);
            curr = prev[curr];
        }
        steps.push({ type: 'path', path });
    }
  
    return steps;
};

export const generateAStarSteps = (numNodes, adj, startNode, endNode, nodes) => {
    const steps = [];
    const gScore = new Array(numNodes).fill(Infinity);
    const fScore = new Array(numNodes).fill(Infinity);
    const prev = new Array(numNodes).fill(null);
    const visited = new Array(numNodes).fill(false);
    
    gScore[startNode] = 0;
    fScore[startNode] = getDist(nodes[startNode], nodes[endNode]);
    
    const pq = [{ node: startNode, f: fScore[startNode] }];

    steps.push({ type: 'update-dist', node: startNode, dist: 0 }); // Visually similar to dist update

    while (pq.length > 0) {
        pq.sort((a, b) => a.f - b.f);
        const { node: u } = pq.shift();

        if (visited[u]) continue;
        visited[u] = true;
        steps.push({ type: 'visit', node: u });

        if (u === endNode) break;

        for (let edge of adj[u]) {
            const v = edge.to;
            const weight = edge.weight;
            
            // A* specific: neighbor check
            steps.push({ type: 'check-edge', from: u, to: v });
            
            const tentativeG = gScore[u] + weight;
            if (tentativeG < gScore[v]) {
                prev[v] = u;
                gScore[v] = tentativeG;
                fScore[v] = gScore[v] + getDist(nodes[v], nodes[endNode]); // h(n) = euclidean
                
                // Update visual dist (show gScore)
                steps.push({ type: 'update-dist', node: v, dist: Math.round(tentativeG) });
                
                // Add to open set if not present (or re-add, simplified)
                pq.push({ node: v, f: fScore[v] });
            }
        }
    }

    if (gScore[endNode] !== Infinity) {
        const path = [];
        let curr = endNode;
        while (curr !== null) {
            path.unshift(curr);
            curr = prev[curr];
        }
        steps.push({ type: 'path', path });
    }

    return steps;
}
