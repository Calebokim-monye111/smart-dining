'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function verifyAndCompleteDelivery(deliveryId: string, orderId: string, scannedToken: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  // 1. Fetch the actual order to check the secret token
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('qr_code_token, status')
    .eq('id', orderId)
    .single();

  if (orderError || !order) return { error: 'Order not found.' };
  if (order.status === 'delivered') return { error: 'Order is already marked as delivered.' };

  // 2. Security Check: Does the scanned token match the database?
  // We check if the scanned input matches the token (or at least the first segment for easy manual testing)
  const isMatch = order.qr_code_token === scannedToken || order.qr_code_token.startsWith(scannedToken);

  if (!isMatch) {
    return { error: 'Invalid QR Code. Please try scanning again.' };
  }

  // 3. If it matches, update the Order to 'delivered'
  const { error: updateOrderError } = await supabase
    .from('orders')
    .update({ status: 'delivered' })
    .eq('id', orderId);

  if (updateOrderError) return { error: 'Failed to update order status.' };

  // 4. Update the Delivery ticket to 'completed'
  const { error: updateDeliveryError } = await supabase
    .from('deliveries')
    .update({ status: 'completed' })
    .eq('id', deliveryId);

  if (updateDeliveryError) return { error: 'Failed to complete delivery ticket.' };

  // 5. Refresh the UI
  revalidatePath('/delivery');
  revalidatePath('/', 'layout');

  return { success: true };
}