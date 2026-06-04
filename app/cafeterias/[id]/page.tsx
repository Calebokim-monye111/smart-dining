import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Info, ShoppingBag } from 'lucide-react';
import MealCard from '@/components/dashboard/MealCard';

export default async function CafeteriaMenuPage(props: { params: Promise<{ id: string }> }) {
  // CORRECT NEXT.JS ASYNC PARAMS HANDLING
  const params = await props.params;
  const cafeteriaId = params.id;
  
  const supabase = await createClient();

  // 1. Fetch the specific cafeteria details using the unwrapped ID
  const { data: cafeteria } = await supabase
    .from('cafeterias')
    .select('*')
    .eq('id', cafeteriaId)
    .single();

  // If the ID doesn't exist in the database, throw a 404
  if (!cafeteria) {
    notFound();
  }

  // 2. Fetch the meals for this specific cafeteria
  const { data: meals } = await supabase
    .from('meals')
    .select('*')
    .eq('cafeteria_id', cafeteriaId)
    .order('name');

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-[#1f2937]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-5 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-700" />
          </Link>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">{cafeteria.name}</h2>
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide mt-1 ${cafeteria.is_active ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {cafeteria.is_active ? 'Open Now' : 'Closed'}
            </span>
          </div>
        </div>
        
        {/* Floating Cart Icon to go to Checkout */}
        <Link href="/orders" className="p-2.5 bg-[#8a1515] text-white rounded-full shadow-md hover:bg-[#6f1111] transition-colors relative">
          <ShoppingBag size={20} />
        </Link>
      </header>

      {/* MENU GRID */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-extrabold text-gray-900 text-lg md:text-xl">Available Meals</h3>
          </div>

          {meals && meals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} cafeteria={cafeteria} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-10 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="bg-gray-50 p-4 rounded-full text-gray-400 mb-4">
                <Info size={32} />
              </div>
              <h4 className="font-extrabold text-gray-900 text-lg mb-1">No meals available yet</h4>
              <p className="text-sm text-gray-500 max-w-sm">This cafeteria hasn't added any meals to their digital menu.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}