import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Package,
  Eye,
  EyeOff
} from 'lucide-react'
import { api } from '../lib/api'
import type { Upsell } from '../types'
import { formatCurrency } from '../lib/utils'
import toast from 'react-hot-toast'

export const Upsells: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showActionsMenu, setShowActionsMenu] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const { data: upsells, isLoading } = useQuery<Upsell[]>(
    'upsells',
    () => api.get('/upsells').then(res => res.data.upsells),
    {
      onError: (error: any) => {
        console.error('Upsells fetch error:', error)
        toast.error('Failed to load upsells')
      }
    }
  )

  const deleteUpsellMutation = useMutation(
    (id: number) => api.delete(`/upsells/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('upsells')
        toast.success('Upsell deleted successfully')
        setShowActionsMenu(null)
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to delete upsell'
        toast.error(message)
      }
    }
  )

  const toggleActiveMutation = useMutation(
    ({ id, isActive }: { id: number; isActive: boolean }) => 
      api.put(`/upsells/${id}`, { is_active: !isActive }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('upsells')
        toast.success('Upsell status updated')
      },
      onError: () => {
        toast.error('Failed to update upsell status')
      }
    }
  )

  const filteredUpsells = upsells?.filter(upsell =>
    upsell.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    upsell.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    upsell.category.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Upsells</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your upsell services and offerings
          </p>
        </div>
        <Link 
          to="/upsells/new" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Upsell
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search upsells, categories, descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <Filter className="h-4 w-4 mr-2" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upsells Grid */}
      {filteredUpsells.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredUpsells.map((upsell) => (
            <Link key={upsell.id} to={`/upsells/${upsell.id}/edit`} className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer block">
              {/* Image Section - Compact */}
              <div className="relative aspect-square overflow-hidden">
                {upsell.image_url ? (
                  <img
                    src={upsell.image_url}
                    alt={upsell.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onLoad={() => {}}
                    onError={() => {}}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                    <Package className="h-8 w-8 text-blue-400" />
                  </div>
                )}
                
                {/* Hover Overlay with Details */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                  {/* Top Section - Actions */}
                  <div className="flex justify-between items-start">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowActionsMenu(
                            showActionsMenu === upsell.id ? null : upsell.id
                          )
                        }}
                        className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      >
                        <MoreVertical className="h-3 w-3 text-white" />
                      </button>
                      
                      {showActionsMenu === upsell.id && (
                        <div className="absolute left-0 mt-2 w-40 bg-white rounded-lg shadow-xl z-20 border border-gray-200">
                          <div className="py-1">
                            <Link
                              to={`/upsells/${upsell.id}/edit`}
                              className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Edit className="h-3 w-3 mr-2" />
                              Edit
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleActiveMutation.mutate({ 
                                  id: upsell.id, 
                                  isActive: upsell.is_active 
                                })
                              }}
                              className="flex items-center w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              {upsell.is_active ? (
                                <>
                                  <EyeOff className="h-3 w-3 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3 w-3 mr-2" />
                                  Activate
                                </>
                              )}
                            </button>
                            <hr className="my-1" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (window.confirm('Are you sure you want to delete this upsell?')) {
                                  deleteUpsellMutation.mutate(upsell.id)
                                }
                              }}
                              className="flex items-center w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      upsell.is_active 
                        ? 'bg-green-500/80 text-white' 
                        : 'bg-gray-500/80 text-white'
                    }`}>
                      {upsell.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {/* Bottom Section - Upsell Info */}
                  <div className="text-white">
                    <h3 className="font-bold text-sm mb-1 line-clamp-1">
                      {upsell.title}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-2 mb-2">
                      {upsell.description || 'No description provided'}
                    </p>
                    
                    {/* Quick Details */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/70">Price:</span>
                        <span className="font-medium">{formatCurrency(upsell.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Category:</span>
                        <span className="font-medium capitalize">{upsell.category}</span>
                      </div>
                      {upsell.primary_vendor && (
                        <div className="flex justify-between">
                          <span className="text-white/70">Vendor:</span>
                          <span className="font-medium truncate ml-2">{upsell.primary_vendor.name}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Property Info */}
                    {upsell.property && (
                      <div className="mt-2 pt-2 border-t border-white/20">
                        <div className="text-xs text-white/70">
                          <span className="font-medium">Property:</span>
                          <span className="ml-1">{upsell.property.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Bottom Label - Always Visible */}
              <div className="p-2 bg-white">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {upsell.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="truncate">{formatCurrency(upsell.price)}</span>
                  <span className="capitalize">{upsell.category}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No upsells found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'No upsells match your search criteria.' : 'Get started by creating your first upsell service.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Link to="/upsells/new" className="btn-primary btn-md">
                <Plus className="h-4 w-4 mr-2" />
                Add Upsell
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}