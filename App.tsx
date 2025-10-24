
import React, { useState } from 'react';
import Tabs from './components/common/Tabs';
import VideoAnalyzer from './components/VideoAnalyzer';
import CompanyAnalyzer from './components/CompanyAnalyzer';
import ChatBot from './components/ChatBot';
import BrokerageAnalyzer from './components/BrokerageAnalyzer';
import { VideoIcon } from './components/common/icons/VideoIcon';
import { CompanyIcon } from './components/common/icons/CompanyIcon';
import { ChatIcon } from './components/common/icons/ChatIcon';
import { BrokerageIcon } from './components/common/icons/BrokerageIcon';

export type Feature = 'video' | 'company' | 'brokerage' | 'chat';

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature>('video');

  const TABS = [
    { id: 'video', label: 'Video Analysis', icon: <VideoIcon /> },
    { id: 'company', label: 'Company Analysis', icon: <CompanyIcon /> },
    { id: 'brokerage', label: 'Brokerage Reports', icon: <BrokerageIcon /> },
    { id: 'chat', label: 'Market Chat', icon: <ChatIcon /> },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-cyan-400 tracking-wider">
            Market Mentor AI
          </h1>
          <div className="hidden md:block">
            <Tabs<Feature>
              tabs={TABS}
              activeTab={activeFeature}
              onTabClick={setActiveFeature}
            />
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className={activeFeature === 'video' ? 'h-full' : 'hidden'}>
          <VideoAnalyzer />
        </div>
        <div className={activeFeature === 'company' ? 'h-full' : 'hidden'}>
          <CompanyAnalyzer />
        </div>
        <div className={activeFeature === 'brokerage' ? 'h-full' : 'hidden'}>
          <BrokerageAnalyzer />
        </div>
        <div className={activeFeature === 'chat' ? 'h-full' : 'hidden'}>
          <ChatBot />
        </div>
      </main>

      {/* Mobile navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
         <Tabs<Feature>
            tabs={TABS}
            activeTab={activeFeature}
            onTabClick={setActiveFeature}
            isMobile={true}
          />
      </nav>
      {/* Spacer for mobile nav */}
      <div className="md:hidden h-20"></div>

    </div>
  );
};

export default App;