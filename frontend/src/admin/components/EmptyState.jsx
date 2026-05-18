import { Inbox, Search, FileX } from 'lucide-react';

const icons = {
  empty: Inbox,
  search: Search,
  file: FileX,
};

export const EmptyState = ({ 
  type = 'empty', 
  title = 'No data found', 
  description = 'There are no items to display.',
  action 
}) => {
  const Icon = icons[type] || Inbox;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4" data-testid="empty-state">
      <div className="w-16 h-16 rounded-full bg-[#F0F0F0] flex items-center justify-center mb-4">
        <Icon size={28} className="text-[#71717A]" />
      </div>
      <h3 className="text-lg font-semibold text-[#09090B] mb-1">{title}</h3>
      <p className="text-sm text-[#71717A] text-center max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
