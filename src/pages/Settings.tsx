import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useSearchParams } from 'react-router-dom'
import { 
  User, 
  Lock, 
  Save,
  Eye,
  EyeOff,
  CreditCard,
  CheckCircle,
  ExternalLink,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { api } from '../lib/api'
import type { User as UserType } from '../types'
import toast from 'react-hot-toast'

interface ProfileFormData {
  name: string
  email: string
}

interface PasswordFormData {
  current_password: string
  password: string
  password_confirmation: string
}

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'payments'>('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm<ProfileFormData>()
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordFormData>()

  const { data: user, isLoading } = useQuery<UserType>(
    'user-profile',
    () => api.get('/me').then(res => res.data.user)
  )

  // Check Stripe Connect status
  const { data: stripeStatus, refetch: refetchStripeStatus } = useQuery(
    'stripe-connect-status',
    () => api.get('/stripe/connect/status').then(res => res.data),
    {
      enabled: !!user,
      refetchInterval: 5000, // Check every 5 seconds when on payments tab
      refetchIntervalInBackground: false,
    }
  )

  // Handle Stripe Connect callbacks
  useEffect(() => {
    const stripeSuccess = searchParams.get('stripe_success')
    const stripeError = searchParams.get('stripe_error')
    const stripeRefresh = searchParams.get('stripe_refresh')
    
    if (stripeSuccess === 'true') {
      toast.success('Stripe Connect setup completed successfully!')
      refetchStripeStatus()
      queryClient.invalidateQueries('user-profile')
      // Remove the query parameter
      setSearchParams(prev => {
        prev.delete('stripe_success')
        return prev
      })
    }
    
    if (stripeError) {
      toast.error(`Stripe Connect setup failed: ${stripeError}`)
      refetchStripeStatus()
      // Remove the query parameter
      setSearchParams(prev => {
        prev.delete('stripe_error')
        return prev
      })
    }
    
    if (stripeRefresh === 'true') {
      toast('Please complete your Stripe Connect setup', { icon: 'ℹ️' })
      refetchStripeStatus()
      // Remove the query parameter
      setSearchParams(prev => {
        prev.delete('stripe_refresh')
        return prev
      })
    }
  }, [searchParams, refetchStripeStatus, queryClient, setSearchParams])

  const updateProfileMutation = useMutation(
    (data: ProfileFormData) => api.put('/profile', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-profile')
        toast.success('Profile updated successfully!')
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to update profile'
        toast.error(message)
      }
    }
  )

  const changePasswordMutation = useMutation(
    (data: PasswordFormData) => api.put('/change-password', data),
    {
      onSuccess: () => {
        resetPassword()
        toast.success('Password changed successfully!')
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to change password'
        toast.error(message)
      }
    }
  )

  const stripeConnectMutation = useMutation(
    () => api.post('/stripe/connect'),
    {
      onSuccess: (response) => {
        if (response.data.success) {
          if (response.data.onboarding_completed) {
            toast.success('Stripe account is already connected and ready!')
            refetchStripeStatus()
            queryClient.invalidateQueries('user-profile')
          } else if (response.data.oauth_url) {
            // Redirect to Stripe OAuth page
            window.location.href = response.data.oauth_url
            toast.success('Redirecting to Stripe Connect...')
          } else {
            toast.error('Failed to create Stripe Connect OAuth URL')
          }
        } else {
          toast.error(response.data.message || 'Failed to setup Stripe Connect')
        }
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to setup Stripe Connect'
        toast.error(message)
      }
    }
  )

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data)
  }

  const onPasswordSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data)
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
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Lock className="h-4 w-4 inline mr-2" />
            Password
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payments'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CreditCard className="h-4 w-4 inline mr-2" />
            Payments
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Profile Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Full Name</label>
                <input
                  {...registerProfile('name', { required: 'Name is required' })}
                  type="text"
                  defaultValue={user?.name || ''}
                  className="input"
                  placeholder="Enter your full name"
                />
                {profileErrors.name && (
                  <p className="mt-1 text-sm text-danger-600">{profileErrors.name.message}</p>
                )}
              </div>

              <div>
                <label className="label">Email Address</label>
                <input
                  {...registerProfile('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  defaultValue={user?.email || ''}
                  className="input"
                  placeholder="Enter your email address"
                />
                {profileErrors.email && (
                  <p className="mt-1 text-sm text-danger-600">{profileErrors.email.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="label">Account Type</label>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user?.role === 'admin' ? 'Administrator' : 'Property Owner'}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <label className="label">Member Since</label>
              <p className="text-sm text-gray-600">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateProfileMutation.isLoading}
              className="btn-primary btn-md"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Change Password</h3>
            
            <div className="space-y-6">
              <div>
                <label className="label">Current Password</label>
                <div className="relative">
                  <input
                    {...registerPassword('current_password', { required: 'Current password is required' })}
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {passwordErrors.current_password && (
                  <p className="mt-1 text-sm text-danger-600">{passwordErrors.current_password.message}</p>
                )}
              </div>

              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <input
                    {...registerPassword('password', { 
                      required: 'New password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' }
                    })}
                    type={showNewPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {passwordErrors.password && (
                  <p className="mt-1 text-sm text-danger-600">{passwordErrors.password.message}</p>
                )}
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <div className="relative">
                  <input
                    {...registerPassword('password_confirmation', { 
                      required: 'Password confirmation is required'
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {passwordErrors.password_confirmation && (
                  <p className="mt-1 text-sm text-danger-600">{passwordErrors.password_confirmation.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Password Requirements</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Mix of letters, numbers, and symbols recommended</li>
                <li>• Different from your current password</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={changePasswordMutation.isLoading}
              className="btn-primary btn-md"
            >
              <Lock className="h-4 w-4 mr-2" />
              {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Payment Setup</h3>
            
            <div className="space-y-6">
              {/* Stripe Connect Status */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <CreditCard className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Stripe Connect</h4>
                      <p className="text-sm text-gray-500">
                        Connect your Stripe account to receive payments from guests
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {stripeStatus?.onboarding_completed ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-5 w-5 mr-1" />
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                    ) : stripeStatus?.connected ? (
                      <div className="flex items-center text-yellow-600">
                        <AlertCircle className="h-5 w-5 mr-1" />
                        <span className="text-sm font-medium">Setup Incomplete</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-orange-600">
                        <span className="text-sm font-medium">Not Connected</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Status Details */}
                {stripeStatus?.connected && !stripeStatus?.onboarding_completed && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                      <h5 className="text-sm font-medium text-yellow-900 mb-2">Setup Incomplete</h5>
                      <p className="text-sm text-yellow-800 mb-3">
                        Your Stripe account is created but needs additional information to be fully activated.
                      </p>
                      <div className="space-y-2 text-sm text-yellow-800">
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${stripeStatus.details_submitted ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                          Details Submitted: {stripeStatus.details_submitted ? 'Yes' : 'No'}
                        </div>
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${stripeStatus.charges_enabled ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                          Charges Enabled: {stripeStatus.charges_enabled ? 'Yes' : 'No'}
                        </div>
                        <div className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${stripeStatus.payouts_enabled ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                          Payouts Enabled: {stripeStatus.payouts_enabled ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => stripeConnectMutation.mutate()}
                        disabled={stripeConnectMutation.isLoading}
                        className="btn-primary btn-md"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {stripeConnectMutation.isLoading ? 'Setting up...' : 'Complete Setup'}
                      </button>
                      <button
                        onClick={() => refetchStripeStatus()}
                        disabled={stripeConnectMutation.isLoading}
                        className="btn-secondary btn-md"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Status
                      </button>
                    </div>
                  </div>
                )}
                
                {!stripeStatus?.connected && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="bg-orange-50 rounded-lg p-4 mb-4">
                      <h5 className="text-sm font-medium text-orange-900 mb-2">Setup Required</h5>
                      <p className="text-sm text-orange-800">
                        You need to connect your Stripe account before guests can make payments. 
                        This is required to receive payments for your upsell services.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => stripeConnectMutation.mutate()}
                      disabled={stripeConnectMutation.isLoading}
                      className="btn-primary btn-md"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {stripeConnectMutation.isLoading ? 'Setting up...' : 'Connect Stripe Account'}
                    </button>
                  </div>
                )}
                
                {stripeStatus?.onboarding_completed && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-green-900 mb-2">Account Connected</h5>
                      <p className="text-sm text-green-800">
                        Your Stripe account is connected and ready to receive payments. 
                        Guests can now make payments for your upsell services.
                      </p>
                      {stripeStatus.account_id && (
                        <p className="text-xs text-green-700 mt-2">
                          Account ID: {stripeStatus.account_id}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Information */}
              <div className="border rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Platform Fee:</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment Processing:</span>
                    <span className="text-sm font-medium">Stripe</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payout Schedule:</span>
                    <span className="text-sm font-medium">2-7 business days</span>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="border rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Stripe Connect allows you to receive payments directly to your bank account</p>
                  <p>• You'll need to provide business information and bank details</p>
                  <p>• The setup process typically takes 5-10 minutes</p>
                  <p>• Contact support if you encounter any issues during setup</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}