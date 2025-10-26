import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Calendar,
  Filter
} from 'lucide-react'
import { api } from '../lib/api'
import { formatCurrency, exportAccountingData } from '../lib/utils'
import toast from 'react-hot-toast'

interface RevenueData {
  date: string
  total: number
}

interface UpsellAnalytics {
  id: number
  title: string
  total_orders: number
  total_revenue: number
}

export const Analytics: React.FC = () => {
  const [period, setPeriod] = useState('30')
  const [isExporting, setIsExporting] = useState(false)

  const { data: revenueData, isLoading: revenueLoading } = useQuery<RevenueData[]>(
    ['revenue-analytics', period],
    () => api.get(`/dashboard/revenue-analytics?period=${period}`).then(res => res.data)
  )

  const { data: upsellAnalytics, isLoading: upsellLoading } = useQuery<UpsellAnalytics[]>(
    'upsell-analytics',
    () => api.get('/dashboard/upsell-analytics').then(res => res.data)
  )

  const { data: stats } = useQuery(
    'dashboard-stats',
    () => api.get('/dashboard/stats').then(res => res.data)
  )

  const totalRevenue = revenueData?.reduce((sum, item) => sum + (item.total || 0), 0) || 0
  // const maxRevenue = revenueData && revenueData.length > 0 ? Math.max(...revenueData.map(item => item.total || 0)) : 0
  
  // Get only the last 5 days with revenue data for better visualization
  const recentRevenueData = revenueData 
    ? revenueData
        .filter(item => item.total > 0) // Only days with revenue
        .slice(-5) // Last 5 days
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date
    : []
  
  const recentMaxRevenue = recentRevenueData.length > 0 ? Math.max(...recentRevenueData.map(item => item.total)) : 0

  const handleExportCSV = async () => {
    try {
      setIsExporting(true)
      await exportAccountingData(parseInt(period))
      toast.success('Accounting data exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export accounting data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            View performance metrics and insights
          </p>
        </div>
        
        {/* Mobile-optimized Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Responsive Date Selector */}
          <div className="w-full sm:w-auto">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          
          {/* Mobile Export Button */}
          <button 
            onClick={handleExportCSV}
            disabled={isExporting}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Filter className="h-4 w-4 mr-2 inline" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Responsive Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 rounded-lg bg-green-100">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Revenue</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                {formatCurrency(stats?.total_revenue || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Orders</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                {stats?.total_orders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Conversion Rate</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                {stats?.conversion_rate || 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 rounded-lg bg-yellow-100">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-yellow-600" />
            </div>
            <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Monthly Revenue</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">
                {formatCurrency(stats?.monthly_revenue || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Revenue Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Revenue Trend</h3>
          <div className="flex items-center text-xs sm:text-sm text-gray-500">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Last {period} days
          </div>
        </div>
        
         {revenueLoading ? (
           <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
         ) : recentRevenueData && recentRevenueData.length > 0 ? (
           <div className="space-y-4 sm:space-y-6">
             {/* Mobile-Optimized Chart Container */}
             <div className="h-48 sm:h-64 lg:h-80">
               <div className="flex items-end justify-between h-full space-x-1 sm:space-x-2 lg:space-x-3">
                 {/* Mobile Y-axis labels */}
                 <div className="flex flex-col justify-between h-full text-xs text-gray-500 pr-1 sm:pr-2 w-10 sm:w-12 lg:w-16">
                   <span className="text-right">{formatCurrency(recentMaxRevenue)}</span>
                   <span className="text-right">{formatCurrency(recentMaxRevenue * 0.75)}</span>
                   <span className="text-right">{formatCurrency(recentMaxRevenue * 0.5)}</span>
                   <span className="text-right">{formatCurrency(recentMaxRevenue * 0.25)}</span>
                   <span className="text-right">$0</span>
                 </div>
                 
                 {/* Mobile Chart bars - only 5 days */}
                 <div className="flex items-end justify-between h-full space-x-1 sm:space-x-2 lg:space-x-3 flex-1">
                   {recentRevenueData.map((item, index) => {
                     const height = recentMaxRevenue > 0 ? (item.total / recentMaxRevenue) * 100 : 0
                     
                     return (
                       <div key={index} className="flex flex-col items-center flex-1 min-w-0">
                         {/* Mobile Chart bar container */}
                         <div className="w-full relative group flex flex-col justify-end" style={{ height: '140px' }}>
                           {/* Revenue bar - mobile optimized */}
                           <div 
                             className="w-full rounded-t-lg transition-all duration-300 cursor-pointer shadow-sm bg-gradient-to-t from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                             style={{ 
                               height: `${height}%`,
                               minHeight: '6px'
                             }}
                             title={`${formatCurrency(item.total)} - ${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                           >
                             {/* Mobile Value label on hover */}
                             <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                               {formatCurrency(item.total)}
                             </div>
                           </div>
                         </div>
                         
                         {/* Mobile Date label */}
                         <div className="mt-1 sm:mt-2 text-xs text-gray-500 text-center font-medium truncate w-full">
                           {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                         </div>
                       </div>
                     )
                   })}
                 </div>
               </div>
             </div>
             
             {/* Mobile-Optimized Summary Section */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
               <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-blue-200">
                 <div className="flex items-center">
                   <div className="p-1.5 sm:p-2 lg:p-3 bg-blue-500 rounded-lg">
                     <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                   </div>
                   <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
                     <p className="text-xs sm:text-sm font-medium text-blue-700 truncate">Period Total</p>
                     <p className="text-base sm:text-lg lg:text-2xl font-bold text-blue-900 truncate">{formatCurrency(totalRevenue)}</p>
                   </div>
                 </div>
               </div>
               
               <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-green-200">
                 <div className="flex items-center">
                   <div className="p-1.5 sm:p-2 lg:p-3 bg-green-500 rounded-lg">
                     <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                   </div>
                   <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
                     <p className="text-xs sm:text-sm font-medium text-green-700 truncate">Average Daily</p>
                     <p className="text-base sm:text-lg lg:text-2xl font-bold text-green-900 truncate">
                       {formatCurrency(revenueData && revenueData.length > 0 ? totalRevenue / revenueData.length : 0)}
                     </p>
                   </div>
                 </div>
               </div>
               
               <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl border border-purple-200">
                 <div className="flex items-center">
                   <div className="p-1.5 sm:p-2 lg:p-3 bg-purple-500 rounded-lg">
                     <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                   </div>
                   <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0 flex-1">
                     <p className="text-xs sm:text-sm font-medium text-purple-700 truncate">Recent Activity</p>
                     <p className="text-base sm:text-lg lg:text-2xl font-bold text-purple-900">
                       {recentRevenueData.length} days
                     </p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-gray-500">
            <BarChart3 className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium">No revenue data available</p>
            <p className="text-sm">Revenue will appear here once you have completed orders</p>
          </div>
        )}
      </div>

      {/* Upsell Performance */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Top Performing Upsells</h3>
        
        {upsellLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : upsellAnalytics && upsellAnalytics.length > 0 ? (
          <div className="space-y-4">
            {upsellAnalytics.slice(0, 5).map((upsell) => (
              <div key={upsell.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{upsell.title}</h4>
                  <p className="text-sm text-gray-500">{upsell.total_orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(upsell.total_revenue)}
                  </p>
                  <p className="text-sm text-gray-500">revenue</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No upsell data available
          </div>
        )}
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">{stats?.pending_orders || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Confirmed</span>
              <span className="font-semibold text-blue-600">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Fulfilled</span>
              <span className="font-semibold text-green-600">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cancelled</span>
              <span className="font-semibold text-red-600">0</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Property Performance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Properties</span>
              <span className="font-semibold text-gray-900">{stats?.total_properties || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Upsells</span>
              <span className="font-semibold text-gray-900">{stats?.total_upsells || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Vendors</span>
              <span className="font-semibold text-gray-900">{stats?.active_vendors || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}