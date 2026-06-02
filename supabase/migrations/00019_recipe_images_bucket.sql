-- Create public bucket for recipe images
insert into storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
values (
  'recipe-images',
  'recipe-images',
  true,
  false,
  5242880, -- 5MB limit
  '{"image/jpeg","image/png","image/webp"}'
)
on conflict (id) do nothing;

-- Policy: Allow authenticated users to upload to recipe-images
-- (Admin uploads via client with service role key; public read via public bucket)
create policy "Allow public read access on recipe-images"
  on storage.objects
  for select
  to public
  using (bucket_id = 'recipe-images');

create policy "Allow authenticated users to upload recipe images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'recipe-images');

create policy "Allow authenticated users to update their recipe images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'recipe-images');

create policy "Allow authenticated users to delete their recipe images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'recipe-images');
