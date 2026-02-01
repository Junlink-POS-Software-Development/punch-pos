-- Create playground_states table
create table if not exists public.playground_states (
  id uuid not null default gen_random_uuid(),
  store_id uuid not null,
  name text not null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint playground_states_pkey primary key (id),
  constraint playground_states_store_id_fkey foreign key (store_id) references public.stores(store_id) on delete cascade
);

-- Enable RLS
alter table public.playground_states enable row level security;

-- Create RLS policies
create policy "Users can view their store's playground states"
  on public.playground_states for select
  using (store_id in (select store_id from public.users where user_id = auth.uid()));

create policy "Users can insert playground states for their store"
  on public.playground_states for insert
  with check (store_id in (select store_id from public.users where user_id = auth.uid()));

create policy "Users can update their store's playground states"
  on public.playground_states for update
  using (store_id in (select store_id from public.users where user_id = auth.uid()));

create policy "Users can delete their store's playground states"
  on public.playground_states for delete
  using (store_id in (select store_id from public.users where user_id = auth.uid()));

-- Add triggers for updated_at
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on public.playground_states
  for each row execute procedure moddatetime (updated_at);
