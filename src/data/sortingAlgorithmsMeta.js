export const sortingAlgorithmsMeta= {
    BubbleSort: {
      name: "Bubble Sort",
      description:
        "Bubble Sort repeatedly compares adjacent elements and swaps them if they are in the wrong order. Larger elements gradually move to the end of the array.",
  
      steps: [
        "Start from the first element of the array.",
        "Compare the current element with the next element.",
        "If the current element is greater, swap them.",
        "Move to the next pair and repeat.",
        "After each pass, the largest element moves to the end.",
        "Repeat until no swaps are needed."
      ],
  
      time: {
        best: "O(n)",
        average: "O(n²)",
        worst: "O(n²)"
      },
      space: "O(1)",
      stable: true
    },
  
    SelectionSort: {
      name: "Selection Sort",
      description:
        "Selection Sort selects the smallest element from the unsorted portion and places it at the beginning.",
  
      steps: [
        "Divide the array into sorted and unsorted parts.",
        "Find the smallest element in the unsorted part.",
        "Swap it with the first unsorted element.",
        "Move the boundary of the sorted part forward.",
        "Repeat until the array is sorted."
      ],
  
      time: {
        best: "O(n²)",
        average: "O(n²)",
        worst: "O(n²)"
      },
      space: "O(1)",
      stable: false
    },
  
    InsertionSort: {
      name: "Insertion Sort",
      description:
        "Insertion Sort builds the sorted array one element at a time.",
  
      steps: [
        "Assume the first element is already sorted.",
        "Pick the next element and compare it with previous elements.",
        "Shift larger elements one position to the right.",
        "Insert the element into its correct position.",
        "Repeat until the array is sorted."
      ],
  
      time: {
        best: "O(n)",
        average: "O(n²)",
        worst: "O(n²)"
      },
      space: "O(1)",
      stable: true
    },
  
    MergeSort: {
      name: "Merge Sort",
      description:
        "Merge Sort divides the array into halves, sorts them recursively, and merges the sorted halves.",
  
      steps: [
        "Divide the array into two halves.",
        "Recursively divide each half until single elements remain.",
        "Merge the smaller sorted arrays into larger sorted arrays.",
        "Repeat until the full array is merged."
      ],
  
      time: {
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n log n)"
      },
      space: "O(n)",
      stable: true
    },
  
    QuickSort: {
      name: "Quick Sort",
      description:
        "Quick Sort selects a pivot and partitions the array around it.",
  
      steps: [
        "Choose a pivot element.",
        "Partition the array so smaller elements go left and larger go right.",
        "Recursively apply the same process to subarrays.",
        "Continue until the array is sorted."
      ],
  
      time: {
        best: "O(n log n)",
        average: "O(n log n)",
        worst: "O(n²)"
      },
      space: "O(log n)",
      stable: false
    }
  };
  