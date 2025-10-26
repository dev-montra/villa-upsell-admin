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
  Copy,
  ExternalLink,
  Building2
} from 'lucide-react'
import { api } from '../lib/api'
import type { Property } from '../types'
import toast from 'react-hot-toast'
// import { useAuth } from '../contexts/AuthContext'

export const Properties: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showActionsMenu, setShowActionsMenu] = useState<number | null>(null)
  const queryClient = useQueryClient()
  // const { user, token } = useAuth()

  const { data: properties, isLoading } = useQuery<Property[]>(
    'properties',
    () => api.get('/properties').then(res => {
      return res.data.properties
    }),
    {
      onError: (error: any) => {
        console.error('Properties fetch error:', error)
        toast.error('Failed to load properties')
      }
    }
  )


  const deletePropertyMutation = useMutation(
    (id: number) => api.delete(`/properties/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('properties')
        toast.success('Property deleted successfully')
        setShowActionsMenu(null)
      },
      onError: () => {
        toast.error('Failed to delete property')
      }
    }
  )

  const copyLink = (accessToken: string) => {
    // Copy only the access token, not the full URL
    navigator.clipboard.writeText(accessToken)
    toast.success('Access token copied to clipboard!')
  }

  const filteredProperties = properties?.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Properties</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your villa properties and their settings
          </p>
        </div>
        <Link
          to="/properties/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties, descriptions..."
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

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProperties.map((property) => (
            <Link key={property.id} to={`/properties/${property.id}/edit`} className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer block">
              {/* Image Section - Compact */}
              <div className="relative aspect-square overflow-hidden">
                {property.hero_image_url ? (
                  <img
                    src={property.hero_image_url}
                    alt={property.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onLoad={() => {}}
                    onError={() => {}}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-blue-400" />
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
                            showActionsMenu === property.id ? null : property.id
                          )
                        }}
                        className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      >
                        <MoreVertical className="h-3 w-3 text-white" />
                      </button>
                      
                      {showActionsMenu === property.id && (
                        <div className="absolute left-0 mt-2 w-40 bg-white rounded-lg shadow-xl z-20 border border-gray-200">
                          <div className="py-1">
                            <Link
                              to={`/properties/${property.id}/edit`}
                              className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Edit className="h-3 w-3 mr-2" />
                              Edit
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                copyLink(property.access_token)
                              }}
                              className="flex items-center w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Copy className="h-3 w-3 mr-2" />
                              Copy Token
                            </button>
                            <a
                              href={`${import.meta.env.VITE_GUEST_APP_URL || 'http://localhost:4000'}/checkin/${property.access_token}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Preview
                            </a>
                            <hr className="my-1" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (window.confirm('Are you sure you want to delete this property?')) {
                                  deletePropertyMutation.mutate(property.id)
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
                    
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/80 text-white backdrop-blur-sm">
                      Active
                    </span>
                  </div>
                  
                  {/* Bottom Section - Property Info */}
                  <div className="text-white">
                    <h3 className="font-bold text-sm mb-1 line-clamp-1">
                      {property.name}
                    </h3>
                    <p className="text-xs text-white/80 line-clamp-2 mb-2">
                      {property.description || 'No description provided'}
                    </p>
                    
                    {/* Quick Details */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-white/70">Language:</span>
                        <span className="font-medium">{property.language}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Currency:</span>
                        <span className="font-medium">{property.currency}</span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {property.tags && property.tags.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {property.tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-white/20 text-white"
                            >
                              {tag}
                            </span>
                          ))}
                          {property.tags.length > 2 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-white/20 text-white">
                              +{property.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Bottom Label - Always Visible */}
              <div className="p-2 bg-white">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {property.name}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {property.language} • {property.currency}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No properties</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first property.
          </p>
          <div className="mt-6">
            <Link
              to="/properties/new"
              className="btn-primary btn-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}