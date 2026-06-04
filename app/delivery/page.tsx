import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Bike, CheckCircle } from 'lucide-react';
import { revalidatePath } from 'next/cache';

// INLINE SERVER ACTION: Claims a delivery ticket
async function claimDelivery(formData: FormData) {
  'use server';
  const deliveryId = formData.get('deliveryId') as string;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // 1. Assign the rider to the delivery
  await supabase
    .from('deliveries')
    .update({ rider_id: user.id, status: 'picked_up' })
    .eq('id', deliveryId);

  // 2. Refresh the board
  revalidatePath('/delivery');
}

export default async function RiderDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Verify they are actually a rider
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'rider') redirect('/delivery/signup');

  // Fetch all open delivery bounties (no rider assigned yet)
  const { data: openDeliveries } = await supabase
    .from('deliveries')
    .select(`
      id,
      delivery_fee,
      created_at,
      orders (
        id,
        cafeterias ( name )
      )
    `)
    .is('rider_id', null)
    .eq('status', 'assigned')
    .order('created_at', { ascending: false });

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-[#1f2937]">
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-5 bg-[#8a1515] text-white shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Bike size={24} /> Rider Board
          </h2>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="font-extrabold text-gray-900 text-lg">Available Bounties</h3>

          {openDeliveries && openDeliveries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openDeliveries.map((delivery) => (
                <div key={delivery.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        + ₦{delivery.delivery_fee}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {new Date(delivery.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <h4 className="font-extrabold text-gray-900 text-lg mb-1">
                      {/* @ts-ignore - Supabase type mapping quirk */}
                      Pickup: {delivery.orders?.cafeterias?.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                      <MapPin size={16} /> Campus Delivery
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <form action={claimDelivery}>
                      <input type="hidden" name="deliveryId" value={delivery.id} />
                      <button type="submit" className="w-full bg-[#1f2937] hover:bg-black text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                        <CheckCircle size={18} /> Claim Delivery
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center shadow-sm h-[40vh]">
              <div className="bg-gray-50 p-6 rounded-full text-gray-300 mb-6">
                <CheckCircle size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">No Open Orders</h3>
              <p className="text-gray-500">All student orders have been claimed or delivered. Check back soon!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}