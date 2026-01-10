import { sortingAlgorithmsMeta } from "@/data/sortingAlgorithmsMeta";
const AlgorithmExplanation = ({ algorithm, darkMode }) => {
    const info = sortingAlgorithmsMeta[algorithm];
    if (!info) return null;
  
    return (
        <div
          className={`mt-4 p-4 rounded-lg border ${
            darkMode
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <h4 className="font-bold text-lg mb-2">{info.name}</h4>
          <p className="text-sm text-slate-400 mb-4">{info.description}</p>
    
          <div className="mb-4">
            <h5 className="font-semibold mb-2">How it works:</h5>
            <ol className="list-decimal list-inside text-sm space-y-1 text-slate-400">
              {info.steps?.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
    
          <div className="flex flex-wrap gap-6 text-sm">
            <span>
              <strong>Time:</strong>{" "}
              {info.time.average || info.time}
            </span>
            <span>
              <strong>Space:</strong> {info.space}
            </span>
          </div>
        </div>
      );
  };
  
  export default AlgorithmExplanation;
  