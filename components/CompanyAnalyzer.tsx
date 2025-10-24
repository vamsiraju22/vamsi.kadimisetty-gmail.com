
import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyzeCompanyStream } from '../services/geminiService';
import ThinkingLoader from './common/ThinkingLoader';
import Card from './common/Card';

const CompanyAnalyzer: React.FC = () => {
  const [companyName, setCompanyName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [thinkingCode, setThinkingCode] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!companyName.trim()) {
      setError('Please enter a company name.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult('');
    setThinkingCode(null);

    try {
      const stream = await analyzeCompanyStream(companyName);
      
      let currentResponse = '';
      let currentThinkingCode = '';

      for await (const chunk of stream) {
        // @ts-ignore
        if (chunk.thinkingState?.code) {
          currentThinkingCode += chunk.thinkingState.code;
          setThinkingCode(currentThinkingCode);
        }

        if (chunk.text) {
          currentResponse += chunk.text;
          setResult(currentResponse);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setThinkingCode(null);
    }
  }, [companyName]);

  return (
    <div className="flex flex-col h-full gap-6">
      <Card>
        <h2 className="text-xl font-bold mb-4 text-cyan-400">Company Analysis with Thinking Mode</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Enter company name (e.g., Reliance Industries)"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="flex-grow w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !companyName.trim()}
            className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </Card>

      <Card className="flex-grow flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-cyan-400">Analysis Report</h2>
        <div className="flex-grow h-[60vh] overflow-y-auto custom-scrollbar pr-4">
          {isLoading && (
            <ThinkingLoader 
              message="Generating comprehensive report using thinking mode..." 
              thinkingCode={thinkingCode}
            />
          )}
          {result && !isLoading && (
            <div className="prose-custom">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result}
              </ReactMarkdown>
            </div>
          )}
          {!isLoading && !result && <p className="text-gray-400 text-center py-10">Enter a company name and click 'Generate Report' to see the results here.</p>}
        </div>
      </Card>
    </div>
  );
};

export default CompanyAnalyzer;
