import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bike, ShieldCheck, Banknote } from 'lucide-react';
import { revalidatePath } from 'next/cache';

// INLINE SERVER ACTION: Upgrades the user's role to 'rider'
async function upgradeToRider() {
  'use server';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'rider' })
    .eq('id', user.id);

  if (error) {
    console.error('Upgrade error:', error);
    return;
  }

  // Refresh the app state and send them to the new Agent Dashboard
  revalidatePath('/', 'layout');
  redirect('/delivery');
}

export default async function RiderSignupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // If they are already a rider, send them straight to the dashboard
  if (profile?.role === 'rider') {
    redirect('/delivery');
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-[#1f2937]">
      <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-5 bg-white border-b border-gray-200 shadow-sm">
        <Link href="/" className="p-2 bg-gray-50 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <h2 className="text-xl font-extrabold text-gray-900">Become a Rider</h2>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
          <div className="bg-[#8a1515]/10 w-20 h-20 mx-auto rounded-full flex items-center justify-center text-[#8a1515] mb-6">
            <Bike size={40} />
          </div>
          
          <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Deliver & Earn</h3>
          <p className="text-gray-500 mb-8">Join the campus delivery fleet. Earn a flat ₦500 service charge for every meal you successfully deliver to a student.</p>

          <div className="space-y-4 mb-8 text-left">
            <div className="flex items-center gap-3">
              <Banknote className="text-green-600" size={24} />
              <span className="font-medium text-gray-700">Instant ₦500 per delivery</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-blue-600" size={24} />
              <span className="font-medium text-gray-700">Secure QR Code verification</span>
            </div>
          </div>

          <form action={upgradeToRider}>
            <button type="submit" className="w-full bg-[#8a1515] hover:bg-[#6f1111] text-white font-extrabold py-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2">
              Accept & Upgrade Account
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}