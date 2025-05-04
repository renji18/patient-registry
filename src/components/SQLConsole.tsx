import {FormEvent, useEffect, useState} from 'react';
import {BROADCAST_CHANNEL, BROADCAST_UPDATE_MESSAGE, runQuery} from "../utils/dbUtil.ts";

const FETCH_QUERY = 'SELECT * FROM patients;'

export default function SQLConsole() {
  const [query, setQuery] = useState(FETCH_QUERY);
  const [results, setResults] = useState<never[] | null>([]);

  const handleQuery = async (e: FormEvent) => {
    e.preventDefault();
    const res = await runQuery(query);
    setResults(res);
  };

  useEffect(() => {
    const runFirstQuery = async () => {
      const res = await runQuery(FETCH_QUERY);
      setResults(res);
    }
    runFirstQuery();
  }, [])

  useEffect(() => {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL);

    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === BROADCAST_UPDATE_MESSAGE) {
        const res = await runQuery(FETCH_QUERY);
        setResults(res);
      }
    };

    channel.addEventListener('message', handleMessage);
    return () => channel.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="w-full max-w-4xl p-4 bg-white shadow rounded space-y-4">
      <h2 className="text-xl font-semibold">SQL Query Console</h2>

      <form onSubmit={handleQuery} className="space-y-2">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={4}
          className="w-full p-2 border rounded font-mono"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Run Query
        </button>
      </form>


      {Array.isArray(results) && results.length > 0 && (
        <div className="overflow-auto">
          <table className="min-w-full table-auto border border-gray-300 mt-4">
            <thead className="bg-gray-100">
            <tr>
              {Object.keys(results[0]).map((col) => (
                <th key={col} className="border px-3 py-1 text-left font-medium">{col}</th>
              ))}
            </tr>
            </thead>
            <tbody>
            {results.map((row, i) => (
              <tr key={i} className="even:bg-gray-50">
                {Object.values(row).map((val, j) => (
                  <td key={j} className="border px-3 py-1">{val as string}</td>
                ))}
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}