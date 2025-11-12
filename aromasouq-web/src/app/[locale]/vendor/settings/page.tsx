"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import toast from "react-hot-toast"
import { Building2, Globe, Bell, User, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"

// Vendor update schema
const vendorUpdateSchema = z.object({
  businessName: z.string().min(3, "Business name must be at least 3 characters"),
  businessEmail: z.string().email("Invalid email address"),
  businessPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  businessNameAr: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
  tradeLicense: z.string().optional(),
  taxNumber: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  instagramUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  facebookUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitterUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  whatsappNumber: z.string().optional(),
})

type VendorUpdateInput = z.infer<typeof vendorUpdateSchema>

export default function VendorSettingsPage() {
  const t = useTranslations('vendor.settings')
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("business")
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<VendorUpdateInput>({
    resolver: zodResolver(vendorUpdateSchema),
  })

  // Fetch vendor profile
  const { data: vendor, isLoading: isLoadingVendor } = useQuery({
    queryKey: ['vendor-profile'],
    queryFn: () => apiClient.get<any>('/vendor/profile'),
  })

  // Populate form when vendor data is loaded
  useEffect(() => {
    if (vendor) {
      form.reset({
        businessName: vendor.businessName || "",
        businessEmail: vendor.businessEmail || "",
        businessPhone: vendor.businessPhone || "",
        businessNameAr: vendor.businessNameAr || "",
        description: vendor.description || "",
        descriptionAr: vendor.descriptionAr || "",
        tradeLicense: vendor.tradeLicense || "",
        taxNumber: vendor.taxNumber || "",
        website: vendor.website || "",
        instagramUrl: vendor.instagramUrl || "",
        facebookUrl: vendor.facebookUrl || "",
        twitterUrl: vendor.twitterUrl || "",
        whatsappNumber: vendor.whatsappNumber || "",
      })
    }
  }, [vendor, form])

  const updateMutation = useMutation({
    mutationFn: (data: VendorUpdateInput) => apiClient.patch('/vendor/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-profile'] })
      toast.success(t('profileUpdated'))
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('failedToUpdate'))
    },
  })

  const onSubmit = (data: VendorUpdateInput) => {
    updateMutation.mutate(data)
  }

  if (isLoadingVendor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-oud-gold" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        {vendor && (
          <Badge variant={vendor.status === 'APPROVED' ? 'default' : 'secondary'}>
            {vendor.status}
          </Badge>
        )}
      </div>

      {/* Account Status Notice */}
      {vendor?.status === 'PENDING' && (
        <Card className="border-yellow-500 bg-[#B3967D]/50">
          <CardContent className="p-4">
            <p className="text-sm text-[#B3967D]/800">
              <strong>{t('pendingApproval')}</strong> {t('pendingApprovalDesc')}
            </p>
          </CardContent>
        </Card>
      )}

      {vendor?.status === 'REJECTED' && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-800">
              <strong>{t('rejected')}</strong> {t('rejectedDesc')}
            </p>
          </CardContent>
        </Card>
      )}

      {vendor?.status === 'SUSPENDED' && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-800">
              <strong>{t('suspended')}</strong> {t('suspendedDesc')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Settings Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="business">
                <Building2 className="h-4 w-4 mr-2" />
                {t('tabBusiness')}
              </TabsTrigger>
              <TabsTrigger value="social">
                <Globe className="h-4 w-4 mr-2" />
                {t('tabSocial')}
              </TabsTrigger>
              <TabsTrigger value="documents">
                {t('tabDocuments')}
              </TabsTrigger>
              <TabsTrigger value="account">
                <User className="h-4 w-4 mr-2" />
                {t('tabAccount')}
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Business Information */}
            <TabsContent value="business">
              <Card>
                <CardHeader>
                  <CardTitle>{t('businessInformation')}</CardTitle>
                  <CardDescription>
                    {t('businessInformationDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('businessNameEn')} *</FormLabel>
                          <FormControl>
                            <Input placeholder={t('businessNameEnPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessNameAr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('businessNameAr')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('businessNameArPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('descriptionEn')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('descriptionEnPlaceholder')}
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('descriptionEnDesc')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descriptionAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('descriptionAr')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('descriptionArPlaceholder')}
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="businessEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('businessEmail')} *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder={t('businessEmailPlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('businessPhone')} *</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder={t('businessPhonePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('whatsappNumber')}</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder={t('whatsappNumberPlaceholder')} {...field} />
                        </FormControl>
                        <FormDescription>
                          {t('whatsappNumberDesc')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Social Media */}
            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <CardTitle>{t('socialMediaWebsite')}</CardTitle>
                  <CardDescription>
                    {t('socialMediaWebsiteDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('website')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('websitePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="instagramUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('instagram')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('instagramPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="facebookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('facebook')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('facebookPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="twitterUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('twitter')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('twitterPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Documents */}
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>{t('businessDocuments')}</CardTitle>
                  <CardDescription>
                    {t('businessDocumentsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="tradeLicense"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('tradeLicense')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('tradeLicensePlaceholder')} {...field} />
                        </FormControl>
                        <FormDescription>
                          {t('tradeLicenseDesc')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('taxNumber')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('taxNumberPlaceholder')} {...field} />
                        </FormControl>
                        <FormDescription>
                          {t('taxNumberDesc')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <p className="text-sm text-blue-800">
                      <strong>{t('documentsNote')}</strong> {t('documentsNoteDesc')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Account Information */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>{t('accountInformation')}</CardTitle>
                  <CardDescription>
                    {t('accountInformationDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('vendorId')}</p>
                      <p className="text-sm font-mono">{vendor?.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('accountStatus')}</p>
                      <Badge variant={vendor?.status === 'APPROVED' ? 'default' : 'secondary'}>
                        {vendor?.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('memberSince')}</p>
                      <p className="text-sm">
                        {vendor?.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('totalProducts')}</p>
                      <p className="text-sm">{vendor?._count?.products || 0}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('userName')}</p>
                      <p className="text-sm">
                        {vendor?.user?.firstName} {vendor?.user?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{t('userEmail')}</p>
                      <p className="text-sm">{vendor?.user?.email}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
                    <p className="text-sm text-gray-700">
                      <strong>{t('needHelp')}</strong> {t('needHelpDesc')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              variant="primary"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? t('saving') : t('saveChanges')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
