import React from 'react'
import { useQuery } from 'react-query'
import { 
  Building2, 
  Package, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  ArrowUpRight,
  BarChart3
} from 'lucide-react'
import { api } from '../lib/api'
import { formatCurrency } from '../lib/utils'

interface DashboardStats {
  total_properties: number
  total_upsells: number
  total_orders: number
  total_revenue: number
  monthly_revenue: number
  conversion_rate: number
  active_vendors: number
  pending_orders: number
}

interface RecentOrder {
  id: number
  guest_name: string
  upsell_title: string
  amount: number
  currency: string
  status: string
  created_at: string
  property_name: string
}

export const Dashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>(
    'dashboard-stats',
    () => api.get('/dashboard/stats').then(res => res.data)
  )

  const { data: recentOrders, isLoading: ordersLoading } = useQuery<RecentOrder[]>(
    'recent-orders',
    () => api.get('/dashboard/recent-orders').then(res => res.data)
  )

  const statsCards = [
    {
      title: 'Total Properties',
      value: stats?.total_properties || 0,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Upsells',
      value: stats?.total_upsells || 0,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Orders',
      value: stats?.total_orders || 0,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.total_revenue || 0),
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats?.monthly_revenue || 0),
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      title: 'Active Vendors',
      value: stats?.active_vendors || 0,
      icon: Users,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ]

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your villa upsell business
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((card, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              Last 7 days
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {ordersLoading ? (
            <div className="p-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 py-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </div>
              ))}
            </div>
          ) : recentOrders && recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">
                        {order.guest_name}
                      </p>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{order.upsell_title}</p>
                    <p className="text-xs text-gray-400">{order.property_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.amount, order.currency)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              No recent orders found
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Add Property</p>
              <p className="text-xs text-gray-500">Create new villa</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-400 ml-auto" />
          </div>
        </div>
        
        <div className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Add Upsell</p>
              <p className="text-xs text-gray-500">New service</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-400 ml-auto" />
          </div>
        </div>
        
        <div className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Add Vendor</p>
              <p className="text-xs text-gray-500">New partner</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-400 ml-auto" />
          </div>
        </div>
        
        <div className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">View Analytics</p>
              <p className="text-xs text-gray-500">Performance</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-gray-400 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}