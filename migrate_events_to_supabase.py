#!/usr/bin/env python3
"""
Migration script to convert hardcoded calendar events to Supabase outings format.
This script generates a JSON file that can be imported into Supabase.
"""

from datetime import datetime, timedelta
import json
import re

# Hardcoded events from getDefaultCalendarEvents()
events = {
    # Septembre 2025
    '28-9-2025': {
        'title': '👨‍👩‍👧‍👦 Réunion parents',
        'time': 'Dimanche',
        'description': 'Réunion d\'information pour les parents'
    },

    # Octobre 2025
    '3-10-2025': {
        'title': '🏕️ Weekend de Groupe',
        'time': 'Vendredi - Départ',
        'description': 'Weekend de groupe avec activités scoutes'
    },
    '4-10-2025': {
        'title': '🏕️ Weekend de Groupe',
        'time': 'Samedi - Retour',
        'description': 'Weekend de groupe avec activités scoutes'
    },
    '12-10-2025': {
        'title': '⛵ Sortie voile',
        'time': 'Dimanche',
        'description': 'Sortie voile à Verneuil sur Seine'
    },

    # Novembre 2025
    '15-11-2025': {
        'title': '⛪ Weekend Abbaye d\'Epernon',
        'time': 'Samedi - Départ',
        'description': 'Weekend au Prieuré Saint Thomas'
    },
    '16-11-2025': {
        'title': '⛪ Weekend Abbaye d\'Epernon',
        'time': 'Dimanche - Retour',
        'description': 'Weekend au Prieuré Saint Thomas'
    },

    # Décembre 2025
    '14-12-2025': {
        'title': '🕯️ Lumière de Bethléem',
        'time': 'Dimanche',
        'description': 'Lumière de Bethléem + Crèche vivante'
    },

    # Janvier 2026
    '18-1-2026': {
        'title': '⚓ Sortie Musée de la Marine',
        'time': 'Dimanche',
        'description': 'Sortie Musée de la Marine + galettes'
    },

    # Février 2026
    '8-2-2026': {
        'title': '🗼 Sortie Montmartre',
        'time': 'Dimanche',
        'description': 'Découverte de Montmartre et du Sacré-Cœur'
    },

    # Mars 2026
    '14-3-2026': {
        'title': '🌸 Weekend de mars',
        'time': 'Samedi - Départ',
        'description': 'Weekend de printemps avec activités nature'
    },
    '15-3-2026': {
        'title': '🌸 Weekend de mars',
        'time': 'Dimanche - Retour',
        'description': 'Weekend de printemps avec activités nature'
    },

    # Avril 2026
    '12-4-2026': {
        'title': '🏰 Sortie château',
        'time': 'Dimanche',
        'description': 'Visite d\'un château historique'
    },

    # Mai 2026
    '15-5-2026': {
        'title': '🏰 Mini-camp Mont Saint-Michel',
        'time': 'Vendredi - Départ',
        'description': 'Mini-camp au Mont Saint-Michel'
    },
    '16-5-2026': {
        'title': '🏰 Mini-camp Mont Saint-Michel',
        'time': 'Samedi',
        'description': 'Mini-camp au Mont Saint-Michel'
    },
    '17-5-2026': {
        'title': '🏰 Mini-camp Mont Saint-Michel',
        'time': 'Dimanche - Retour',
        'description': 'Mini-camp au Mont Saint-Michel'
    },

    # Juin 2026
    '12-6-2026': {
        'title': '👨‍👩‍👧‍👦 Réunion présentation camp',
        'time': 'Vendredi 18h-20h',
        'description': 'Réunion de présentation du camp d\'été'
    },
    '13-6-2026': {
        'title': '🌸 Weekend de juin',
        'time': 'Samedi - Départ',
        'description': 'Weekend de fin d\'année'
    },
    '14-6-2026': {
        'title': '🌸 Weekend de juin',
        'time': 'Dimanche - Retour',
        'description': 'Weekend de fin d\'année'
    },

    # Juillet 2026
    '5-7-2026': {
        'title': '🏕️ Camp d\'été',
        'time': 'Départ',
        'description': 'Camp d\'été (première quinzaine des vacances Zone C)'
    },
    '19-7-2026': {
        'title': '🏕️ Camp d\'été',
        'time': 'Retour',
        'description': 'Fin du camp d\'été (dates exactes à confirmer)'
    }
}

def parse_date(date_str):
    """Parse date string in format 'd-m-yyyy' to datetime"""
    day, month, year = date_str.split('-')
    return datetime(int(year), int(month), int(day))

def slugify(text):
    """Create a URL-friendly slug from text"""
    # Remove emojis and special characters
    text = re.sub(r'[^\w\s-]', '', text)
    # Replace spaces with hyphens
    text = re.sub(r'[\s_]+', '-', text)
    # Convert to lowercase
    return text.lower().strip('-')

def group_events_by_outing(events_dict):
    """Group events that belong to the same outing (same title)"""
    outings = {}

    for date_str, event in sorted(events_dict.items(), key=lambda x: parse_date(x[0])):
        title = event['title']

        # Check if this is a continuation of an existing event
        if title in outings:
            # Update end date
            date = parse_date(date_str)
            if 'retour' in event['time'].lower() or 'fin' in event['time'].lower():
                # Set end time to evening (18:00)
                outings[title]['end_date'] = date.replace(hour=18, minute=0)
            else:
                # Extend the event
                if outings[title]['end_date'] is None or date > outings[title]['end_date']:
                    outings[title]['end_date'] = date.replace(hour=18, minute=0)
        else:
            # New outing
            date = parse_date(date_str)
            start_time = date.replace(hour=9, minute=0)  # Default start time
            end_time = None

            # Determine if it's a single day or multi-day event
            if 'départ' in event['time'].lower():
                end_time = None  # Will be set when we find the return date
            elif 'retour' in event['time'].lower():
                # This shouldn't happen, but handle it
                end_time = date.replace(hour=18, minute=0)
            else:
                # Single day event
                end_time = date.replace(hour=18, minute=0)

            # Extract location from title or description
            location = ""
            if 'mont saint-michel' in event['description'].lower():
                location = "Mont Saint-Michel"
            elif 'abbaye' in event['title'].lower():
                location = "Prieuré Saint Thomas, Epernon"
            elif 'verneuil' in event['description'].lower():
                location = "Verneuil sur Seine"
            elif 'montmartre' in event['title'].lower():
                location = "Montmartre, Paris"
            elif 'musée de la marine' in event['title'].lower():
                location = "Musée de la Marine, Paris"

            outings[title] = {
                'slug': slugify(title) + '-' + date.strftime('%Y-%m'),
                'title': title,
                'start_date': start_time,
                'end_date': end_time,
                'location': location,
                'meeting_point': '',
                'departure_details': '',
                'return_details': '',
                'notes': event['description'],
                'auto_carpool': False  # Can be enabled manually later
            }

    return list(outings.values())

def convert_to_supabase_format(outings_list):
    """Convert outings to Supabase format"""
    supabase_outings = []

    for outing in outings_list:
        supabase_outing = {
            'slug': outing['slug'],
            'title': outing['title'],
            'start_at': outing['start_date'].isoformat(),
            'end_at': outing['end_date'].isoformat() if outing['end_date'] else None,
            'location': outing['location'],
            'meeting_point': outing['meeting_point'],
            'departure_details': outing['departure_details'],
            'return_details': outing['return_details'],
            'notes': outing['notes'],
            'auto_carpool': outing['auto_carpool']
        }
        supabase_outings.append(supabase_outing)

    return supabase_outings

# Process events
print("Grouping events by outing...")
outings = group_events_by_outing(events)
print(f"Found {len(outings)} distinct outings")

print("\nConverting to Supabase format...")
supabase_outings = convert_to_supabase_format(outings)

# Save to JSON file
output_file = 'outings_to_import.json'
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(supabase_outings, f, ensure_ascii=False, indent=2)

print(f"\n[OK] Migration complete! Outings saved to {output_file}")
print(f"\nFound {len(supabase_outings)} outings to import:")
for outing in supabase_outings:
    print(f"  - {outing['title']} ({outing['start_at'][:10]})")

print("\nNext steps:")
print("1. Review the generated 'outings_to_import.json' file")
print("2. Use the Supabase dashboard or the admin panel to import these outings")
print("3. You'll need the admin password (Scout2025!) to create outings")
