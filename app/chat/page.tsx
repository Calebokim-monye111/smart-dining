import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, ChevronRight } from 'lucide-react';

export default async function ChatIndex() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch active orders (as a student) or active deliveries (as a rider)
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
  
  let activeChats = [];
  
  if (profile?.role === 'rider') {
    const { data } = await supabase.from('deliveries').select('orders(id, cafeterias(name))').eq('rider_id', user?.id).eq('status', 'picked_up');
    activeChats = data || [];
  } else {
    const { data } = await supabase.from('orders').select('id, cafeterias(name)').eq('customer_id', user?.id).in('status', ['preparing', 'ready', 'out_for_delivery']);
    activeChats = data || [];
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-[#1f2937]">
      <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-5 bg-white border-b border-gray-200 shadow-sm">
        <Link href="/" className="p-2 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <h2 className="text-xl font-extrabold text-gray-900">Active Chats</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-2xl mx-auto space-y-4">
          {activeChats.length > 0 ? (
            activeChats.map((chat: any, i) => {
              const orderId = profile?.role === 'rider' ? chat.orders.id : chat.id;
              const cafeName = profile?.role === 'rider' ? chat.orders.cafeterias.name : chat.cafeterias.name;
              
              return (
                <Link href={`/chat/${orderId}`} key={i} className="flex items-center justify-between bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#8a1515]/10 p-3 rounded-full text-[#8a1515]">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Order from {cafeName}</h4>
                      <p className="text-sm text-gray-500">Tap to open live chat</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </Link>
              );
            })
          ) : (
            <div className="text-center p-10 bg-white rounded-3xl border border-gray-200 shadow-sm">
              <MessageSquare size={40} className="mx-auto text-gray-300 mb-4" />
              <h3 className="font-extrabold text-gray-900 text-lg">No Active Chats</h3>
              <p className="text-gray-500 text-sm mt-2">You don't have any active orders or deliveries to chat about right now.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}