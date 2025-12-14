import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon with gradient */}
      <div className="mb-6 p-6 rounded-full bg-gradient-to-br from-secondary-500/20 to-primary-600/20 border border-white/10">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-white mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-center mb-6 max-w-sm">
        {description}
      </p>

      {/* Optional Action Button */}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          disabled={actionDisabled}
          className="bg-gradient-to-r from-secondary-500 to-primary-600 hover:from-secondary-600 hover:to-primary-700 text-white font-medium rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
