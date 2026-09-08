-- Corregir FK: product_orders.product_id debe apuntar a marketplace_products (no a products).
alter table product_orders drop constraint if exists product_orders_product_id_fkey;
alter table product_orders drop constraint if exists product_orders_product_id_fkey1;
alter table product_orders add constraint product_orders_product_id_fkey
  foreign key (product_id) references marketplace_products(id) on delete cascade;

-- Políticas RLS para product_orders (insert del usuario autenticado + ver sus órdenes).
drop policy if exists "Users can insert own product orders" on product_orders;
create policy "Users can insert own product orders"
  on product_orders for insert with check (auth.uid() = user_id);

drop policy if exists "Users can view own product orders" on product_orders;
create policy "Users can view own product orders"
  on product_orders for select using (auth.uid() = user_id);
