'use client'

import { useParams, useRouter } from '@/i18n/navigation'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeft, CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useVendorApprovals } from '@/hooks/admin/use-vendor-approvals'
import { formatDate } from '@/lib/utils'
import { Link } from '@/i18n/navigation'

export default function VendorReviewPage() {
  const t = useTranslations('admin.vendorReview')
  const params = useParams()
  const router = useRouter()
  const vendorId = params.id as string
  const [rejectDialog, setRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const { approve, reject, isProcessing } = useVendorApprovals()

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor-application', vendorId],
    queryFn: () => apiClient.get<any>(`/admin/vendors/${vendorId}`),
  })

  const handleApprove = () => {
    if (confirm(t('approveConfirm'))) {
      approve(vendorId, {
        onSuccess: () => router.push('/admin/vendors'),
      } as any)
    }
  }

  const handleRejectConfirm = () => {
    if (rejectionReason.trim()) {
      reject({ vendorId, reason: rejectionReason }, {
        onSuccess: () => {
          setRejectDialog(false)
          router.push('/admin/vendors')
        },
      } as any)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">{t('loading')}</div>
  }

  if (!vendor) {
    return <div className="flex items-center justify-center min-h-[400px]">{t('vendorNotFound')}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/vendors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-heading font-bold text-deep-navy">
            {t('title')}
          </h1>
          <p className="text-gray-600 mt-1">{vendor.businessName || `${vendor.user?.firstName} ${vendor.user?.lastName}`}</p>
        </div>
        {vendor.status === 'PENDING' && (
          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {t('approve')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setRejectDialog(true)}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t('reject')}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('businessInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t('businessName')}</Label>
                  <p className="font-medium mt-1">{vendor.businessName || t('na')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('businessEmail')}</Label>
                  <p className="font-medium mt-1">{vendor.businessEmail || t('na')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('businessPhone')}</Label>
                  <p className="font-medium mt-1">{vendor.businessPhone || t('na')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('tradeLicense')}</Label>
                  <p className="font-medium mt-1">{vendor.tradeLicense || t('na')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('taxNumber')}</Label>
                  <p className="font-medium mt-1">{vendor.taxNumber || t('na')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('contactPerson')}</Label>
                  <p className="font-medium mt-1">{vendor.user?.firstName} {vendor.user?.lastName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('email')}</Label>
                  <p className="font-medium mt-1">{vendor.user?.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('phone')}</Label>
                  <p className="font-medium mt-1">{vendor.user?.phone || t('na')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Details */}
          {vendor.bankDetails && (
            <Card>
              <CardHeader>
                <CardTitle>{t('bankDetails')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">{t('accountName')}</Label>
                    <p className="font-medium mt-1">{vendor.bankDetails.accountName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('bankName')}</Label>
                    <p className="font-medium mt-1">{vendor.bankDetails.bankName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('accountNumber')}</Label>
                    <p className="font-medium mt-1">{vendor.bankDetails.accountNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('iban')}</Label>
                    <p className="font-medium mt-1">{vendor.bankDetails.iban}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>{t('documents')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vendor.taxDocument ? (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{t('taxDocument')}</p>
                    <p className="text-sm text-muted-foreground">{t('vatCertificate')}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={vendor.taxDocument} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('view')}
                    </a>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t('noDocuments')}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>{t('applicationStatus')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">{t('status')}</Label>
                <div className="mt-2">
                  <Badge variant="outline" className="bg-[#B3967D]/100 text-[#B3967D]/800 border-yellow-200">
                    {vendor.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">{t('appliedOn')}</Label>
                <p className="font-medium mt-1">{formatDate(vendor.appliedAt || vendor.createdAt)}</p>
              </div>
              {vendor.reviewedAt && (
                <div>
                  <Label className="text-muted-foreground">{t('reviewedOn')}</Label>
                  <p className="font-medium mt-1">{formatDate(vendor.reviewedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rejection Reason (if rejected) */}
          {vendor.status === 'REJECTED' && vendor.rejectionReason && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800">{t('rejectionReason')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">{vendor.rejectionReason}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rejectDialogTitle')}</DialogTitle>
            <DialogDescription>
              {t('rejectDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">{t('rejectionReasonLabel')}</Label>
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
            <Button variant="outline" onClick={() => setRejectDialog(false)}>
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
    </div>
  )
}
