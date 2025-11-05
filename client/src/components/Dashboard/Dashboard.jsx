import { useState } from 'react';
import MyEvents from './MyEvents';
import Marketplace from './Marketplace';
import SwapRequests from './SwapRequests';
import Notifications from './Notifications';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('my-events');

  const tabs = [
    { id: 'my-events', name: 'My Events', icon: '📅' },
    { id: 'marketplace', name: 'Marketplace', icon: '🔄' },
    { id: 'requests', name: 'Swap Requests', icon: '📬' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Notifications />
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                `}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div>
        {activeTab === 'my-events' && <MyEvents />}
        {activeTab === 'marketplace' && <Marketplace />}
        {activeTab === 'requests' && <SwapRequests />}
      </div>
    </div>
  );
}
