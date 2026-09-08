-- RPC para decrementar stock e incrementar ventas de un producto tras una venta pagada.
create or replace function decrement_product_stock(p_product_id uuid, p_qty integer)
returns void
language plpgsql
security definer
as 
begin
  update marketplace_products
  set
    stock = greatest(0, (select coalesce(stock, 0) from marketplace_products where id = p_product_id) - p_qty),
    ventas = (select coalesce(ventas, 0) from marketplace_products where id = p_product_id) + p_qty,
    updated_at = now()
  where id = p_product_id;
end;
;
