import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

export default async function OrderHistoryPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch all orders for this user, including the cafeteria name and the items bought
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      total_amount,
      created_at,
      cafeterias ( name ),
      order_items ( id )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  // Helper function to render the correct status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
            <CheckCircle2 size={14} /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 bg-red-50 text-red-700 border border-red-100 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
            <XCircle size={14} /> Cancelled
          </span>
        );
      default:
        // Any other status (pending, preparing, ready, out_for_delivery) is considered "Active"
        return (
          <span className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider animate-pulse">
            <Clock size={14} /> Active
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-[#1f2937]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-5 bg-white border-b border-gray-200 shadow-sm">
        <Link href="/" className="p-2 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Order History</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">View your past and active meals</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto pb-24 space-y-4">
          
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <Link 
                // If the order is active, route them to the live tracking page. 
                // If completed, route them to a receipt page (we can build this later)
                href={['pending', 'preparing', 'ready', 'out_for_delivery'].includes(order.status) ? '/orders/active' : '#'}
                key={order.id} 
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-[#8a1515]/10 p-3 rounded-full text-[#8a1515] flex-shrink-0 mt-1 md:mt-0">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-900 text-lg">
                      {/* @ts-ignore */}
                      {order.cafeterias?.name}
                    </h4>
                    <p className="text-sm text-gray-500 font-medium mb-3">
                      {new Date(order.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} 
                      <span className="mx-2">•</span> 
                      {/* @ts-ignore */}
                      {order.order_items?.length} Item{order.order_items?.length > 1 ? 's' : ''}
                    </p>
                    {renderStatusBadge(order.status)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:flex-col md:items-end border-t border-gray-100 md:border-t-0 pt-4 md:pt-0">
                  <span className="text-xl font-extrabold text-[#8a1515]">₦{order.total_amount}</span>
                  <div className="text-sm font-bold text-gray-400 group-hover:text-[#8a1515] transition-colors flex items-center mt-1">
                    {['pending', 'preparing', 'ready', 'out_for_delivery'].includes(order.status) ? 'Track Order' : 'View Details'} 
                    <ChevronRight size={16} />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            /* EMPTY STATE */
            <div className="bg-white rounded-3xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center shadow-sm h-[50vh]">
              <div className="bg-gray-50 p-6 rounded-full text-gray-300 mb-6">
                <ShoppingBag size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-8 max-w-sm">You haven't placed any orders. Discover meals from your favorite campus cafeterias.</p>
              <Link href="/" className="bg-[#8a1515] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#6f1111] transition-colors">
                Start Ordering
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}