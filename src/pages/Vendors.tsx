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
  Users
} from 'lucide-react'
import { api } from '../lib/api'
import type { Vendor } from '../types'
import { formatDate } from '../lib/utils'
import toast from 'react-hot-toast'

export const Vendors: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showActionsMenu, setShowActionsMenu] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const { data: vendors, isLoading } = useQuery<Vendor[]>(
    'vendors',
    () => api.get('/vendors').then(res => res.data.vendors)
  )

  const deleteVendorMutation = useMutation(
    (id: number) => api.delete(`/vendors/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vendors')
        toast.success('Vendor deleted successfully')
        setShowActionsMenu(null)
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to delete vendor'
        toast.error(message)
      }
    }
  )

  const filteredVendors = vendors?.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.service_type.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Vendors</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your service providers and partners
          </p>
        </div>
        <Link 
          to="/vendors/new" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors, services, emails..."
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

      {/* Vendors Grid */}
      {filteredVendors.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredVendors.map((vendor) => (
            <Link key={vendor.id} to={`/vendors/${vendor.id}/edit`} className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer block">
              {/* Icon Section - Compact */}
              <div className="relative aspect-square overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <Users className="h-12 w-12 text-blue-400" />
                </div>
                
                {/* Hover Overlay with Details */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                  {/* Top Section - Actions */}
                  <div className="flex justify-between items-start">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowActionsMenu(
                            showActionsMenu === vendor.id ? null : vendor.id
                          )
                        }}
                        className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      >
                        <MoreVertical className="h-3 w-3 text-white" />
                      </button>
                      
                      {showActionsMenu === vendor.id && (
                        <div className="absolute left-0 mt-2 w-40 bg-white rounded-lg shadow-xl z-20 border border-gray-200">
                          <div className="py-1">
                            <Link
                              to={`/vendors/${vendor.id}/edit`}
                              className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Edit className="h-3 w-3 mr-2" />
                              Edit
                            </Link>
                            <hr className="my-1" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (window.confirm('Are you sure you want to delete this vendor?')) {
                                  deleteVendorMutation.mutate(vendor.id)
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
                      vendor.is_active 
                        ? 'bg-green-500/80 text-white' 
                        : 'bg-gray-500/80 text-white'
                    }`}>
                      {vendor.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {/* Bottom Section - Vendor Info */}
                  <div className="text-white">
                    <h3 className="font-bold text-sm mb-1 line-clamp-1">
                      {vendor.name}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-2 mb-2">
                      {vendor.description || 'No description provided'}
                    </p>
                    
                    {/* Quick Details */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/70">Service:</span>
                        <span className="font-medium capitalize">{vendor.service_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Email:</span>
                        <span className="font-medium truncate ml-2">{vendor.email}</span>
                      </div>
                      {vendor.phone && (
                        <div className="flex justify-between">
                          <span className="text-white/70">Phone:</span>
                          <span className="font-medium">{vendor.phone}</span>
                        </div>
                      )}
                      {vendor.whatsapp_number && (
                        <div className="flex justify-between">
                          <span className="text-white/70">WhatsApp:</span>
                          <span className="font-medium">{vendor.whatsapp_number}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Created Date */}
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <div className="text-xs text-white/70">
                        <span className="font-medium">Created:</span>
                        <span className="ml-1">{formatDate(vendor.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Label - Always Visible */}
              <div className="p-2 bg-white">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {vendor.name}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="truncate">{vendor.email}</span>
                  <span className="capitalize">{vendor.service_type}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vendors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'No vendors match your search criteria.' : 'Get started by adding your first vendor.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Link to="/vendors/new" className="btn-primary btn-md">
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}