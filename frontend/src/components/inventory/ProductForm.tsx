import React, { useState, useEffect } from 'react';
import { Image, Loader2, DollarSign, Package } from 'lucide-react';
import type { Product } from '@/types/product';
import type { Category } from '@/types/category';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (product: Product) => Promise<void>;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  categories,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState(product?.title || '');
  const [categoryId, setCategoryId] = useState<number | undefined>(product?.categoryId);
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [count, setCount] = useState(product?.count?.toString() || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.image || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({
    title: '',
    category: '',
    price: '',
    count: '',
  });

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setCategoryId(product.categoryId);
      setPrice(product.price.toString());
      setCount(product.count.toString());
      setImagePreview(product.image);
    }
  }, [product]);

  const validateTitle = (value: string): boolean => {
    if (!value || value.trim().length === 0) {
      setErrors((prev) => ({ ...prev, title: 'Title is required' }));
      return false;
    }
    if (value.length < 2) {
      setErrors((prev) => ({ ...prev, title: 'Title must be at least 2 characters' }));
      return false;
    }
    if (value.length > 100) {
      setErrors((prev) => ({ ...prev, title: 'Title must be at most 100 characters' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, title: '' }));
    return true;
  };

  const validatePrice = (value: string): boolean => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setErrors((prev) => ({ ...prev, price: 'Price must be greater than 0' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, price: '' }));
    return true;
  };

  const validateCount = (value: string): boolean => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0) {
      setErrors((prev) => ({ ...prev, count: 'Count must be 0 or greater' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, count: '' }));
    return true;
  };

  const validateCategory = (value: number | undefined): boolean => {
    if (!value) {
      setErrors((prev) => ({ ...prev, category: 'Category is required' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, category: '' }));
    return true;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      setError('Image size must be less than 2MB');
      return;
    }

    setError('');
    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const isTitleValid = validateTitle(title);
    const isCategoryValid = validateCategory(categoryId);
    const isPriceValid = validatePrice(price);
    const isCountValid = validateCount(count);

    if (!isTitleValid || !isCategoryValid || !isPriceValid || !isCountValid) {
      return;
    }

    // Validate image
    if (!product && !imageFile) {
      setError('Please select an image');
      return;
    }

    setIsLoading(true);

    try {
      const productData: Product = {
        ...(product?.id && { id: product.id }),
        categoryId: categoryId!,
        title: title.trim(),
        image: imagePreview,
        price: parseFloat(price),
        count: parseInt(count, 10),
      };

      await onSubmit(productData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  const noCategoriesAvailable = categories.length === 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* No Categories Warning */}
      {noCategoriesAvailable && (
        <Alert className="border-accent-400 bg-accent-500/20 backdrop-blur-sm">
          <AlertDescription className="text-accent-200">
            You must create a category first before adding products.
          </AlertDescription>
        </Alert>
      )}

      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-semibold text-gray-200">
          Product Title
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="Enter product title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            validateTitle(e.target.value);
          }}
          onBlur={() => validateTitle(title)}
          required
          disabled={noCategoriesAvailable}
          className={`h-12 text-base bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-secondary-400 focus:ring-secondary-400/30 transition-all rounded-xl ${
            errors.title ? 'border-error-400' : ''
          }`}
        />
        {errors.title && <p className="text-sm text-error-300">{errors.title}</p>}
      </div>

      {/* Category Field */}
      <div className="space-y-2">
        <Label htmlFor="category" className="text-sm font-semibold text-gray-200">
          Category
        </Label>
        <Select
          value={categoryId?.toString()}
          onValueChange={(value) => {
            const id = parseInt(value, 10);
            setCategoryId(id);
            validateCategory(id);
          }}
          disabled={noCategoriesAvailable}
        >
          <SelectTrigger className={errors.category ? 'border-error-400' : ''}>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id!.toString()}>
                {cat.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-error-300">{errors.category}</p>}
      </div>

      {/* Price and Count Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Price Field */}
        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-semibold flex items-center gap-2 text-gray-200">
            <DollarSign className="w-4 h-4 text-secondary-400" />
            Price
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              validatePrice(e.target.value);
            }}
            onBlur={() => validatePrice(price)}
            required
            disabled={noCategoriesAvailable}
            className={`h-12 text-base bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-secondary-400 focus:ring-secondary-400/30 transition-all rounded-xl ${
              errors.price ? 'border-error-400' : ''
            }`}
          />
          {errors.price && <p className="text-sm text-error-300">{errors.price}</p>}
        </div>

        {/* Count Field */}
        <div className="space-y-2">
          <Label htmlFor="count" className="text-sm font-semibold flex items-center gap-2 text-gray-200">
            <Package className="w-4 h-4 text-accent-400" />
            Count
          </Label>
          <Input
            id="count"
            type="number"
            min="0"
            placeholder="0"
            value={count}
            onChange={(e) => {
              setCount(e.target.value);
              validateCount(e.target.value);
            }}
            onBlur={() => validateCount(count)}
            required
            disabled={noCategoriesAvailable}
            className={`h-12 text-base bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-secondary-400 focus:ring-secondary-400/30 transition-all rounded-xl ${
              errors.count ? 'border-error-400' : ''
            }`}
          />
          {errors.count && <p className="text-sm text-error-300">{errors.count}</p>}
        </div>
      </div>

      {/* Image Field */}
      <div className="space-y-2">
        <Label htmlFor="image" className="text-sm font-semibold flex items-center gap-2 text-gray-200">
          <Image className="w-4 h-4 text-secondary-400" />
          Product Image
        </Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={noCategoriesAvailable}
          className="h-12 text-base bg-white/5 border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-secondary-500/20 file:text-secondary-300 hover:file:bg-secondary-500/30 cursor-pointer transition-all rounded-xl"
        />
        {imagePreview && (
          <div className="mt-3 p-2 bg-white/5 border border-white/10 rounded-lg">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="bg-error-500/20 border-error-400 backdrop-blur-sm">
          <AlertDescription className="text-error-100">{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="ghost"
          className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isLoading ||
            noCategoriesAvailable ||
            !!errors.title ||
            !!errors.category ||
            !!errors.price ||
            !!errors.count
          }
          className="flex-1 bg-gradient-to-r from-secondary-500 to-primary-600 hover:from-secondary-600 hover:to-primary-700 text-white font-medium rounded-xl shadow-lg disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {product ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{product ? 'Update Product' : 'Create Product'}</>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
