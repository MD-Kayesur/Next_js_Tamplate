"use client";

import { useGetPaymentsQuery } from "@/redux/features/auth/paymentApi";
import { useGetUsersQuery } from "@/redux/features/auth/userApi";
import { useMemo } from "react";

interface WeeklyData {
  week: string;
  weekShort: string;
  revenue: number;
  users: number;
  subscriptions: number;
}

const WeeklyChart = () => {
  const { data: users } = useGetUsersQuery(undefined);
  const { data: subscriptionsData } = useGetPaymentsQuery("all");
  
  const subscriptions = subscriptionsData?.subscriptions ?? [];

  // Get last 7 weeks of data
  const weeklyData = useMemo(() => {
    const weeks: WeeklyData[] = [];
    const now = new Date();
    
    // Generate last 7 weeks
    for (let i = 6; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      
      const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      const weekShort = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Filter data for this week
      const weekSubscriptions = subscriptions.filter((sub) => {
        const createdDate = new Date(sub.createdAt);
        return createdDate >= weekStart && createdDate <= weekEnd;
      });
      
      const weekUsers = users?.filter((user: any) => {
        const createdDate = new Date(user.createdAt);
        return createdDate >= weekStart && createdDate <= weekEnd;
      }) ?? [];
      
      const weekRevenue = weekSubscriptions.reduce(
        (sum, s) => sum + (s.subscriptionPlan?.price ?? 0),
        0
      );
      
      weeks.push({
        week: weekLabel,
        weekShort: weekShort,
        revenue: weekRevenue,
        users: weekUsers.length,
        subscriptions: weekSubscriptions.length,
      });
    }
    
    return weeks;
  }, [subscriptions, users]);

  const maxRevenue = Math.max(...weeklyData.map((d) => d.revenue), 1);
  const maxUsers = Math.max(...weeklyData.map((d) => d.users), 1);
  const maxSubscriptions = Math.max(...weeklyData.map((d) => d.subscriptions), 1);
  const maxValue = Math.max(maxRevenue, maxUsers * 50, maxSubscriptions * 50);

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Weekly Bar Chart</h2>
          <p className="text-sm text-gray-500 mt-1">Revenue, Users, and Subscriptions Overview</p>
        </div>
        
        <div className="space-y-4">
          {weeklyData.map((data, index) => (
            <div key={index} className="space-y-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700">{data.week}</span>
                <div className="flex gap-4 text-xs text-gray-600">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">${data.revenue.toFixed(2)}</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">{data.users} users</span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">{data.subscriptions} subs</span>
                </div>
              </div>
              
              {/* Revenue Bar */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-28 font-medium flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-blue-500"></span>
                    Revenue
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-7 relative overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3 shadow-md"
                      style={{
                        width: `${maxRevenue > 0 ? Math.max((data.revenue / maxRevenue) * 100, 2) : 0}%`,
                      }}
                    >
                      {data.revenue > 0 && (
                        <span className="text-xs text-white font-semibold">
                          ${data.revenue.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {data.revenue === 0 && (
                      <span className="absolute right-3 top-1.5 text-xs text-gray-400">$0.00</span>
                    )}
                  </div>
                </div>
                
                {/* Users Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-28 font-medium flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-green-500"></span>
                    Users
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-7 relative overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3 shadow-md"
                      style={{
                        width: `${maxUsers > 0 ? Math.max((data.users / maxUsers) * 100, 2) : 0}%`,
                      }}
                    >
                      {data.users > 0 && (
                        <span className="text-xs text-white font-semibold">
                          {data.users}
                        </span>
                      )}
                    </div>
                    {data.users === 0 && (
                      <span className="absolute right-3 top-1.5 text-xs text-gray-400">0</span>
                    )}
                  </div>
                </div>
                
                {/* Subscriptions Bar */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-28 font-medium flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-purple-500"></span>
                    Subscriptions
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-7 relative overflow-hidden shadow-inner">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3 shadow-md"
                      style={{
                        width: `${maxSubscriptions > 0 ? Math.max((data.subscriptions / maxSubscriptions) * 100, 2) : 0}%`,
                      }}
                    >
                      {data.subscriptions > 0 && (
                        <span className="text-xs text-white font-semibold">
                          {data.subscriptions}
                        </span>
                      )}
                    </div>
                    {data.subscriptions === 0 && (
                      <span className="absolute right-3 top-1.5 text-xs text-gray-400">0</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Weekly Line Chart</h2>
          <p className="text-sm text-gray-500 mt-1">Trend Analysis Over Time</p>
        </div>
        
        <div className="relative h-80">
          {/* Grid Lines - Behind everything */}
          <div className="absolute inset-0 flex flex-col justify-between px-8 pb-8 pointer-events-none z-0">
            {[0, 0.5, 1].map((ratio) => (
              <div
                key={ratio}
                className="border-t border-gray-200"
                style={{ marginTop: ratio === 0 ? '0' : ratio === 0.5 ? 'auto' : 'auto', marginBottom: ratio === 1 ? '0' : 'auto' }}
              />
            ))}
          </div>

          {/* Connecting Lines - Behind points */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none z-10" 
            style={{ height: 'calc(100% - 3rem)', top: '0', bottom: '3rem' }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Revenue Line */}
            <polyline
              points={weeklyData.map((data, index) => {
                // Calculate x position: evenly spaced across the width, accounting for padding
                const x = ((index + 0.5) / weeklyData.length) * 92 + 4; // 92% width with 4% padding on each side
                // Calculate y position: from bottom (100) minus the percentage height
                const y = 100 - (maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Users Line */}
            <polyline
              points={weeklyData.map((data, index) => {
                const x = ((index + 0.5) / weeklyData.length) * 92 + 4;
                const y = 100 - (maxUsers > 0 ? (data.users / maxUsers) * 100 : 0);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Subscriptions Line */}
            <polyline
              points={weeklyData.map((data, index) => {
                const x = ((index + 0.5) / weeklyData.length) * 92 + 4;
                const y = 100 - (maxSubscriptions > 0 ? (data.subscriptions / maxSubscriptions) * 100 : 0);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          {/* Chart Area with Points - On top */}
          <div className="absolute inset-0 flex items-end justify-between gap-2 px-4 pb-8 z-20">
            {weeklyData.map((data, index) => {
              const revenueHeight = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
              const usersHeight = maxUsers > 0 ? (data.users / maxUsers) * 100 : 0;
              const subscriptionsHeight = maxSubscriptions > 0 ? (data.subscriptions / maxSubscriptions) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  {/* Chart Points */}
                  <div className="w-full flex items-end justify-center gap-1 h-full relative">
                    {/* Revenue Line Point */}
                    <div 
                      className="absolute left-1/2 transform -translate-x-1/2 z-30"
                      style={{ bottom: `${revenueHeight}%` }}
                    >
                      <div
                        className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-lg transition-all duration-300 group-hover:scale-150 cursor-pointer"
                        title={`Revenue: $${data.revenue.toFixed(2)}`}
                      />
                    </div>
                    
                    {/* Users Line Point */}
                    <div 
                      className="absolute left-1/2 transform -translate-x-1/2 z-30"
                      style={{ bottom: `${usersHeight}%` }}
                    >
                      <div
                        className="w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-lg transition-all duration-300 group-hover:scale-150 cursor-pointer"
                        title={`Users: ${data.users}`}
                      />
                    </div>
                    
                    {/* Subscriptions Line Point */}
                    <div 
                      className="absolute left-1/2 transform -translate-x-1/2 z-30"
                      style={{ bottom: `${subscriptionsHeight}%` }}
                    >
                      <div
                        className="w-3 h-3 rounded-full bg-purple-500 border-2 border-white shadow-lg transition-all duration-300 group-hover:scale-150 cursor-pointer"
                        title={`Subscriptions: ${data.subscriptions}`}
                      />
                    </div>
                  </div>
                  
                  {/* Week Label */}
                  <div className="text-xs text-gray-600 font-medium mt-2 text-center">
                    {data.weekShort}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Y-Axis Labels */}
          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between px-2 text-xs text-gray-500 z-20">
            <span>{maxValue > 0 ? Math.round(maxValue).toLocaleString() : '0'}</span>
            <span>{maxValue > 0 ? Math.round(maxValue / 2).toLocaleString() : '0'}</span>
            <span>0</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-500"></div>
            <span className="text-sm text-gray-600">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-500"></div>
            <span className="text-sm text-gray-600">Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-purple-500"></div>
            <span className="text-sm text-gray-600">Subscriptions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyChart;

