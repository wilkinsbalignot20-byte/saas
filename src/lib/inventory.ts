// src/lib/inventory.ts
import { supabase } from './supabase';

/**
 * Automatically adjusts product stock in the database during checkout or returns.
 * Sinasabihan nito ang database na bawasan o dagdagan ang units ng paninda.
 */
export async function adjustProductStock(productId: string, quantityChange: number) {
  try {
    // 1. Fetch current stock configuration
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock, name')
      .eq('id', productId)
      .single();

    if (fetchError || !product) throw new Error('Product not found in the tenant catalog tree.');

    // 2. Compute new stock level (e.g., current stock - purchased quantity)
    const newStock = product.stock + quantityChange;

    if (newStock < 0) {
      throw new Error(`Insufficient stock for item: ${product.name}. Cannot complete execution.`);
    }

    // 3. Update the table database value directly
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId);

    if (updateError) throw updateError;

    console.log(`[Inventory Core Log]: Successfully updated stock for ${product.name} to ${newStock} units.`);
    return { success: true, currentStock: newStock };

  } catch (error: any) {
    console.error('Inventory operation exception triggered:', error.message);
    return { success: false, error: error.message };
  }
}
