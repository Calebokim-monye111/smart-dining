'use client';

import { useCartStore } from '@/lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Trash2, Plus, Minus, MapPin, Receipt, Bike } from 'lucide-react';
import { submitOrder } from './actions';

export default function CheckoutPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Core Feature 6: Delivery Service Charge
  const deliveryFee = 500; 
  const subtotal = getTotalPrice();
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    // Safety check to ensure we don't submit an empty order
    if (items.length === 0) return;
    
    setIsSubmitting(true);
    
    // Dynamically grab the cafeteria ID from the first item 
    // (Our store safely enforces that all items in the cart belong to the same cafeteria)
    const cafeteriaId = items[0].cafeteria_id;
    
    // Call the Supabase Server Action
    const response = await submitOrder(items, cafeteriaId, subtotal, deliveryFee);
    
    if (response?.error) {
      alert(response.error); // Notify the user of the error securely
      console.error('Error placing order:', response.error);
      setIsSubmitting(false);
      return;
    }

    // Success! Clear the cart and redirect to the active tracking page
    clearCart();
    router.push('/orders/active');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-[#1f2937]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-5 bg-white border-b border-gray-200 shadow-sm">
        <Link href="/" className="p-2 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <h2 className="text-xl font-extrabold text-gray-900">Checkout</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6 pb-24">
          
          {items.length > 0 ? (
            <>
              {/* CART ITEMS */}
              <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-extrabold text-gray-900">Your Order</h3>
                  <span className="text-xs font-bold text-[#8a1515] bg-[#8a1515]/10 px-2 py-1 rounded-md">
                    {items[0]?.cafeteria_name}
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.id} className="p-5 flex items-center gap-4">
                      <div className="h-16 w-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">No Img</div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 leading-tight">{item.name}</h4>
                        <p className="text-[#8a1515] font-bold mt-1">₦{item.price}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-3">
                        <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-1">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-gray-500 hover:text-gray-900"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* DELIVERY LOCATION INFO */}
              <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex items-start gap-4">
                <div className="bg-[#8a1515]/10 p-3 rounded-full text-[#8a1515]">
                  <MapPin size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-extrabold text-gray-900">Campus Delivery</h4>
                  <p className="text-sm text-gray-500 mt-1">Your order will be routed to an available student agent.</p>
                </div>
              </section>

              {/* ORDER SUMMARY */}
              <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
                <h4 className="font-extrabold text-gray-900 flex items-center gap-2 mb-4">
                  <Receipt size={20} className="text-gray-400" />
                  Payment Summary
                </h4>
                
                <div className="flex justify-between text-sm font-medium text-gray-600">
                  <span>Subtotal</span>
                  <span>₦{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-600">
                  <span className="flex items-center gap-2">
                    <Bike size={16} className="text-gray-400" />
                    Delivery Service Fee
                  </span>
                  <span>₦{deliveryFee}</span>
                </div>
                
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total to Pay</span>
                  <span className="text-2xl font-extrabold text-[#8a1515]">₦{total}</span>
                </div>
              </section>

              {/* CHECKOUT BUTTON */}
              <button 
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-[#8a1515] hover:bg-[#6f1111] text-white font-extrabold py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
              >
                {isSubmitting ? 'Processing Order...' : `Place Order (₦${total})`}
              </button>
            </>
          ) : (
            /* EMPTY CART STATE */
            <div className="bg-white rounded-3xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center shadow-sm h-[50vh]">
              <div className="bg-gray-50 p-6 rounded-full text-gray-300 mb-6">
                <Receipt size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-8 max-w-sm">Looks like you haven't added any meals from the cafeterias yet.</p>
              <Link href="/" className="bg-[#8a1515] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#6f1111] transition-colors">
                Browse Cafeterias
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}