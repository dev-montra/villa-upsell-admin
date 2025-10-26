import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'
import { api } from '../lib/api'
import type { Upsell, Property, Vendor } from '../types'
import toast from 'react-hot-toast'

interface UpsellFormData {
  property_id: number
  primary_vendor_id: number
  secondary_vendor_id: number | null
  title: string
  description: string
  price: number
  category: string
  image_url?: string
  availability_rules: any
  is_active: boolean
  sort_order: number
}

const categories = [
  'chef',
  'transport',
  'cleaning',
  'concierge',
  'maintenance',
  'security',
  'entertainment',
  'wellness',
  'experience',
  'other'
]

export const UpsellForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = Boolean(id)
  
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<UpsellFormData>({
    defaultValues: {
      property_id: 0,
      primary_vendor_id: 0,
      secondary_vendor_id: null,
      title: '',
      description: '',
      price: 0,
      category: 'chef',
      image_url: '',
      availability_rules: {},
      is_active: true,
      sort_order: 0,
    }
  })

  // Fetch upsell data if editing
  const { data: upsell, isLoading: upsellLoading } = useQuery<Upsell>(
    ['upsell', id],
    () => api.get(`/upsells/${id}`).then(res => res.data.upsell),
    { enabled: isEditing }
  )

  // Fetch properties and vendors for dropdowns
  const { data: properties } = useQuery<Property[]>(
    'properties',
    () => api.get('/properties').then(res => res.data.properties)
  )

  const { data: vendors } = useQuery<Vendor[]>(
    'vendors',
    () => api.get('/vendors').then(res => res.data.vendors)
  )

  // Set form values when upsell data is loaded
  useEffect(() => {
    if (upsell) {
      setValue('property_id', upsell.property_id)
      setValue('primary_vendor_id', upsell.primary_vendor_id)
      setValue('secondary_vendor_id', upsell.secondary_vendor_id || null)
      setValue('title', upsell.title)
      setValue('description', upsell.description || '')
      setValue('price', upsell.price)
      setValue('category', upsell.category)
      setValue('image_url', upsell.image_url || '')
      setValue('availability_rules', upsell.availability_rules || {})
      setValue('is_active', upsell.is_active)
      setValue('sort_order', upsell.sort_order)
      if (upsell.image_url) {
        setImagePreview(upsell.image_url)
      }
    }
  }, [upsell, setValue])

  const createMutation = useMutation(
    (data: UpsellFormData) => api.post('/upsells', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('upsells')
        toast.success('Upsell created successfully!')
        navigate('/upsells')
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to create upsell'
        toast.error(message)
      }
    }
  )

  const updateMutation = useMutation(
    (data: UpsellFormData) => api.put(`/upsells/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('upsells')
        queryClient.invalidateQueries(['upsell', id])
        toast.success('Upsell updated successfully!')
        navigate('/upsells')
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to update upsell'
        toast.error(message)
      }
    }
  )

  const onSubmit = async (data: UpsellFormData) => {
    try {
      let imageUrl = data.image_url

      // If a new file is selected, upload it first
      if (selectedFile) {
        const formData = new FormData()
        formData.append('image', selectedFile)
        
        const uploadResponse = await api.post('/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        
        imageUrl = uploadResponse.data.url
      }

      const submitData = {
        ...data,
        image_url: imageUrl,
      }

      if (isEditing) {
        updateMutation.mutate(submitData)
      } else {
        createMutation.mutate(submitData)
      }
    } catch (error: any) {
      toast.error('Failed to upload image')
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      setSelectedFile(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (upsellLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="card p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate('/upsells')}
          className="mr-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Upsell' : 'Add New Upsell'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEditing ? 'Update upsell information' : 'Create a new upsell service'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Property *</label>
              <select
                {...register('property_id', { required: 'Property is required', valueAsNumber: true })}
                className="input"
              >
                <option value={0}>Select Property</option>
                {properties?.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              {errors.property_id && (
                <p className="mt-1 text-sm text-danger-600">{errors.property_id.message}</p>
              )}
            </div>

            <div>
              <label className="label">Primary Vendor *</label>
              <select
                {...register('primary_vendor_id', { required: 'Primary vendor is required', valueAsNumber: true })}
                className="input"
              >
                <option value={0}>Select Primary Vendor</option>
                {vendors?.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} ({vendor.service_type})
                  </option>
                ))}
              </select>
              {errors.primary_vendor_id && (
                <p className="mt-1 text-sm text-danger-600">{errors.primary_vendor_id.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="label">Secondary Vendor</label>
              <select
                {...register('secondary_vendor_id', { valueAsNumber: true })}
                className="input"
              >
                <option value={0}>No Secondary Vendor</option>
                {vendors?.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} ({vendor.service_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Category *</label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="input"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-danger-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="label">Title *</label>
            <input
              {...register('title', { required: 'Title is required' })}
              type="text"
              className="input"
              placeholder="Enter upsell title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-danger-600">{errors.title.message}</p>
            )}
          </div>

          <div className="mt-6">
            <label className="label">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="input"
              placeholder="Describe the upsell service..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="label">Price *</label>
              <input
                {...register('price', { 
                  required: 'Price is required', 
                  min: { value: 0, message: 'Price must be positive' },
                  valueAsNumber: true 
                })}
                type="number"
                step="0.01"
                className="input"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-danger-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="label">Sort Order</label>
              <input
                {...register('sort_order', { valueAsNumber: true })}
                type="number"
                className="input"
                placeholder="0"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="label">Service Image</label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Upsell preview"
                    className="h-48 w-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null)
                      setSelectedFile(null)
                      setValue('image_url', '')
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <span className="text-sm font-medium text-primary-600 hover:text-primary-500">
                        Upload an image
                      </span>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="sr-only"
                      />
                    </label>
                    <p className="text-xs text-gray-500">or drag and drop</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center">
              <input
                {...register('is_active')}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Active upsell
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/upsells')}
            className="btn-secondary btn-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isLoading || updateMutation.isLoading}
            className="btn-primary btn-md"
          >
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isLoading || updateMutation.isLoading
              ? 'Saving...'
              : isEditing
              ? 'Update Upsell'
              : 'Create Upsell'
            }
          </button>
        </div>
      </form>
    </div>
  )
}