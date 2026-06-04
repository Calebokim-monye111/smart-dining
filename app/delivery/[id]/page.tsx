'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Phone, MessageSquare, QrCode, CheckCircle2 } from 'lucide-react';
import { verifyAndCompleteDelivery } from '../actions';

// Note: Using a client component here because handling camera permissions 
// and form state requires browser APIs.
export default function ActiveDeliveryPage({ params }: { params: { id: string } }) {
  const { id: deliveryId } = params;
  const router = useRouter();
  const supabase = createClient();
  
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tokenInput, setTokenInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchDelivery() {
      const { data } = await supabase
        .from('deliveries')
        .select(`
          *,
          orders (
            id,
            status,
            customer_id,
            total_amount,
            profiles:customer_id ( full_name ),
            cafeterias ( name )
          )
        `)
        .eq('id', deliveryId)
        .single();
        
      setDelivery(data);
      setLoading(false);
    }
    fetchDelivery();
  }, [deliveryId, supabase]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput) return;
    
    setIsVerifying(true);
    const response = await verifyAndCompleteDelivery(deliveryId, delivery.orders.id, tokenInput.trim());
    
    if (response?.error) {
      alert(response.error);
      setIsVerifying(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/delivery'); // Send them back to the board to grab the next one!
      }, 2000);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading route...</div>;
  if (!delivery) return <div className="min-h-screen flex items-center justify-center">Delivery not found.</div>;

  const order = delivery.orders;
  const customerName = order.profiles?.full_name || 'Student';

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-[#1f2937]">
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-5 bg-[#1f2937] text-white shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/delivery" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h2 className="text-xl font-extrabold">Active Route</h2>
        </div>
        <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
          Fee: ₦{delivery.delivery_fee}
        </span>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-2xl mx-auto space-y-6 pb-24">
          
          {success ? (
            <section className="bg-green-50 border border-green-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="bg-green-500 text-white p-4 rounded-full mb-4">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-2xl font-extrabold text-green-900 mb-2">Delivery Verified!</h3>
              <p className="text-green-700 font-medium">₦{delivery.delivery_fee} has been credited to your account.</p>
            </section>
          ) : (
            <>
              {/* ROUTE INFO */}
              <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-start gap-4">
                  <div className="bg-gray-100 p-3 rounded-full text-gray-500">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Pickup from</p>
                    <h4 className="font-extrabold text-gray-900 text-xl">{order.cafeterias?.name}</h4>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Deliver to</p>
                    <h4 className="font-extrabold text-gray-900">{customerName}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                      <Phone size={18} />
                    </button>
                    <Link href={`/chat/${order.id}`} className="p-3 bg-[#8a1515] text-white rounded-full hover:bg-[#6f1111] transition-colors shadow-sm">
                      <MessageSquare size={18} />
                    </Link>
                  </div>
                </div>
              </section>

              {/* QR SCANNER / MANUAL ENTRY */}
              <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center">
                <div className="bg-[#8a1515]/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center text-[#8a1515] mb-4">
                  <QrCode size={32} />
                </div>
                <h4 className="font-extrabold text-gray-900 text-lg mb-2">Verify Hand-off</h4>
                <p className="text-sm text-gray-500 mb-6">
                  Ask the student for their Pickup ID or scan their screen to complete this order.
                </p>

                <form onSubmit={handleVerify} className="max-w-xs mx-auto space-y-4">
                  <input 
                    type="text" 
                    placeholder="Enter 8-digit Pickup ID" 
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="w-full text-center font-mono font-bold tracking-widest px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8a1515] focus:outline-none"
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={isVerifying || !tokenInput}
                    className="w-full bg-[#1f2937] hover:bg-black text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isVerifying ? 'Verifying...' : 'Confirm Delivery'}
                  </button>
                </form>
              </section>
            </>
          )}

        </div>
      </main>
    </div>
  );
}