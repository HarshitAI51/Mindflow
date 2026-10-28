import { useState } from "react";
import { verifyAnswer } from "./lib/api";

export default function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    const data = await verifyAnswer(input);
    setResult(data);
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">TruthLens</h1>
      <textarea
        className="w-full p-3 bg-panel border border-border rounded"
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste an answer to verify..."
      />
      <button
        onClick={handleSubmit}
        className="mt-3 px-4 py-2 bg-accent text-black rounded font-semibold"
      >
        Verify
      </button>
      {result && (
        <pre className="mt-6 p-4 bg-panel rounded overflow-auto text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
