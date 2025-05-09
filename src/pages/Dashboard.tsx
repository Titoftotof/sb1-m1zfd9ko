import React from 'react';
import TodaySummary from '../components/dashboard/TodaySummary';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import QuickActions from '../components/dashboard/QuickActions';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions />
          
          <div className="mt-6">
            <ActivityFeed />
          </div>
        </div>
        
        <div>
          <TodaySummary />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;