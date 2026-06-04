'use client';

import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { useCartStore } from '@/lib/store';

interface MealCardProps {
  meal: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_available: boolean;
  };
  cafeteria: {
    id: string;
    name: string;
    is_active: boolean;
  };
}

export default function MealCard({ meal, cafeteria }: MealCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addItem({
      id: meal.id,
      name: meal.name,
      price: meal.price,
      cafeteria_id: cafeteria.id,
      cafeteria_name: cafeteria.name,
      image_url: meal.image_url,
    });
    
    // Show visual feedback for 1.5 seconds
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isDisabled = !meal.is_available || !cafeteria.is_active;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="h-40 bg-gray-100 relative">
        {meal.image_url ? (
          <img src={meal.image_url} alt={meal.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-extrabold text-gray-900 text-lg leading-tight">{meal.name}</h4>
            <span className="font-bold text-[#8a1515] ml-3 whitespace-nowrap">₦{meal.price}</span>
          </div>
          {meal.description && (
            <p className="text-sm text-gray-500 line-clamp-2">{meal.description}</p>
          )}
        </div>
        
        <button 
          onClick={handleAddToCart}
          disabled={isDisabled}
          className={`mt-5 w-full font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 
            ${added 
              ? 'bg-green-500 text-white border border-green-500' 
              : 'bg-[#f8f9fa] border border-gray-200 hover:bg-[#8a1515] hover:text-white hover:border-[#8a1515] text-gray-700'
            } 
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {added ? <Check size={18} /> : <Plus size={18} />}
          {added ? 'Added to Cart' : 'Add to Order'}
        </button>
      </div>
    </div>
  );
}