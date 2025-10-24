import React from 'react';
import { HourglassIcon } from './icons/HourglassIcon';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-gray-800/50 rounded-lg">
      <HourglassIcon />
      <p className="text-lg text-cyan-300">{message}</p>
    </div>
  );
};

export default Loader;