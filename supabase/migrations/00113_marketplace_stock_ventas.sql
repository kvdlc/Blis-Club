-- Stock y ventas para badges de urgencia + "ventas totales".
alter table marketplace_products add column if not exists stock integer default 50;
alter table marketplace_products add column if not exists ventas integer default 0;

-- Índice para búsqueda por url (usado en re-precio y webhook)
create index if not exists marketplace_products_url_temu_idx on marketplace_products (url_temu);
