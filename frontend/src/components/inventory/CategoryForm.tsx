import React, { useState, useEffect } from 'react';
import { Image, Loader2 } from 'lucide-react';
import type { Category } from '@/types/category';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (category: Category) => Promise<void>;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(category?.title || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(category?.image || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    if (category) {
      setTitle(category.title);
      setImagePreview(category.image);
    }
  }, [category]);

  const validateTitle = (value: string): boolean => {
    if (!value || value.trim().length === 0) {
      setTitleError('Title is required');
      return false;
    }
    if (value.length < 2) {
      setTitleError('Title must be at least 2 characters');
      return false;
    }
    if (value.length > 100) {
      setTitleError('Title must be at most 100 characters');
      return false;
    }
    setTitleError('');
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

    // Validate title
    if (!validateTitle(title)) {
      return;
    }

    // Validate image
    if (!category && !imageFile) {
      setError('Please select an image');
      return;
    }

    setIsLoading(true);

    try {
      // Get companyId from authenticated user
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setError('Authentication required. Please login again.');
        return;
      }
      const user = JSON.parse(userStr);
      const companyId = user.id;

      const categoryData: Category = {
        ...(category?.id && { id: category.id }),
        companyId: companyId,
        title: title.trim(),
        image: imagePreview,
      };

      await onSubmit(categoryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-semibold text-gray-200">
          Category Title
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="Enter category title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            validateTitle(e.target.value);
          }}
          onBlur={() => validateTitle(title)}
          required
          className={`h-12 text-base bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-secondary-400 focus:ring-secondary-400/30 transition-all rounded-xl ${
            titleError ? 'border-error-400' : ''
          }`}
        />
        {titleError && (
          <p className="text-sm text-error-300">{titleError}</p>
        )}
      </div>

      {/* Image Field */}
      <div className="space-y-2">
        <Label htmlFor="image" className="text-sm font-semibold flex items-center gap-2 text-gray-200">
          <Image className="w-4 h-4 text-secondary-400" />
          Category Image
        </Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
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
          disabled={isLoading || !!titleError}
          className="flex-1 bg-gradient-to-r from-secondary-500 to-primary-600 hover:from-secondary-600 hover:to-primary-700 text-white font-medium rounded-xl shadow-lg disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {category ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{category ? 'Update Category' : 'Create Category'}</>
          )}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
