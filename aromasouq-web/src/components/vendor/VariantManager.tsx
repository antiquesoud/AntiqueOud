'use client';

import { useState, useEffect } from 'react';
import {
  useProductVariants,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
  CreateVariantDto,
  UpdateVariantDto,
} from '@/hooks/useVariants';
import { ProductVariant } from '@/types/product';
import { Plus, Edit, Trash2, X, Package, DollarSign, Hash, Image as ImageIcon } from 'lucide-react';

interface VariantManagerProps {
  productId: string;
}

export function VariantManager({ productId }: VariantManagerProps) {
  const { data: variants, isLoading } = useProductVariants(productId);
  const createVariant = useCreateVariant(productId);
  const updateVariant = useUpdateVariant(productId);
  const deleteVariant = useDeleteVariant(productId);

  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [productSku, setProductSku] = useState<string>('');

  const [formData, setFormData] = useState<CreateVariantDto>({
    name: '',
    nameAr: '',
    sku: '',
    price: 0,
    stock: 0,
    image: '',
    compareAtPrice: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch product SKU to auto-generate variant SKUs
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
          credentials: 'include',
        });
        if (response.ok) {
          const product = await response.json();
          setProductSku(product.sku || '');
        }
      } catch (error) {
        console.error('Failed to fetch product SKU:', error);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    const newValue = type === 'number' ? parseFloat(value) || 0 : value;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: newValue,
      };

      // Auto-generate SKU when variant name changes (only for new variants)
      if (name === 'name' && !editingVariant && productSku && value) {
        // Create SKU suffix from variant name (e.g., "50ml" -> "50ML")
        const suffix = value.trim().toUpperCase().replace(/\s+/g, '-').substring(0, 20);
        updated.sku = `${productSku}-${suffix}`;
      }

      return updated;
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Variant name is required';
    }

    if (!formData.sku.trim()) {
      newErrors.sku = 'SKU is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (editingVariant) {
      // Update existing variant
      const updateData: UpdateVariantDto = {
        name: formData.name,
        nameAr: formData.nameAr || undefined,
        sku: formData.sku,
        price: formData.price,
        stock: formData.stock,
        image: formData.image || undefined,
        compareAtPrice: formData.compareAtPrice || undefined,
      };

      updateVariant.mutate(
        { id: editingVariant.id, data: updateData },
        {
          onSuccess: () => {
            resetForm();
          },
        }
      );
    } else {
      // Create new variant
      createVariant.mutate(formData, {
        onSuccess: () => {
          resetForm();
        },
      });
    }
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      name: variant.name,
      nameAr: variant.nameAr || '',
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      image: variant.image || '',
      compareAtPrice: variant.compareAtPrice || 0,
    });
    setShowForm(true);
  };

  const handleDelete = (variantId: string) => {
    if (
      confirm(
        'Are you sure you want to delete this variant? This action cannot be undone.'
      )
    ) {
      deleteVariant.mutate(variantId);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      sku: '',
      price: 0,
      stock: 0,
      image: '',
      compareAtPrice: 0,
    });
    setEditingVariant(null);
    setShowForm(false);
    setErrors({});
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Loading variants...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Product Variants</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage different sizes, colors, or options for this product
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Variant
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingVariant ? 'Edit Variant' : 'Add New Variant'}
            </h3>
            <button
              onClick={resetForm}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Variant Name (English) */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Variant Name (English) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 50ml, 100ml, Travel Size"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Variant Name (Arabic) */}
              <div>
                <label htmlFor="nameAr" className="block text-sm font-medium mb-2">
                  Variant Name (Arabic)
                </label>
                <input
                  type="text"
                  id="nameAr"
                  name="nameAr"
                  value={formData.nameAr}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="الاسم بالعربية"
                  dir="rtl"
                />
              </div>

              {/* SKU */}
              <div>
                <label htmlFor="sku" className="block text-sm font-medium mb-2">
                  SKU <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.sku ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={productSku ? `${productSku}-50ML` : "e.g., PROD-50ML"}
                  />
                </div>
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
                )}
                {!editingVariant && productSku && (
                  <p className="mt-1 text-xs text-blue-600">
                    ✓ Auto-generated from variant name. Product SKU: {productSku}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium mb-2">
                  Price (AED) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              {/* Compare at Price */}
              <div>
                <label htmlFor="compareAtPrice" className="block text-sm font-medium mb-2">
                  Compare at Price (AED)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    id="compareAtPrice"
                    name="compareAtPrice"
                    value={formData.compareAtPrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Original price before discount (optional)
                </p>
              </div>

              {/* Stock */}
              <div>
                <label htmlFor="stock" className="block text-sm font-medium mb-2">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.stock ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                </div>
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium mb-2">
                Variant Image URL
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Optional: Different image for this variant
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createVariant.isPending || updateVariant.isPending}
                className="flex-1 px-6 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createVariant.isPending || updateVariant.isPending
                  ? 'Saving...'
                  : editingVariant
                  ? 'Update Variant'
                  : 'Add Variant'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Variants List */}
      <div className="space-y-3">
        {variants && variants.length > 0 ? (
          variants.map((variant) => (
            <div
              key={variant.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{variant.name}</h3>
                    {!variant.isActive && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                        Inactive
                      </span>
                    )}
                    {variant.stock === 0 && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">SKU:</span>
                      <p className="font-medium">{variant.sku}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <p className="font-medium">
                        {variant.compareAtPrice && variant.compareAtPrice > variant.price ? (
                          <>
                            <span className="line-through text-gray-400 mr-2">
                              {variant.compareAtPrice} AED
                            </span>
                            <span className="text-green-600">{variant.price} AED</span>
                          </>
                        ) : (
                          <span>{variant.price} AED</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Stock:</span>
                      <p className={`font-medium ${variant.stock === 0 ? 'text-red-600' : ''}`}>
                        {variant.stock} units
                      </p>
                    </div>
                    {variant.image && (
                      <div>
                        <span className="text-gray-600">Image:</span>
                        <p className="font-medium text-blue-600 truncate">Has image</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(variant)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit variant"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(variant.id)}
                    disabled={deleteVariant.isPending}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    title="Delete variant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No variants yet
            </h3>
            <p className="text-gray-600 mb-6">
              Add variants like different sizes, colors, or options for this product.
            </p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Plus className="w-5 h-5" />
                Add Your First Variant
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
