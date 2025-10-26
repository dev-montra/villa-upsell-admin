import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle,
  ShoppingCart,
  DollarSign,
  User,
  Calendar,
  Eye,
  Mail,
  MapPin,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock3,
  Grid3X3,
  List
} from 'lucide-react'
import { api } from '../lib/api'
import type { Order } from '../types'
import { formatCurrency, formatDateTime } from '../lib/utils'
import toast from 'react-hot-toast'

export const Orders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [vendorFilter, setVendorFilter] = useState('')
  const [showActionsMenu, setShowActionsMenu] = useState<number | null>(null)
  const [selectedOrders, setSelectedOrders] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const queryClient = useQueryClient()

  const { data: orders, isLoading, refetch } = useQuery<Order[]>(
    ['orders', statusFilter, dateFilter, vendorFilter],
    () => {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (dateFilter) params.append('date', dateFilter)
      if (vendorFilter) params.append('vendor', vendorFilter)
      return api.get(`/orders?${params.toString()}`).then(res => res.data.data)
    }
  )

  const updateStatusMutation = useMutation(
    ({ id, status }: { id: number; status: string }) => 
      api.put(`/orders/${id}/status`, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders')
        toast.success('Order status updated')
        setShowActionsMenu(null)
      },
      onError: () => {
        toast.error('Failed to update order status')
      }
    }
  )

  const bulkUpdateMutation = useMutation(
    ({ ids, status }: { ids: number[]; status: string }) => 
      api.put('/orders/bulk-update', { ids, status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders')
        toast.success(`${selectedOrders.length} orders updated`)
        setSelectedOrders([])
      },
      onError: () => {
        toast.error('Failed to update orders')
      }
    }
  )


  // Advanced filtering and sorting
  const filteredAndSortedOrders = useMemo(() => {
    if (!orders) return []

    let filtered = orders.filter(order => {
      const matchesSearch = 
        order.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.guest_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.upsell?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.property?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })

    // Sort orders
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        case 'amount':
          aValue = parseFloat(a.amount.toString())
          bValue = parseFloat(b.amount.toString())
          break
        case 'status':
          const statusOrder = { pending: 1, confirmed: 2, fulfilled: 3, cancelled: 4 }
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 0
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 0
          break
        default:
          return 0
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    })

    return filtered
  }, [orders, searchTerm, sortBy, sortOrder])

  // Statistics
  const stats = useMemo(() => {
    if (!orders) return { total: 0, revenue: 0, pending: 0, confirmed: 0, fulfilled: 0, cancelled: 0 }
    
    const total = orders.length
    const revenue = orders.reduce((sum, order) => sum + parseFloat(order.amount.toString()), 0)
    const pending = orders.filter(o => o.status === 'pending').length
    const confirmed = orders.filter(o => o.status === 'confirmed').length
    const fulfilled = orders.filter(o => o.status === 'fulfilled').length
    const cancelled = orders.filter(o => o.status === 'cancelled').length

    return { total, revenue, pending, confirmed, fulfilled, cancelled }
  }, [orders])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock3 className="h-4 w-4 text-yellow-600" />
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />
      case 'fulfilled':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'fulfilled':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredAndSortedOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredAndSortedOrders.map(order => order.id))
    }
  }

  const handleBulkAction = (status: string) => {
    if (selectedOrders.length === 0) return
    bulkUpdateMutation.mutate({ ids: selectedOrders, status })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track guest orders
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            className="btn-secondary btn-sm sm:btn-md"
          >
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards - Desktop Only */}
      <div className="hidden lg:grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.revenue)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock3 className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Fulfilled</p>
              <p className="text-2xl font-bold text-green-600">{stats.fulfilled}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Stats */}
      <div className="lg:hidden grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Orders</p>
              <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            </div>
            <ShoppingCart className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Revenue</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
            </div>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-lg ${viewMode === 'card' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, guests, services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-32 sm:w-40"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'status')}
              className="input w-24 sm:w-32"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn-secondary btn-sm"
            >
              {sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary btn-sm"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Hide' : 'Show'} Filters
          {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
        </button>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input w-full"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="input w-full"
              >
                <option value="">All Vendors</option>
                {/* Add vendor options here */}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleBulkAction('confirmed')}
                className="btn-secondary btn-sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Confirm
              </button>
              <button
                onClick={() => handleBulkAction('fulfilled')}
                className="btn-secondary btn-sm"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Fulfill
              </button>
              <button
                onClick={() => handleBulkAction('cancelled')}
                className="btn-secondary btn-sm"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Display */}
      {viewMode === 'card' ? (
        /* Card View */
        <div className="space-y-4">
          {filteredAndSortedOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{order.guest_name}</h3>
                        <p className="text-xs text-gray-500">{order.guest_email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Service:</span>
                      <p className="text-gray-900">{order.upsell?.title}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Property:</span>
                      <p className="text-gray-900">{order.property?.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Vendor:</span>
                      <p className="text-gray-900">{order.vendor?.name}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDateTime(order.created_at)}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(order.amount, order.currency)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-end gap-2">
                  <button className="text-blue-600 hover:text-blue-900 p-2">
                    <Eye className="h-4 w-4" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowActionsMenu(
                        showActionsMenu === order.id ? null : order.id
                      )}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {showActionsMenu === order.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <div className="py-1">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ 
                                id: order.id, 
                                status: 'confirmed' 
                              })}
                              className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Confirm Order
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ 
                                id: order.id, 
                                status: 'fulfilled' 
                              })}
                              className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Fulfilled
                            </button>
                          )}
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <button
                              onClick={() => updateStatusMutation.mutate({ 
                                id: order.id, 
                                status: 'cancelled' 
                              })}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View - Desktop Only */
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filteredAndSortedOrders.length && filteredAndSortedOrders.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{order.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.guest_name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {order.guest_email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.upsell?.title}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {order.property?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.vendor?.name}</div>
                      <div className="text-sm text-gray-500">{order.vendor?.service_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.amount, order.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateTime(order.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setShowActionsMenu(
                              showActionsMenu === order.id ? null : order.id
                            )}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          
                          {showActionsMenu === order.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1">
                                {order.status === 'pending' && (
                                  <button
                                    onClick={() => updateStatusMutation.mutate({ 
                                      id: order.id, 
                                      status: 'confirmed' 
                                    })}
                                    className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Confirm Order
                                  </button>
                                )}
                                {order.status === 'confirmed' && (
                                  <button
                                    onClick={() => updateStatusMutation.mutate({ 
                                      id: order.id, 
                                      status: 'fulfilled' 
                                    })}
                                    className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark Fulfilled
                                  </button>
                                )}
                                {(order.status === 'pending' || order.status === 'confirmed') && (
                                  <button
                                    onClick={() => updateStatusMutation.mutate({ 
                                      id: order.id, 
                                      status: 'cancelled' 
                                    })}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Cancel Order
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredAndSortedOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter ? 'No orders match your search criteria.' : 'Orders will appear here when guests make purchases.'}
          </p>
        </div>
      )}
    </div>
  )
}