-- Descripción específica por producto (título + beneficio según categoría).
update marketplace_products
set descripcion = titulo || '. ' || case
  when categoria = 'electronica' then 'Producto electrónico para auto, fácil de instalar y con excelente calidad de imagen y sonido. Ideal para actualizar tu vehículo.'
  when categoria = 'accesorios' then 'Accesorio práctico y resistente para tu auto o moto. Mejora la funcionalidad y el estilo con una instalación sencilla.'
  when categoria = 'confort' then 'Pensado para darte mayor comodidad y aprovechamiento del espacio en cada viaje. Materiales de calidad y fácil colocación.'
  when categoria = 'seguridad' then 'Elemento de seguridad que aporta protección extra y tranquilidad. Fabricado con materiales resistentes y durables.'
  when categoria = 'repuestos' then 'Repuesto de calidad con ajuste preciso. Ideal para mantener tu vehículo en óptimas condiciones.'
  else 'Producto de alta demanda para autos y motos, con buena relación precio-calidad y materiales resistentes.'
end
where descripcion like 'Producto de alta demanda para el mercado automotriz%';
