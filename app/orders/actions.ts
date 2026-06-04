'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitOrder(cartItems: any[], cafeteriaId: string, subtotal: number, deliveryFee: number) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'You must be logged in to place an order.' };
  }

  const totalAmount = subtotal + deliveryFee;

  // 1. Create the Main Order (This automatically generates the qr_code_token)
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: user.id,
      cafeteria_id: cafeteriaId,
      total_amount: totalAmount,
      status: 'pending',
      estimated_ready_time: new Date(Date.now() + 15 * 60000).toISOString(), // 15 mins from now
    })
    .select()
    .single();

  if (orderError) return { error: 'Failed to create order: ' + orderError.message };

  // 2. Insert the Individual Meals (Order Items)
  const orderItemsData = cartItems.map(item => ({
    order_id: order.id,
    meal_id: item.id,
    quantity: item.quantity,
    price: item.price
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
  if (itemsError) return { error: 'Failed to save items: ' + itemsError.message };

  // 3. Create the Delivery Ticket for Riders to accept
  const { error: deliveryError } = await supabase.from('deliveries').insert({
    order_id: order.id,
    delivery_fee: deliveryFee,
    status: 'assigned'
  });

  if (deliveryError) return { error: 'Failed to create delivery ticket: ' + deliveryError.message };

  // 4. Revalidate data so the dashboard updates instantly
  revalidatePath('/', 'layout');
  
  return { success: true, orderId: order.id };
}