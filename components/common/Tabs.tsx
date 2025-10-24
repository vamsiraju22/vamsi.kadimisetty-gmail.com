import React from 'react';

interface Tab<T extends string> {
  id: T;
  label: string;
  icon: React.ReactNode;
}

interface TabsProps<T extends string> {
  // FIX: Changed `tabs` to accept a readonly array. This is compatible with the `as const`
  // assertion used for the TABS constant in `App.tsx`, resolving the type mismatch.
  tabs: readonly Tab<T>[];
  activeTab: T;
  onTabClick: (tabId: T) => void;
  isMobile?: boolean;
}

const Tabs = <T extends string,>({ tabs, activeTab, onTabClick, isMobile = false }: TabsProps<T>): React.ReactElement => {
  if (isMobile) {
    return (
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className={`flex flex-col items-center justify-center space-y-1 w-full h-full text-xs transition-colors duration-200 ${
              activeTab === tab.id
                ? 'text-cyan-400'
                : 'text-gray-400 hover:text-cyan-300'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex space-x-2 bg-gray-900 p-1 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabClick(tab.id)}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-cyan-500 text-white shadow-md'
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;
