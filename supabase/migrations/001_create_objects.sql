-- Create objects table for storing 3D exhibit items
create table if not exists objects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tone text not null default '',
  knowledge text not null default '',
  suggested_questions text[] not null default '{}',
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger objects_updated_at
  before update on objects
  for each row
  execute function update_updated_at();

-- Create storage bucket for object images
insert into storage.buckets (id, name, public)
values ('object-images', 'object-images', true)
on conflict (id) do nothing;

-- Allow public read access to object images
create policy "Public read access" on storage.objects
  for select using (bucket_id = 'object-images');

-- Allow authenticated uploads
create policy "Allow uploads" on storage.objects
  for insert with check (bucket_id = 'object-images');

create policy "Allow updates" on storage.objects
  for update using (bucket_id = 'object-images');

create policy "Allow deletes" on storage.objects
  for delete using (bucket_id = 'object-images');
