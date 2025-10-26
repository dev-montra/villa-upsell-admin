import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { ArrowLeft, Upload, X, Copy, ExternalLink, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import type { Property } from '../types'
import toast from 'react-hot-toast'

interface PropertyFormData {
  name: string
  description: string
  instagram_url: string
  language: string
  currency: string
  tags: string[]
  hero_image_url?: string
  payment_processor: 'stripe' | 'wise'
  payout_schedule: 'manual' | 'weekly' | 'monthly'
  wise_account_details?: {
    bank_name?: string
    account_number?: string
    routing_number?: string
    swift_code?: string
    account_holder_name?: string
    instructions?: string
  }
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
]

const currencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'JPY', name: 'Japanese Yen' },
]

export const PropertyForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = Boolean(id)
  
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PropertyFormData>({
    defaultValues: {
      name: '',
      description: '',
      instagram_url: '',
      language: 'en',
      currency: 'USD',
      tags: [],
      payment_processor: 'stripe',
      payout_schedule: 'manual',
      wise_account_details: {
        bank_name: '',
        account_number: '',
        routing_number: '',
        swift_code: '',
        account_holder_name: '',
        instructions: '',
      },
    }
  })

  const watchedTags = watch('tags')

  // Fetch property data if editing
  const { data: property, isLoading } = useQuery<Property>(
    ['property', id],
    () => api.get(`/properties/${id}`).then(res => res.data.property),
    { enabled: isEditing }
  )

  // Set form values when property data is loaded
  useEffect(() => {
    if (property) {
      
      setValue('name', property.name)
      setValue('description', property.description || '')
      setValue('instagram_url', property.instagram_url || '')
      setValue('language', property.language)
      setValue('currency', property.currency)
      setValue('tags', property.tags || [])
      setValue('payment_processor', property.payment_processor || 'stripe')
      setValue('payout_schedule', property.payout_schedule || 'manual')
      setValue('wise_account_details', property.wise_account_details || {
        bank_name: '',
        account_number: '',
        routing_number: '',
        swift_code: '',
        account_holder_name: '',
        instructions: '',
      })
      
      if (property.hero_image_url) {
        setImagePreview(property.hero_image_url)
        setValue('hero_image_url', property.hero_image_url)
      } else {
      }
    }
  }, [property, setValue])

  // Debug imagePreview state
  useEffect(() => {
  }, [imagePreview])

  const createMutation = useMutation(
    (data: PropertyFormData) => api.post('/properties', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('properties')
        toast.success('Property created successfully!')
        navigate('/properties')
      },
      onError: () => {
        toast.error('Failed to create property')
      }
    }
  )

  const updateMutation = useMutation(
    (data: PropertyFormData) => api.put(`/properties/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('properties')
        queryClient.invalidateQueries(['property', id])
        toast.success('Property updated successfully!')
        navigate('/properties')
      },
      onError: () => {
        toast.error('Failed to update property')
      }
    }
  )

  const deleteMutation = useMutation(
    () => api.delete(`/properties/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('properties')
        toast.success('Property deleted successfully!')
        navigate('/properties')
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to delete property'
        toast.error(message)
      }
    }
  )

  const onSubmit = async (data: PropertyFormData) => {
    try {
      let imageUrl = data.hero_image_url

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
        hero_image_url: imageUrl,
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

  const addTag = () => {
    if (tagInput.trim() && !watchedTags?.includes(tagInput.trim())) {
      setValue('tags', [...(watchedTags || []), tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setValue('tags', watchedTags?.filter(tag => tag !== tagToRemove) || [])
  }

  const copyCheckInLink = async () => {
    if (!property?.access_token) {
      toast.error('No check-in link available')
      return
    }

    // Copy only the access token, not the full URL
    const accessToken = property.access_token
    
    try {
      await navigator.clipboard.writeText(accessToken)
      toast.success('Access token copied to clipboard!')
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = accessToken
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('Access token copied to clipboard!')
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      deleteMutation.mutate()
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

  if (isLoading) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/properties')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Property' : 'Add New Property'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing ? 'Update property information' : 'Create a new villa property'}
            </p>
          </div>
        </div>
        
        {/* Copy Link Button - Only show when editing and property has access_token */}
        {isEditing && property?.access_token && (
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={copyCheckInLink}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Access Token
            </button>
            <a
              href={`${import.meta.env.VITE_GUEST_APP_URL || 'http://localhost:4000'}/checkin/${property.access_token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview
            </a>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Property Name *</label>
              <input
                {...register('name', { required: 'Property name is required' })}
                type="text"
                className="input"
                placeholder="Enter property name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="label">Instagram URL</label>
              <input
                {...register('instagram_url', {
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: 'Please enter a valid URL'
                  }
                })}
                type="url"
                className="input"
                placeholder="https://instagram.com/yourproperty"
              />
              {errors.instagram_url && (
                <p className="mt-1 text-sm text-danger-600">{errors.instagram_url.message}</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <label className="label">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="input"
              placeholder="Describe your property..."
            />
          </div>

          <div className="mt-6">
            <label className="label">Hero Image</label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Property preview"
                    className="h-48 w-full object-cover rounded-lg"
                    onLoad={() => {}}
                    onError={() => {}}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null)
                      setSelectedFile(null)
                      setValue('hero_image_url', '')
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
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Language *</label>
              <select {...register('language', { required: 'Language is required' })} className="input">
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              {errors.language && (
                <p className="mt-1 text-sm text-danger-600">{errors.language.message}</p>
              )}
            </div>

            <div>
              <label className="label">Currency *</label>
              <select {...register('currency', { required: 'Currency is required' })} className="input">
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.name} ({curr.code})
                  </option>
                ))}
              </select>
              {errors.currency && (
                <p className="mt-1 text-sm text-danger-600">{errors.currency.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Settings</h3>
          
          <div className="space-y-6">
            <div>
              <label className="label">Payment Processor *</label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    {...register('payment_processor', { required: 'Payment processor is required' })}
                    type="radio"
                    value="stripe"
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Stripe</div>
                    <div className="text-sm text-gray-500">Automatic payment processing with instant confirmation</div>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('payment_processor', { required: 'Payment processor is required' })}
                    type="radio"
                    value="wise"
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Wise</div>
                    <div className="text-sm text-gray-500">Manual bank transfer with manual confirmation</div>
                  </div>
                </label>
              </div>
              {errors.payment_processor && (
                <p className="mt-1 text-sm text-danger-600">{errors.payment_processor.message}</p>
              )}
            </div>

            <div>
              <label className="label">Payout Schedule *</label>
              <select {...register('payout_schedule', { required: 'Payout schedule is required' })} className="input">
                <option value="manual">Manual (On Demand)</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              {errors.payout_schedule && (
                <p className="mt-1 text-sm text-danger-600">{errors.payout_schedule.message}</p>
              )}
            </div>

            {/* Wise Account Details - Only show when Wise is selected */}
            {watch('payment_processor') === 'wise' && (
              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">Wise Account Details</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Provide your bank account details for guests to make payments
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Bank Name</label>
                    <input
                      {...register('wise_account_details.bank_name')}
                      type="text"
                      className="input"
                      placeholder="e.g., Chase Bank"
                    />
                  </div>
                  <div>
                    <label className="label">Account Holder Name</label>
                    <input
                      {...register('wise_account_details.account_holder_name')}
                      type="text"
                      className="input"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="label">Account Number</label>
                    <input
                      {...register('wise_account_details.account_number')}
                      type="text"
                      className="input"
                      placeholder="Account number"
                    />
                  </div>
                  <div>
                    <label className="label">Routing Number</label>
                    <input
                      {...register('wise_account_details.routing_number')}
                      type="text"
                      className="input"
                      placeholder="Routing number"
                    />
                  </div>
                  <div>
                    <label className="label">SWIFT Code (International)</label>
                    <input
                      {...register('wise_account_details.swift_code')}
                      type="text"
                      className="input"
                      placeholder="SWIFT code"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="label">Payment Instructions</label>
                  <textarea
                    {...register('wise_account_details.instructions')}
                    rows={3}
                    className="input"
                    placeholder="Additional instructions for guests making payments..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
          <p className="text-sm text-gray-500 mb-4">
            Add tags to organize and filter your properties
          </p>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="input flex-1"
              placeholder="Enter a tag"
            />
            <button
              type="button"
              onClick={addTag}
              className="btn-secondary btn-md"
            >
              Add Tag
            </button>
          </div>

          {watchedTags && watchedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {watchedTags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          {/* Delete button - only show when editing */}
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isLoading}
              className="btn-danger btn-md flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteMutation.isLoading ? 'Deleting...' : 'Delete Property'}
            </button>
          )}
          
          {/* Action buttons */}
          <div className="flex space-x-4 ml-auto">
            <button
              type="button"
              onClick={() => navigate('/properties')}
              className="btn-secondary btn-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="btn-primary btn-md"
            >
              {createMutation.isLoading || updateMutation.isLoading
                ? 'Saving...'
                : isEditing
                ? 'Update Property'
                : 'Create Property'
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}