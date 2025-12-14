import React, { useState, useEffect } from 'react';
import { Plus, Package, Box, Loader2, AlertTriangle } from 'lucide-react';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import CategoryCard from '@/components/inventory/CategoryCard';
import ProductCard from '@/components/inventory/ProductCard';
import CategoryForm from '@/components/inventory/CategoryForm';
import ProductForm from '@/components/inventory/ProductForm';
import EmptyState from '@/components/inventory/EmptyState';
import { Sidebar } from '@/components/Sidebar';

const Inventory: React.FC = () => {
  // Get company ID from logged-in user
  const getUserCompanyId = (): number => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id;
    }
    // Redirect to login if no user found
    window.location.href = '/login';
    return 0;
  };

  const companyId = getUserCompanyId();

  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'category' | 'product';
    id: number;
    productsCount?: number;
  } | null>(null);

  // Fetch categories and products on mount
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    setError('');
    try {
      const data = await apiService.categories.getAll();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories. Please try again.');
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    setError('');
    try {
      const data = await apiService.products.getAll();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Category handlers
  const handleCreateCategory = () => {
    setSelectedCategory(undefined);
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    const productsInCategory = products.filter(p => p.categoryId === category.id);
    setDeleteTarget({
      type: 'category',
      id: category.id!,
      productsCount: productsInCategory.length,
    });
    setDeleteDialogOpen(true);
  };

  const handleCategorySubmit = async (category: Category) => {
    try {
      if (category.id) {
        // Update existing category
        await apiService.categories.update(category.id, category);
      } else {
        // Create new category
        await apiService.categories.create(category);
      }
      setCategoryDialogOpen(false);
      setSelectedCategory(undefined);
      await fetchCategories();
    } catch (err) {
      throw new Error('Failed to save category. Please try again.');
    }
  };

  // Product handlers
  const handleCreateProduct = () => {
    setSelectedProduct(undefined);
    setProductDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeleteTarget({
      type: 'product',
      id: product.id!,
    });
    setDeleteDialogOpen(true);
  };

  const handleProductSubmit = async (product: Product) => {
    try {
      if (product.id) {
        // Update existing product
        await apiService.products.update(product.id, product);
      } else {
        // Create new product
        await apiService.products.create(product);
      }
      setProductDialogOpen(false);
      setSelectedProduct(undefined);
      await fetchProducts();
    } catch (err) {
      throw new Error('Failed to save product. Please try again.');
    }
  };

  // Delete confirmation handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'category') {
        await apiService.categories.delete(deleteTarget.id);
        await fetchCategories();
        await fetchProducts(); // Refresh products as they may have been cascade deleted
      } else {
        await apiService.products.delete(deleteTarget.id);
        await fetchProducts();
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      setError(`Failed to delete ${deleteTarget.type}. Please try again.`);
      console.error('Error deleting:', err);
    }
  };

  const isLoading = isLoadingCategories || isLoadingProducts;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8">
          <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Inventory Management
            </h1>
            <p className="text-gray-400">
              Manage your categories and products
            </p>
          </div>
          <Button
            onClick={handleCreateCategory}
            className="bg-gradient-to-r from-secondary-500 to-primary-600 hover:from-secondary-600 hover:to-primary-700 text-white font-medium rounded-xl shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6 bg-error-500/20 border-error-400 backdrop-blur-sm">
            <AlertDescription className="text-error-100">{error}</AlertDescription>
          </Alert>
        )}

        {/* Categories Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
              <Package className="w-6 h-6 text-secondary-400" />
              Categories
              {!isLoadingCategories && (
                <span className="text-lg text-gray-400 font-normal">
                  ({categories.length})
                </span>
              )}
            </h2>
          </div>

          {isLoadingCategories ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-secondary-400 animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl">
              <EmptyState
                icon={Package}
                title="No categories yet"
                description="Create your first category to start organizing your inventory"
                actionLabel="Create Category"
                onAction={handleCreateCategory}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={() => handleEditCategory(category)}
                  onDelete={() => handleDeleteCategory(category)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-white/10 mb-12" />

        {/* Products Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
              <Box className="w-6 h-6 text-secondary-400" />
              Products
              {!isLoadingProducts && (
                <span className="text-lg text-gray-400 font-normal">
                  ({products.length})
                </span>
              )}
            </h2>
            <Button
              onClick={handleCreateProduct}
              disabled={categories.length === 0}
              className="bg-gradient-to-r from-secondary-500 to-primary-600 hover:from-secondary-600 hover:to-primary-700 text-white font-medium rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              title={categories.length === 0 ? 'Create a category first' : 'Create product'}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </Button>
          </div>

          {isLoadingProducts ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-secondary-400 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl">
              <EmptyState
                icon={Box}
                title={categories.length === 0 ? 'Create a category first' : 'No products yet'}
                description={
                  categories.length === 0
                    ? 'You need to create at least one category before adding products'
                    : 'Add your first product to start managing your inventory'
                }
                actionLabel="Create Product"
                onAction={handleCreateProduct}
                actionDisabled={categories.length === 0}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={() => handleEditProduct(product)}
                  onDelete={() => handleDeleteProduct(product)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Category Create/Edit Dialog */}
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? 'Edit Category' : 'Create Category'}
              </DialogTitle>
              <DialogDescription>
                {selectedCategory
                  ? 'Update category information below'
                  : 'Add a new category to organize your products'}
              </DialogDescription>
            </DialogHeader>
            <CategoryForm
              category={selectedCategory}
              onSubmit={handleCategorySubmit}
              onCancel={() => {
                setCategoryDialogOpen(false);
                setSelectedCategory(undefined);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Product Create/Edit Dialog */}
        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedProduct ? 'Edit Product' : 'Create Product'}
              </DialogTitle>
              <DialogDescription>
                {selectedProduct
                  ? 'Update product information below'
                  : 'Add a new product to your inventory'}
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              product={selectedProduct}
              categories={categories}
              onSubmit={handleProductSubmit}
              onCancel={() => {
                setProductDialogOpen(false);
                setSelectedProduct(undefined);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-error-300">
                <AlertTriangle className="w-5 h-5" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                {deleteTarget?.type === 'category' && deleteTarget.productsCount! > 0 ? (
                  <span className="text-gray-300">
                    This will delete the category and{' '}
                    <span className="font-semibold text-error-300">
                      {deleteTarget.productsCount} product{deleteTarget.productsCount !== 1 ? 's' : ''}
                    </span>
                    . This action cannot be undone.
                  </span>
                ) : (
                  <span className="text-gray-300">
                    Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeleteTarget(null);
                }}
                variant="ghost"
                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="flex-1 bg-error-500 hover:bg-error-600 text-white font-medium rounded-xl shadow-lg"
              >
                Delete {deleteTarget?.type === 'category' ? 'Category' : 'Product'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
