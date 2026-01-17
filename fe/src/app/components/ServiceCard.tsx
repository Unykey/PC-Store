import type {LucideIcon} from 'lucide-react';

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  image?: string;
}

export function ServiceCard({ icon: Icon, title, description, color, image }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-200 hover:border-[#0066b3]">
      {image && (
        <div className="relative overflow-hidden bg-gray-100 h-40">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div 
            className="absolute inset-0 opacity-20"
            style={{ backgroundColor: color }}
          />
        </div>
      )}
      
      <div className="p-5">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
        
        <h3 
          className="mb-2 group-hover:opacity-80 transition-opacity"
          style={{ color }}
        >
          {title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4">
          {description}
        </p>

        <button 
          className="text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
          style={{ color }}
        >
          <span>Tìm hiểu thêm</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
