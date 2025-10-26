import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { api } from '../lib/api'
import type { Vendor } from '../types'
import toast from 'react-hot-toast'

interface VendorFormData {
  name: string
  email: string
  whatsapp_number: string
  phone: string
  description: string
  service_type: string
  is_active: boolean
}

const serviceTypes = [
  'chef',
  'transport',
  'cleaning',
  'concierge',
  'maintenance',
  'security',
  'entertainment',
  'wellness',
  'other'
]

export const VendorForm: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditing = Boolean(id)

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<VendorFormData>({
    defaultValues: {
      name: '',
      email: '',
      whatsapp_number: '',
      phone: '',
      description: '',
      service_type: 'chef',
      is_active: true,
    }
  })

  // Fetch vendor data if editing
  const { data: vendor, isLoading } = useQuery<Vendor>(
    ['vendor', id],
    () => api.get(`/vendors/${id}`).then(res => res.data.vendor),
    { enabled: isEditing }
  )

  // Set form values when vendor data is loaded
  useEffect(() => {
    if (vendor) {
      setValue('name', vendor.name)
      setValue('email', vendor.email)
      setValue('whatsapp_number', vendor.whatsapp_number || '')
      setValue('phone', vendor.phone || '')
      setValue('description', vendor.description || '')
      setValue('service_type', vendor.service_type)
      setValue('is_active', vendor.is_active)
    }
  }, [vendor, setValue])

  const createMutation = useMutation(
    (data: VendorFormData) => api.post('/vendors', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vendors')
        toast.success('Vendor created successfully!')
        navigate('/vendors')
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to create vendor'
        toast.error(message)
      }
    }
  )

  const updateMutation = useMutation(
    (data: VendorFormData) => api.put(`/vendors/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vendors')
        queryClient.invalidateQueries(['vendor', id])
        toast.success('Vendor updated successfully!')
        navigate('/vendors')
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to update vendor'
        toast.error(message)
      }
    }
  )

  const onSubmit = (data: VendorFormData) => {
    if (isEditing) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
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
      <div className="flex items-center">
        <button
          onClick={() => navigate('/vendors')}
          className="mr-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Vendor' : 'Add New Vendor'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEditing ? 'Update vendor information' : 'Create a new vendor profile'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Vendor Name *</label>
              <input
                {...register('name', { required: 'Vendor name is required' })}
                type="text"
                className="input"
                placeholder="Enter vendor name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="label">Email Address *</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="input"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="label">Phone Number</label>
              <input
                {...register('phone')}
                type="tel"
                className="input"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="label">WhatsApp Number</label>
              <input
                {...register('whatsapp_number')}
                type="tel"
                className="input"
                placeholder="Enter WhatsApp number"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="label">Service Type *</label>
            <select
              {...register('service_type', { required: 'Service type is required' })}
              className="input"
            >
              {serviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {errors.service_type && (
              <p className="mt-1 text-sm text-danger-600">{errors.service_type.message}</p>
            )}
          </div>

          <div className="mt-6">
            <label className="label">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="input"
              placeholder="Describe the vendor's services..."
            />
          </div>

          <div className="mt-6">
            <div className="flex items-center">
              <input
                {...register('is_active')}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Active vendor
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/vendors')}
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
              ? 'Update Vendor'
              : 'Create Vendor'
            }
          </button>
        </div>
      </form>
    </div>
  )
}