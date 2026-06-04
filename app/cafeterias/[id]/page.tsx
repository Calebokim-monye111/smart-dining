import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { ArrowLeft, Store, ChevronRight } from 'lucide-react';

export default async function CafeteriasIndex() {
  const supabase = await createClient();
  const { data: cafeterias } = await supabase.from('cafeterias').select('*').order('name');

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-[#1f2937]">
      <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-5 bg-white border-b border-gray-200 shadow-sm">
        <Link href="/" className="p-2 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <h2 className="text-xl font-extrabold text-gray-900">All Cafeterias</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cafeterias?.map((cafe) => (
            <Link href={`/cafeterias/${cafe.id}`} key={cafe.id} className="group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-[#8a1515]/30 transition-all flex flex-col justify-between h-44">
              <div>
                <h4 className="font-extrabold text-gray-900 text-xl mb-3 group-hover:text-[#8a1515] transition-colors">{cafe.name}</h4>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${cafe.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {cafe.is_active ? 'Currently Open' : 'Closed'}
                </span>
              </div>
              <div className="flex justify-between items-center mt-4 border-t border-gray-50 pt-4">
                <span className="text-sm text-gray-500 font-medium">Explore Menu</span>
                <span className="bg-[#f8f9fa] group-hover:bg-[#8a1515] group-hover:text-white p-2 rounded-full transition-colors text-gray-400">
                  <ChevronRight size={18} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}