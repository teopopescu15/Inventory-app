import React, { useState } from 'react';
import { Package, Box } from 'lucide-react';
import CategoryCard from '@/components/inventory/CategoryCard';
import ProductCard from '@/components/inventory/ProductCard';
import CategoryForm from '@/components/inventory/CategoryForm';
import ProductForm from '@/components/inventory/ProductForm';
import EmptyState from '@/components/inventory/EmptyState';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';

const ComponentTest: React.FC = () => {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  const testCategory: Category = {
    id: 1,
    companyId: 1,
    title: 'Electronics',
    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  };

  const testProduct: Product = {
    id: 1,
    categoryId: 1,
    title: 'Laptop',
    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    price: 899.99,
    count: 10,
  };

  const testCategories: Category[] = [testCategory];

  const handleCategorySubmit = async (category: Category) => {
    console.log('Category submitted:', category);
    setIsCategoryDialogOpen(false);
  };

  const handleProductSubmit = async (product: Product) => {
    console.log('Product submitted:', product);
    setIsProductDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-white mb-8">Phase 4 Component Test</h1>

        {/* Category Card */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Category Card</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CategoryCard
              category={testCategory}
              onEdit={() => console.log('Edit category')}
              onDelete={() => console.log('Delete category')}
            />
          </div>
        </section>

        {/* Product Card */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Product Card</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductCard
              product={testProduct}
              onEdit={() => console.log('Edit product')}
              onDelete={() => console.log('Delete product')}
            />
          </div>
        </section>

        {/* Empty State */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Empty State</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl">
            <EmptyState
              icon={Package}
              title="No categories yet"
              description="Create your first category to start managing your inventory"
              actionLabel="Create Category"
              onAction={() => console.log('Create category clicked')}
            />
          </div>
        </section>

        {/* Forms in Dialogs */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Forms (in Dialogs)</h2>
          <div className="flex gap-4">
            <Button
              onClick={() => setIsCategoryDialogOpen(true)}
              className="bg-gradient-to-r from-secondary-500 to-primary-600 hover:from-secondary-600 hover:to-primary-700 text-white rounded-xl"
            >
              Open Category Form
            </Button>
            <Button
              onClick={() => setIsProductDialogOpen(true)}
              className="bg-gradient-to-r from-secondary-500 to-primary-600 hover:from-secondary-600 hover:to-primary-700 text-white rounded-xl"
            >
              Open Product Form
            </Button>
          </div>
        </section>

        {/* Category Dialog */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSubmit={handleCategorySubmit}
              onCancel={() => setIsCategoryDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Product Dialog */}
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Product</DialogTitle>
            </DialogHeader>
            <ProductForm
              categories={testCategories}
              onSubmit={handleProductSubmit}
              onCancel={() => setIsProductDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ComponentTest;
