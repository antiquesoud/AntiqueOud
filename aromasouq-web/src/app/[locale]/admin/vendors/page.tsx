'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search, ExternalLink, CheckCircle, XCircle, Ban, Play } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useVendorApprovals } from '@/hooks/admin/use-vendor-approvals'
import { formatDate } from '@/lib/utils'
import { Link } from '@/i18n/navigation'

export default function VendorsPage() {
  const t = useTranslations('admin.vendors')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<string>('PENDING')
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; vendorId?: string }>({ open: false })
  const [suspendDialog, setSuspendDialog] = useState<{ open: boolean; vendorId?: string }>({ open: false })
  const [rejectionReason, setRejectionReason] = useState('')
  const [suspensionReason, setSuspensionReason] = useState('')

  const { vendors, isLoading, approve, reject, suspend, isProcessing } = useVendorApprovals({
    search: search || undefined,
    status: activeTab === 'ALL' ? undefined : activeTab as any,
  })

  // Debug: Log vendors data
  console.log('Vendors data:', vendors, 'isLoading:', isLoading)

  const handleApprove = (vendorId: string) => {
    if (confirm(t('approveConfirm'))) {
      approve(vendorId)
    }
  }

  const handleRejectClick = (vendorId: string) => {
    setRejectDialog({ open: true, vendorId })
    setRejectionReason('')
  }

  const handleRejectConfirm = () => {
    if (rejectDialog.vendorId && rejectionReason.trim()) {
      reject({ vendorId: rejectDialog.vendorId, reason: rejectionReason })
      setRejectDialog({ open: false })
      setRejectionReason('')
    }
  }

  const handleSuspendClick = (vendorId: string) => {
    setSuspendDialog({ open: true, vendorId })
    setSuspensionReason('')
  }

  const handleSuspendConfirm = () => {
    if (suspendDialog.vendorId && suspensionReason.trim()) {
      suspend({ vendorId: suspendDialog.vendorId, reason: suspensionReason })
      setSuspendDialog({ open: false })
      setSuspensionReason('')
    }
  }

  const handleReactivate = (vendorId: string) => {
    if (confirm(t('reactivateConfirm'))) {
      approve(vendorId)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-[#B3967D]/100 text-[#B3967D]/800 border-yellow-200">{t('statusPending')}</Badge>
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{t('statusApproved')}</Badge>
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">{t('statusRejected')}</Badge>
      case 'SUSPENDED':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{t('statusSuspended')}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const vendorsArray = Array.isArray(vendors) ? vendors : []
  const pendingCount = vendorsArray.filter((v: any) => v.status === 'PENDING').length
  const approvedCount = vendorsArray.filter((v: any) => v.status === 'APPROVED').length
  const rejectedCount = vendorsArray.filter((v: any) => v.status === 'REJECTED').length
  const suspendedCount = vendorsArray.filter((v: any) => v.status === 'SUSPENDED').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-deep-navy">{t('title')}</h1>
        <p className="text-gray-600 mt-1">{t('subtitle')}</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ALL">{t('all')}</TabsTrigger>
          <TabsTrigger value="PENDING">
            {t('pending')} {pendingCount > 0 && `(${pendingCount})`}
          </TabsTrigger>
          <TabsTrigger value="APPROVED">{t('approved')} ({approvedCount})</TabsTrigger>
          <TabsTrigger value="REJECTED">{t('rejected')} ({rejectedCount})</TabsTrigger>
          <TabsTrigger value="SUSPENDED">{t('suspended')} ({suspendedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('vendors')} ({vendorsArray.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">{t('loading')}</div>
              ) : vendorsArray.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">{t('noVendorsFound')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('businessName')}</TableHead>
                        <TableHead>{t('contact')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                        <TableHead>{t('applied')}</TableHead>
                        <TableHead className="text-right">{t('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendorsArray.map((vendor: any) => (
                        <TableRow key={vendor.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{vendor.businessName || `${vendor.user?.firstName} ${vendor.user?.lastName}`}</p>
                              {vendor.businessLicense && (
                                <p className="text-xs text-muted-foreground">
                                  {t('license')}: {vendor.businessLicense}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{vendor.user?.firstName} {vendor.user?.lastName}</p>
                              <p className="text-xs text-muted-foreground">{vendor.user?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(vendor.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/admin/vendors/${vendor.id}/review`}>
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  {t('review')}
                                </Link>
                              </Button>
                              {vendor.status === 'PENDING' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(vendor.id)}
                                    disabled={isProcessing}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    {t('approve')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRejectClick(vendor.id)}
                                    disabled={isProcessing}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    {t('reject')}
                                  </Button>
                                </>
                              )}
                              {vendor.status === 'APPROVED' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSuspendClick(vendor.id)}
                                  disabled={isProcessing}
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  {t('suspend')}
                                </Button>
                              )}
                              {vendor.status === 'SUSPENDED' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleReactivate(vendor.id)}
                                  disabled={isProcessing}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  {t('reactivate')}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rejectDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('rejectDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">{t('rejectionReason')}</Label>
              <Textarea
                id="reason"
                placeholder={t('rejectionReasonPlaceholder')}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false })}>
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectionReason.trim() || isProcessing}
            >
              {t('rejectApplication')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspension Dialog */}
      <Dialog open={suspendDialog.open} onOpenChange={(open) => setSuspendDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('suspendDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('suspendDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="suspend-reason">{t('suspensionReason')}</Label>
              <Textarea
                id="suspend-reason"
                placeholder={t('suspensionReasonPlaceholder')}
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialog({ open: false })}>
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspendConfirm}
              disabled={!suspensionReason.trim() || isProcessing}
            >
              {t('suspendVendor')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
