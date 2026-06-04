import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, ChefHat, Bike, CheckCircle2, MapPin, Phone } from 'lucide-react';
import QRCode from 'react-qr-code';

export default async function ActiveTrackingPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Fetch the most recent active order (not delivered or cancelled)
  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      cafeterias ( name ),
      order_items (
        id,
        quantity,
        price,
        meals ( name )
      ),
      deliveries (
        status,
        profiles ( full_name )
      )
    `)
    .eq('customer_id', user.id)
    .in('status', ['pending', 'preparing', 'ready', 'out_for_delivery'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // If no active order is found, show the empty state
  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-[#1f2937] items-center justify-center p-6 text-center">
        <div className="bg-gray-100 p-6 rounded-full text-gray-400 mb-6">
          <Clock size={48} />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">No Active Orders</h2>
        <p className="text-gray-500 mb-8 max-w-sm">You don't have any meals currently being prepared. Head back to the dashboard to place an order!</p>
        <Link href="/" className="bg-[#8a1515] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#6f1111] transition-colors">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // Calculate timeline state
  const statuses = ['pending', 'preparing', 'ready', 'out_for_delivery'];
  const currentStepIndex = statuses.indexOf(order.status);
  
  // Format the estimated time
  const estTime = new Date(order.estimated_ready_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-[#1f2937]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-5 bg-white border-b border-gray-200 shadow-sm">
        <Link href="/" className="p-2 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <h2 className="text-xl font-extrabold text-gray-900">Track Order</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-6 pb-24">
          
          {/* TOP STATUS CARD */}
          <section className="bg-[#8a1515] rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-medium text-white/80 uppercase tracking-wider mb-1">
                    {order.cafeterias?.name}
                  </h3>
                  <p className="text-3xl font-extrabold capitalize">
                    {order.status.replace('_', ' ')}
                  </p>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm text-center">
                  <p className="text-xs font-medium text-white/80 uppercase tracking-wider mb-0.5">Est. Time</p>
                  <p className="text-lg font-bold">{estTime}</p>
                </div>
              </div>

              {/* TIMELINE PROGRESS */}
              <div className="relative pt-6">
                <div className="absolute top-9 left-6 right-6 h-1 bg-white/20 rounded-full -z-10"></div>
                <div 
                  className="absolute top-9 left-6 h-1 bg-white rounded-full transition-all duration-500 -z-10"
                  style={{ width: `${(currentStepIndex / 3) * 100}%` }}
                ></div>
                
                <div className="flex justify-between relative z-10">
                  <StepIcon active={currentStepIndex >= 0} icon={<Clock size={20} />} label="Received" />
                  <StepIcon active={currentStepIndex >= 1} icon={<ChefHat size={20} />} label="Preparing" />
                  <StepIcon active={currentStepIndex >= 2} icon={<CheckCircle2 size={20} />} label="Ready" />
                  <StepIcon active={currentStepIndex >= 3} icon={<Bike size={20} />} label="Delivery" />
                </div>
              </div>
            </div>
            
            {/* Background Decorations */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          </section>

          {/* QR CODE SECTION (FEATURE 4) */}
          <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 flex flex-col items-center justify-center text-center">
            <h4 className="font-extrabold text-gray-900 text-lg mb-2">Pickup Verification</h4>
            <p className="text-sm text-gray-500 mb-6">Show this code to the delivery agent to confirm receipt of your meal.</p>
            
            <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-sm mb-4">
              <QRCode 
                value={order.qr_code_token} 
                size={180}
                fgColor="#1f2937"
              />
            </div>
            <p className="text-xs font-mono text-gray-400">ID: {order.qr_code_token.split('-')[0].toUpperCase()}</p>
          </section>

          {/* RIDER INFO (FEATURE 5) */}
          {order.deliveries && order.deliveries.length > 0 && order.deliveries[0].profiles && (
            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 border border-gray-200">
                  <Bike size={24} />
                </div>
                <div>
                  <h4 className="font-extrabold text-gray-900">{order.deliveries[0].profiles.full_name}</h4>
                  <p className="text-xs text-gray-500 font-medium">Your Campus Agent</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-3 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                  <Phone size={18} />
                </button>
                <Link href="/chat" className="p-3 bg-[#8a1515]/10 text-[#8a1515] rounded-full hover:bg-[#8a1515]/20 transition-colors">
                  <span className="sr-only">Chat</span>
                  {/* Chat Icon - Routing to Feature 3 */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                </Link>
              </div>
            </section>
          )}

          {/* ORDER DETAILS SUMMARY */}
          <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h4 className="font-extrabold text-gray-900">Order Summary</h4>
            </div>
            <div className="p-5 space-y-4">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">{item.quantity}x</span>
                    <span className="font-bold text-gray-900">{item.meals?.name}</span>
                  </div>
                  <span className="font-medium text-gray-600">₦{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="font-bold text-gray-900">Total Paid</span>
                <span className="text-xl font-extrabold text-[#8a1515]">₦{order.total_amount}</span>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

// Small helper component for the timeline icons
function StepIcon({ active, icon, label }: { active: boolean, icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors duration-500 ${active ? 'bg-white text-[#8a1515] shadow-md' : 'bg-white/20 text-white/50 backdrop-blur-sm'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-white' : 'text-white/50'}`}>
        {label}
      </span>
    </div>
  );
}