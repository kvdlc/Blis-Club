-- Permitir guest checkout en product_orders (user_id puede ser null hasta pagar).
alter table product_orders alter column user_id drop not null;

-- Asegurar precio minimo de 7 USD en productos baratos restantes (5-7 USD).
update marketplace_products
set
  precio = case
    when categoria = 'electronica' then greatest(precio, 9.00)
    when categoria = 'seguridad' then greatest(precio, 8.00)
    when categoria = 'confort' then greatest(precio, 8.00)
    else greatest(precio, 7.00)
  end,
  precio_original = round((case
    when categoria = 'electronica' then greatest(precio, 9.00)
    when categoria = 'seguridad' then greatest(precio, 8.00)
    when categoria = 'confort' then greatest(precio, 8.00)
    else greatest(precio, 7.00)
  end) * 1.18, 2)
where precio < 7;
