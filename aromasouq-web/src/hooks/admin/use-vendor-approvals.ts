'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { User } from '@/types'
import { VendorStatus } from '@/lib/constants'
import toast from 'react-hot-toast'

interface VendorApplication {
  id: string
  businessName?: string
  businessLicense?: string
  taxDocument?: string
  bankDetails?: {
    accountName: string
    accountNumber: string
    bankName: string
    iban: string
  }
  appliedAt: string
  createdAt: string
  reviewedAt?: string
  rejectionReason?: string
  user?: {
    firstName: string
    lastName: string
    email: string
  }
}

interface VendorFilters {
  status?: VendorStatus
  search?: string
  page?: number
  limit?: number
}

interface VendorsResponse {
  data: VendorApplication[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export function useVendorApprovals(filters: VendorFilters = {}) {
  const queryClient = useQueryClient()

  const vendorsQuery = useQuery<VendorsResponse>({
    queryKey: ['admin-vendor-approvals', filters],
    queryFn: () => apiClient.get('/admin/vendors', filters),
  })

  const approveMutation = useMutation({
    mutationFn: (vendorId: string) =>
      apiClient.patch(`/admin/vendors/${vendorId}/status`, { status: 'APPROVED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-approvals'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast.success('Vendor approved successfully')
    },
    onError: () => {
      toast.error('Failed to approve vendor')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ vendorId, reason }: { vendorId: string; reason: string }) =>
      apiClient.patch(`/admin/vendors/${vendorId}/status`, { status: 'REJECTED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-approvals'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast.success('Vendor rejected successfully')
    },
    onError: () => {
      toast.error('Failed to reject vendor')
    },
  })

  const suspendMutation = useMutation({
    mutationFn: ({ vendorId, reason }: { vendorId: string; reason: string }) =>
      apiClient.patch(`/admin/vendors/${vendorId}/status`, { status: 'SUSPENDED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendor-approvals'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast.success('Vendor suspended successfully')
    },
    onError: () => {
      toast.error('Failed to suspend vendor')
    },
  })

  return {
    vendors: vendorsQuery.data?.data || [],
    pagination: vendorsQuery.data?.meta,
    isLoading: vendorsQuery.isLoading,
    approve: approveMutation.mutate,
    reject: rejectMutation.mutate,
    suspend: suspendMutation.mutate,
    isProcessing: approveMutation.isPending || rejectMutation.isPending || suspendMutation.isPending,
  }
}
