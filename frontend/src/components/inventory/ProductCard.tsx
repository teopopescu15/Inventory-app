import React from 'react';
import { Edit, Trash2, DollarSign, Package } from 'lucide-react';
import type { Product } from '@/types/product';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  return (
    <div className="group relative bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      {/* Product Image */}
      <div className="aspect-square w-full mb-4 rounded-lg overflow-hidden bg-gray-800/50">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Title */}
      <h3 className="text-lg font-semibold text-white mb-3 truncate">
        {product.title}
      </h3>

      {/* Price and Count Badges */}
      <div className="flex gap-2 mb-4">
        {/* Price Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-500/20 border border-secondary-400/30 rounded-lg text-secondary-300 text-sm font-medium">
          <DollarSign className="w-4 h-4" />
          <span>${product.price.toFixed(2)}</span>
        </div>

        {/* Count Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-500/20 border border-accent-400/30 rounded-lg text-accent-300 text-sm font-medium">
          <Package className="w-4 h-4" />
          <span>{product.count}</span>
        </div>
      </div>

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

export default ProductCard;
