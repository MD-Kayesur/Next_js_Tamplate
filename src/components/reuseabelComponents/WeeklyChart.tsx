"use client";

import { useGetPaymentsQuery } from "@/redux/features/auth/paymentApi";
import { useGetUsersQuery } from "@/redux/features/auth/userApi";
import { useMemo, useState } from "react";

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
  
  // Generate years starting from 2025
  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const yearList = [];
    const startYear = 2025;
    const endYear = Math.max(currentYear, startYear) + 3; // Current year or 2025, plus 3 years ahead
    for (let year = startYear; year <= endYear; year++) {
      yearList.push(year);
    }
    return yearList;
  }, [currentYear]);
  
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Get last 7 weeks of data for selected year
  const weeklyData = useMemo(() => {
    const weeks: WeeklyData[] = [];
    const now = new Date();
    
    // Determine the reference date based on selected year
    let referenceDate: Date;
    if (selectedYear > currentYear) {
      // Future year - use end of that year (will show empty data)
      referenceDate = new Date(selectedYear, 11, 31);
    } else if (selectedYear < currentYear) {
      // Past year - use end of that year
      referenceDate = new Date(selectedYear, 11, 31);
    } else {
      // Current year - use today
      referenceDate = now;
    }
    
    // Ensure reference date doesn't go beyond the selected year
    const yearEnd = new Date(selectedYear, 11, 31, 23, 59, 59);
    if (referenceDate > yearEnd) {
      referenceDate = yearEnd;
    }
    
    // Generate last 7 weeks
    for (let i = 6; i >= 0; i--) {
      let weekEnd = new Date(referenceDate);
      weekEnd.setDate(referenceDate.getDate() - (i * 7));
      let weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      
      // Ensure week is within the selected year
      if (weekStart.getFullYear() < selectedYear) {
        weekStart = new Date(selectedYear, 0, 1);
      }
      if (weekEnd.getFullYear() > selectedYear) {
        weekEnd = new Date(selectedYear, 11, 31, 23, 59, 59);
      }
      
      // Skip if week is completely outside the selected year
      if (weekStart.getFullYear() !== selectedYear && weekEnd.getFullYear() !== selectedYear) {
        continue;
      }
      
      const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      const weekShort = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Filter data for this week (only from selected year)
      const weekSubscriptions = subscriptions.filter((sub) => {
        const createdDate = new Date(sub.createdAt);
        return createdDate >= weekStart && createdDate <= weekEnd && createdDate.getFullYear() === selectedYear;
      });
      
      const weekUsers = users?.filter((user: any) => {
        const createdDate = new Date(user.createdAt);
        return createdDate >= weekStart && createdDate <= weekEnd && createdDate.getFullYear() === selectedYear;
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
  }, [subscriptions, users, selectedYear, currentYear]);

  const maxRevenue = Math.max(...weeklyData.map((d) => d.revenue), 1);
  const maxUsers = Math.max(...weeklyData.map((d) => d.users), 1);
  const maxSubscriptions = Math.max(...weeklyData.map((d) => d.subscriptions), 1);
  const maxValue = Math.max(maxRevenue, maxUsers * 50, maxSubscriptions * 50);

  return (
    <div className="space-y-6">
      {/* Year Filter */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-4">
          <label htmlFor="year-filter" className="text-sm font-medium text-gray-700">
            Filter by Year:
          </label>
          <select
            id="year-filter"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 cursor-pointer"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Weekly Bar Chart</h2>
          <p className="text-sm text-gray-500 mt-1">Revenue, Users, and Subscriptions Overview - {selectedYear}</p>
        </div>
        
        <div className="relative h-96">
          {/* Grid Lines - Behind everything */}
          <div className="absolute inset-0 flex flex-col justify-between pl-12 pr-4 pb-12 pointer-events-none z-0">
            {[0, 0.5, 1].map((ratio) => (
              <div
                key={ratio}
                className="border-t border-gray-200"
                style={{ marginTop: ratio === 0 ? '0' : ratio === 0.5 ? 'auto' : 'auto', marginBottom: ratio === 1 ? '0' : 'auto' }}
              />
            ))}
          </div>

          {/* Y-Axis Labels */}
          <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between px-2 text-xs text-gray-500 z-20">
            <span>{maxValue > 0 ? Math.round(maxValue).toLocaleString() : '0'}</span>
            <span>{maxValue > 0 ? Math.round(maxValue / 2).toLocaleString() : '0'}</span>
            <span>0</span>
          </div>

          {/* Chart Area with Bars */}
          <div className="absolute inset-0 flex items-end justify-between gap-2 pl-12 pr-4 pb-12 z-20">
            {weeklyData.map((data, index) => {
              const revenueHeight = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
              const usersHeight = maxUsers > 0 ? (data.users / maxUsers) * 100 : 0;
              const subscriptionsHeight = maxSubscriptions > 0 ? (data.subscriptions / maxSubscriptions) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full">
                  {/* Bars Container */}
                  <div className="w-full flex items-end justify-center gap-1 h-full relative">
                    {/* Revenue Bar */}
                    <div className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t transition-all duration-500 relative group-hover:from-blue-400 group-hover:to-blue-500 shadow-md hover:shadow-lg cursor-pointer"
                        style={{
                          height: `${Math.max(revenueHeight, 0.5)}%`,
                          minHeight: revenueHeight > 0 ? '4px' : '0',
                        }}
                        title={`Revenue: $${data.revenue.toFixed(2)}`}
                      >
                        {revenueHeight > 5 && (
                          <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-700 font-semibold whitespace-nowrap">
                            ${data.revenue.toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Users Bar */}
                    <div className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        className="w-full bg-gradient-to-t from-green-500 to-green-600 rounded-t transition-all duration-500 relative group-hover:from-green-400 group-hover:to-green-500 shadow-md hover:shadow-lg cursor-pointer"
                        style={{
                          height: `${Math.max(usersHeight, 0.5)}%`,
                          minHeight: usersHeight > 0 ? '4px' : '0',
                        }}
                        title={`Users: ${data.users}`}
                      >
                        {usersHeight > 5 && (
                          <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-700 font-semibold whitespace-nowrap">
                            {data.users}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Subscriptions Bar */}
                    <div className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        className="w-full bg-gradient-to-t from-purple-500 to-purple-600 rounded-t transition-all duration-500 relative group-hover:from-purple-400 group-hover:to-purple-500 shadow-md hover:shadow-lg cursor-pointer"
                        style={{
                          height: `${Math.max(subscriptionsHeight, 0.5)}%`,
                          minHeight: subscriptionsHeight > 0 ? '4px' : '0',
                        }}
                        title={`Subscriptions: ${data.subscriptions}`}
                      >
                        {subscriptionsHeight > 5 && (
                          <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-gray-700 font-semibold whitespace-nowrap">
                            {data.subscriptions}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Week Label */}
                  <div className="text-xs text-gray-600 font-medium mt-2 text-center w-full">
                    {data.weekShort}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm text-gray-600">Subscriptions</span>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Weekly Line Chart</h2>
          <p className="text-sm text-gray-500 mt-1">Trend Analysis Over Time - {selectedYear}</p>
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

