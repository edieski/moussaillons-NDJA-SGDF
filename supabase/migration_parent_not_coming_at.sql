-- Afficher "Parents : non" dans l'UI quand un parent a cliqué sur "Mon enfant ne vient pas"
-- On enregistre la date de cette réponse pour la distinguer de "pas encore de réponse".

alter table public.attendance_records
    add column if not exists parent_not_coming_at timestamptz;

comment on column public.attendance_records.parent_not_coming_at is 'Date à laquelle le parent a indiqué que l''enfant ne vient pas (distinct de pas de réponse).';

create or replace function public.set_parent_confirmation(
    p_outing_id uuid,
    p_child_id uuid,
    p_scout_name text,
    p_confirmed boolean
)
returns public.attendance_records
language plpgsql
security definer
set search_path = public
as $$
declare
    v_now timestamptz := timezone('utc', now());
    v_record public.attendance_records;
begin
    insert into public.attendance_records (
        outing_id,
        scout_name,
        status,
        notes,
        marked_by,
        scout_team,
        marked_at,
        child_id,
        parent_confirmed,
        parent_confirmed_at,
        parent_not_coming_at
    )
    values (
        p_outing_id,
        p_scout_name,
        'present',
        '',
        'parent',
        null,
        v_now,
        p_child_id,
        p_confirmed,
        case when p_confirmed then v_now else null end,
        case when p_confirmed then null else v_now end
    )
    on conflict (outing_id, scout_name)
    do update set
        child_id = coalesce(excluded.child_id, public.attendance_records.child_id),
        parent_confirmed = excluded.parent_confirmed,
        parent_confirmed_at = case
            when excluded.parent_confirmed = false then null
            when public.attendance_records.parent_confirmed = false and excluded.parent_confirmed = true then v_now
            else coalesce(public.attendance_records.parent_confirmed_at, v_now)
        end,
        parent_not_coming_at = case when excluded.parent_confirmed = false then v_now else null end
    returning * into v_record;

    return v_record;
end;
$$;
