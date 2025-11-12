'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useCategories, Category, CreateCategoryDto } from '@/hooks/admin/use-categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Plus, ChevronRight, Folder, FolderOpen } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function AdminCategoriesPage() {
  const t = useTranslations('admin.categories')
  const { categories, isLoading, createCategory, updateCategory, deleteCategory, toggleStatus } = useCategories()

  const [showDialog, setShowDialog] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  const [formData, setFormData] = useState<CreateCategoryDto>({
    name: '',
    nameAr: '',
    slug: '',
    description: '',
    descriptionAr: '',
    icon: '',
    image: '',
    parentId: undefined,
    sortOrder: 0,
    isActive: true,
  })

  // Generate slug from name
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCategory) {
      updateCategory(
        { id: editingCategory.id, data: formData },
        {
          onSuccess: () => {
            setShowDialog(false)
            resetForm()
          },
        }
      )
    } else {
      createCategory(formData, {
        onSuccess: () => {
          setShowDialog(false)
          resetForm()
        },
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      slug: '',
      description: '',
      descriptionAr: '',
      icon: '',
      image: '',
      parentId: undefined,
      sortOrder: 0,
      isActive: true,
    })
    setEditingCategory(null)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      nameAr: category.nameAr || '',
      slug: category.slug,
      description: category.description || '',
      descriptionAr: category.descriptionAr || '',
      icon: category.icon || '',
      image: category.image || '',
      parentId: category.parentId || undefined,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    })
    setShowDialog(true)
  }

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setCategoryToDelete(null)
        },
      })
    }
  }

  // Render hierarchical category tree
  const renderCategoryRow = (category: Category, level: number = 0): React.ReactNode => {
    return (
      <React.Fragment key={category.id}>
        <TableRow>
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
              {level > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
              {category.children && category.children.length > 0 ? (
                <FolderOpen className="h-4 w-4 text-[#B3967D]/600" />
              ) : (
                <Folder className="h-4 w-4 text-gray-400" />
              )}
              <span className="font-medium">{category.name}</span>
              {category.nameAr && (
                <span className="text-sm text-gray-500">({category.nameAr})</span>
              )}
            </div>
          </TableCell>
          <TableCell>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{category.slug}</code>
          </TableCell>
          <TableCell className="text-center">
            <Badge variant="secondary">{category._count?.products || 0}</Badge>
          </TableCell>
          <TableCell>
            <Switch
              checked={category.isActive}
              onCheckedChange={(checked) => toggleStatus({ id: category.id, isActive: checked })}
            />
          </TableCell>
          <TableCell className="text-center">{category.sortOrder}</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(category)}
                disabled={
                  (category.children && category.children.length > 0) ||
                  (category._count?.products || 0) > 0
                }
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {category.children?.map((child) => renderCategoryRow(child, level + 1))}
      </React.Fragment>
    )
  }

  // Get root categories (no parent)
  const rootCategories = categories.filter((c) => !c.parentId)

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <p>{t('loading')}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-600 mt-2">{t('subtitle')}</p>
        </div>
        <Button onClick={() => {
          resetForm()
          setShowDialog(true)
        }}>
          <Plus className="h-4 w-4 mr-2" />
          {t('newCategory')}
        </Button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('slug')}</TableHead>
              <TableHead className="text-center">{t('products')}</TableHead>
              <TableHead>{t('active')}</TableHead>
              <TableHead className="text-center">{t('order')}</TableHead>
              <TableHead className="text-center">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rootCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  {t('noCategoriesYet')}
                </TableCell>
              </TableRow>
            ) : (
              rootCategories.map((category) => renderCategoryRow(category))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCategory ? t('editCategory') : t('createNewCategory')}</DialogTitle>
            <DialogDescription>
              {editingCategory ? t('updateCategoryInfo') : t('addNewCategory')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              {/* Name (English) */}
              <div className="col-span-2">
                <Label htmlFor="name">{t('nameEn')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  placeholder={t('nameEnPlaceholder')}
                />
              </div>

              {/* Name (Arabic) */}
              <div className="col-span-2">
                <Label htmlFor="nameAr">{t('nameAr')}</Label>
                <Input
                  id="nameAr"
                  value={formData.nameAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameAr: e.target.value }))}
                  placeholder={t('nameArPlaceholder')}
                  dir="rtl"
                />
              </div>

              {/* Slug */}
              <div className="col-span-2">
                <Label htmlFor="slug">{t('slugLabel')} *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                  placeholder={t('slugPlaceholder')}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('slugHelp')}
                </p>
              </div>

              {/* Parent Category */}
              <div className="col-span-2">
                <Label htmlFor="parentId">{t('parentCategory')}</Label>
                <select
                  id="parentId"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    parentId: e.target.value || undefined,
                  }))}
                >
                  <option value="">{t('noneRootCategory')}</option>
                  {categories
                    .filter((c) => c.id !== editingCategory?.id) // Prevent self-parent
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Description (English) */}
              <div className="col-span-2">
                <Label htmlFor="description">{t('descriptionEn')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('descriptionEnPlaceholder')}
                  rows={3}
                />
              </div>

              {/* Icon & Image */}
              <div>
                <Label htmlFor="icon">{t('iconUrl')}</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder={t('iconUrlPlaceholder')}
                />
              </div>

              <div>
                <Label htmlFor="image">{t('imageUrl')}</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder={t('imageUrlPlaceholder')}
                />
              </div>

              {/* Sort Order */}
              <div>
                <Label htmlFor="sortOrder">{t('sortOrder')}</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) }))}
                  min={0}
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">{t('activeStatus')}</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit">
                {editingCategory ? t('updateCategory') : t('createCategory')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteCategory')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirm', { name: categoryToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
