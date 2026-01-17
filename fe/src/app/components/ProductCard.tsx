import { ShoppingCart, Star } from 'lucide-react';

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  oldPrice?: string;
  rating?: number;
  discount?: string;
  inStock?: boolean;
}

export function ProductCard({ 
  image, 
  name, 
  price, 
  oldPrice, 
  rating = 4.5,
  discount,
  inStock = true 
}: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-200 hover:border-[#0066b3]">
      <div className="relative overflow-hidden bg-gray-100">
        {discount && (
          <div className="absolute top-2 left-2 bg-[#0db14b] text-white px-2 py-1 rounded-md text-sm z-10">
            -{discount}
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="bg-red-500 text-white px-4 py-2 rounded-md">Hết hàng</span>
          </div>
        )}
        <img 
          src={image} 
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-gray-800 mb-2 line-clamp-2 h-12 group-hover:text-[#0066b3] transition-colors">
          {name}
        </h3>
        
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i}
              size={14} 
              className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({rating})</span>
        </div>

        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-[#f37021] font-semibold text-lg">{price}</span>
            {oldPrice && (
              <span className="text-gray-400 line-through text-sm">{oldPrice}</span>
            )}
          </div>
        </div>

        <button 
          className="w-full bg-[#f37021] text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-[#d45f1a] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={!inStock}
        >
          <ShoppingCart size={18} />
          <span>{inStock ? 'Mua ngay' : 'Hết hàng'}</span>
        </button>
      </div>
    </div>
  );
}
