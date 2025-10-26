import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateUniqueToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function downloadCSV(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export async function exportAccountingData(period: number = 30): Promise<void> {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    const token = localStorage.getItem('token')
    
    const response = await fetch(`${API_BASE_URL}/dashboard/export-accounting?period=${period}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/csv',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to export data: ${response.status} ${response.statusText}`)
    }

    const csvData = await response.text()
    const filename = `accounting_data_${new Date().toISOString().split('T')[0]}_${period}days.csv`
    
    downloadCSV(csvData, filename)
  } catch (error) {
    console.error('Export failed:', error)
    throw error
  }
}

export async function exportOrdersData(filters: { status?: string; date?: string; vendor?: string } = {}): Promise<void> {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    const token = localStorage.getItem('token')
    
    console.log('Exporting orders with:', { API_BASE_URL, filters, token: token ? 'present' : 'missing' })
    
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.date) params.append('date', filters.date)
    if (filters.vendor) params.append('vendor', filters.vendor)
    
    const url = `${API_BASE_URL}/orders/export?${params.toString()}`
    console.log('Export URL:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/csv',
      },
    })

    console.log('Export response:', { status: response.status, statusText: response.statusText })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Export error response:', errorText)
      throw new Error(`Failed to export orders: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const csvData = await response.text()
    console.log('CSV data received:', csvData.substring(0, 200) + '...')
    
    const filename = `orders_export_${new Date().toISOString().split('T')[0]}.csv`
    
    downloadCSV(csvData, filename)
  } catch (error) {
    console.error('Orders export failed:', error)
    throw error
  }
}