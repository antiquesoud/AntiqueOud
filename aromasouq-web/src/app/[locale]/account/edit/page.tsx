'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Upload, Save, X } from 'lucide-react';
import axios from 'axios';
import { useTranslations } from 'next-intl';
import { User } from '@/types/user';

export default function EditProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations('account.editProfilePage');
  const tCommon = useTranslations('common');

  const { data: profile, isLoading } = useQuery<User>({
    queryKey: ['profile'],
    queryFn: async () => {
      return await apiClient.get('/users/profile');
    },
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    preferredLanguage: 'en',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone || '',
        preferredLanguage: profile.preferredLanguage,
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiClient.patch('/users/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      alert(t('profileUpdatedSuccess'));
      router.push('/account/profile');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || t('profileUpdateFailed'));
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      // Use axios directly for file upload
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/uploads/users/avatar`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      alert(t('avatarUploadedSuccess'));
      setAvatarFile(null);
      setPreviewUrl('');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || t('avatarUploadFailed'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(t('selectImageFile'));
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert(t('imageSizeExceeded'));
        return;
      }

      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadAvatar = () => {
    if (avatarFile) {
      uploadAvatarMutation.mutate(avatarFile);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-12 px-4">{t('loading')}</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Avatar Section */}
          <div className="mb-8 pb-8 border-b">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              {t('profilePicture')}
            </label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                {previewUrl || profile?.avatar ? (
                  <img
                    src={previewUrl || profile?.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Upload className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <div className="flex gap-2">
                  <label
                    htmlFor="avatar-upload"
                    className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  >
                    {t('chooseImage')}
                  </label>
                  {avatarFile && (
                    <button
                      type="button"
                      onClick={handleUploadAvatar}
                      disabled={uploadAvatarMutation.isPending}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {uploadAvatarMutation.isPending ? t('uploading') : t('upload')}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {t('imageRequirements')}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('firstName')} {t('required')}
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('lastName')} {t('required')}
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('phoneNumber')}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t('phonePlaceholder')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('preferredLanguage')}
              </label>
              <select
                value={formData.preferredLanguage}
                onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="en">{useTranslations('account.profilePage')('english')}</option>
                <option value="ar">{useTranslations('account.profilePage')('arabic')}</option>
              </select>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition font-medium flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {updateMutation.isPending ? t('saving') : t('saveChanges')}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
