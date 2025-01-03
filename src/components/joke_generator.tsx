"use client";
import { useState } from "react";

export default function JokeGenerator() {
  const [inputValue, setInputValue] = useState("");
  const [jokeType, setJokeType] = useState("苏联笑话"); // New state for joke type
  const [result, setResult] = useState("");
  const [englishResult, setEnglishResult] = useState("");
  const [chineseResult, setChineseResult] = useState(""); // New state for Chinese result
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult("");
    try {
      const response = await fetch('/api/gen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: inputValue, jokeType }), // Include jokeType in the request body
      });
      const data = await response.json();
      setResult(data.result);
      setEnglishResult(data.englishResult); // Assuming the API returns englishResult
      setChineseResult(data.chineseResult); // Assuming the API returns chineseResult
      setShowOverlay(true);
    } catch (error) {
      console.error('Error:', error);
      setResult('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRoll = async () => {
    try {
      const response = await fetch('/api/roll', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setInputValue(data.words);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">{jokeType}生成器</h1>
      {result && (
        <div className="relative mt-4 p-4 border rounded bg-gray-100 shadow-md max-w-md w-full">
          {showOverlay && (
            <div
              className="absolute inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center cursor-pointer"
              onClick={() => setShowOverlay(false)}
            >
              <span className="text-white text-lg">点击查看纯中文</span>
            </div>
          )}
          {!showOverlay && (
            <p className="text-gray-700">{chineseResult}</p>
          )}
        </div>
      )}
      {result && (
        <div className="relative mt-4 p-4 border rounded bg-gray-100 shadow-md max-w-md w-full">
          <p className="text-gray-700">{result}</p>
        </div>
      )}
      {result && (
        <div className="relative mt-4 p-4 border rounded bg-gray-100 shadow-md max-w-md w-full">
          <p className="text-gray-700">{englishResult}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-6 rounded shadow-lg max-w-md w-full">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRoll}
            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-700 transition duration-300"
          >
            🎲
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Enter something"
          />
        </div>
        <select
          value={jokeType}
          onChange={(e) => setJokeType(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="普通笑话">普通笑话</option>
          <option value="苏联笑话">苏联笑话</option>
          <option value="经济学家笑话">经济学家笑话</option>
          <option value="程序员笑话">程序员笑话</option>
          <option value="青年问禅师笑话">青年问禅师笑话</option>
          {/* <option value="双关语笑话">双关语笑话</option> */}
          {/* <option value="一千零一夜故事">一千零一夜故事</option> */}
          {/* <option value="格林童话故事">格林童话故事</option> */}
          {/* <option value="笑林广记风格笑话">笑林广记风格笑话</option> */}
          <option value="Sickipedia style joke">Sickipedia style joke</option>
          <option value="Reddit style joke">Reddit style joke</option>
          <option value="One Liner style joke">One Liner style joke</option>
          <option value="Talk show style joke">Talk show style joke</option>
        </select>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition duration-300"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}