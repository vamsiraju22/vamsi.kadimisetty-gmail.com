import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { analyzeBrokerageReportsStream } from '../services/geminiService';
import { BROKERAGE_PROMPT_DESCRIPTION } from '../constants';
import ThinkingLoader from './common/ThinkingLoader';
import Card from './common/Card';

const BrokerageAnalyzer: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [thinkingCode, setThinkingCode] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResult('');
    setThinkingCode(null);

    try {
      const stream = await analyzeBrokerageReportsStream();
      
      let currentResponse = '';
      let currentThinkingCode = '';

      for await (const chunk of stream) {
        // @ts-ignore - assuming thinkingState is present on the chunk for this feature
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
  }, []);

  return (
    <div className="flex flex-col h-full gap-6">
      <Card>
        <h2 className="text-xl font-bold mb-4 text-cyan-400">Latest Brokerage Reports</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
            <p className="text-gray-300 flex-grow">{BROKERAGE_PROMPT_DESCRIPTION}</p>
            <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors flex-shrink-0"
            >
                {isLoading ? 'Analyzing...' : 'Analyze Now'}
            </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </Card>

      <Card className="flex-grow">
        <h2 className="text-xl font-bold mb-4 text-cyan-400">Analysis Summary</h2>
        <div className="h-[65vh] overflow-y-auto custom-scrollbar pr-4">
          {isLoading && (
            <ThinkingLoader 
              message="Fetching and summarizing the latest brokerage reports..." 
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
          {!isLoading && !result && <p className="text-gray-400 text-center py-10">Click 'Analyze Now' to see the latest brokerage reports summary here.</p>}
        </div>
      </Card>
    </div>
  );
};

export default BrokerageAnalyzer;