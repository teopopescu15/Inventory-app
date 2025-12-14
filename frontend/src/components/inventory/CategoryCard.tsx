import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { Category } from '@/types/category';
import { Button } from '@/components/ui/button';

interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit, onDelete }) => {
  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      {/* Category Image */}
      <div className="aspect-video w-full mb-4 rounded-lg overflow-hidden bg-gray-800/50">
        <img
          src={category.image}
          alt={category.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Category Title */}
      <h3 className="text-lg font-semibold text-white mb-4 truncate">
        {category.title}
      </h3>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onEdit}
          variant="ghost"
          size="sm"
          className="flex-1 bg-white/5 hover:bg-secondary-500/20 hover:text-secondary-300 text-gray-300 border border-white/10 hover:border-secondary-400/30 transition-all"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          onClick={onDelete}
          variant="ghost"
          size="sm"
          className="flex-1 bg-white/5 hover:bg-error-500/20 hover:text-error-300 text-gray-300 border border-white/10 hover:border-error-400/30 transition-all"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default CategoryCard;
