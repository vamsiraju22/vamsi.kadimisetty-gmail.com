import React from 'react';
import { HourglassIcon } from './icons/HourglassIcon';

interface ThinkingLoaderProps {
  message: string;
  thinkingCode: string | null;
}

const ThinkingLoader: React.FC<ThinkingLoaderProps> = ({ message, thinkingCode }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-gray-800/50 rounded-lg">
      <HourglassIcon />
      <p className="text-lg text-cyan-300">{message}</p>
      {thinkingCode && (
        <div className="w-full max-w-2xl mt-4">
          <p className="text-sm text-gray-400 mb-2">Model is thinking:</p>
          <pre className="bg-gray-900 text-gray-300 text-xs p-4 rounded-md overflow-x-auto custom-scrollbar max-h-48">
            <code>{thinkingCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

export default ThinkingLoader;