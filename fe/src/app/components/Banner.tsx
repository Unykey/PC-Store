import { ChevronRight } from 'lucide-react';

interface BannerProps {
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonColor?: string;
}

export function Banner({ 
  image, 
  title, 
  subtitle, 
  buttonText, 
  buttonColor = '#f37021' 
}: BannerProps) {
  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg group h-80 md:h-96">
      <img 
        src={image} 
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent">
        <div className="h-full flex flex-col justify-center px-6 md:px-12 max-w-2xl">
          <h1 className="text-white text-3xl md:text-5xl mb-3 md:mb-4 leading-tight">
            {title}
          </h1>
          
          <p className="text-white/90 text-base md:text-lg mb-6 md:mb-8">
            {subtitle}
          </p>

          <div>
            <button 
              className="px-6 md:px-8 py-3 rounded-md text-white font-medium flex items-center gap-2 hover:gap-3 transition-all shadow-lg hover:shadow-xl"
              style={{ backgroundColor: buttonColor }}
            >
              <span>{buttonText}</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
