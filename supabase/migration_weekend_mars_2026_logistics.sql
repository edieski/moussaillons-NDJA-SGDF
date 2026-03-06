-- Mise à jour des infos logistiques du Weekend de mars (14-15 mars 2026)
-- Lieu : Jambeville
-- RDV départ : 14h
-- Retour : 17h le dimanche, rdv place de la Loi

update public.outings
set
    location = 'Jambeville',
    meeting_point = 'RDV 14h',
    departure_details = 'RDV 14h',
    return_details = '17h le dimanche, rdv place de la Loi',
    start_at = '2026-03-14T10:00:00Z',
    end_at = '2026-03-15T19:00:00Z',
    updated_at = timezone('utc', now())
where slug = 'weekend-de-mars-2026-03';
