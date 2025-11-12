interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 text-[#858585]">{icon}</div>}
      <h3 className="text-lg font-medium text-[#cccccc] mb-2">{title}</h3>
      <p className="text-sm text-[#858585] max-w-md mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-[#0e639c] hover:bg-[#1177bb] text-white text-sm border border-[#007acc] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
