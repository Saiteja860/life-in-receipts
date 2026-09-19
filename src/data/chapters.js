// Curated chapter metadata — the narrative layer over the raw receipts.
// Each arc maps to a chapter; receipts are linked by arc + tags + day.
export const CHAPTERS = [
  {
    id: 'a1',
    num: '01',
    title: 'The Quiet After',
    span: 'Jan 6 — Feb 20',
    color: '#7c8aa0',
    mood: 2,
    moodLabel: 'heavy',
    blurb:
      'It starts at a train platform in January. Songs at 2 AM. Ice cream for one. A room that got too quiet. The archive opens here — not because it is the loudest chapter, but because it is the one everything after was built on.',
  },
  {
    id: 'a2',
    num: '02',
    title: 'Small Rebellions',
    span: 'Feb 21 — Apr 15',
    color: '#6ea86b',
    mood: 4,
    moodLabel: 'rising',
    blurb:
      'A gym membership at 5:47 PM on an ordinary Tuesday. Then shoes. Then sunrise. The receipts show something no single record admits: a person quietly rebuilding, 2.1 kilometres at a time.',
  },
  {
    id: 'a3',
    num: '03',
    title: 'The Interview Gauntlet',
    span: 'Apr 16 — May 30',
    color: '#c9a24b',
    mood: 4,
    moodLabel: 'nervous fire',
    blurb:
      'Fourteen cold brews from one coffee shop. Search histories that spell out anxiety. A disaster interview, owned. And an email opened at 12:30 PM that changed the zip code of the whole year.',
  },
  {
    id: 'a4',
    num: '04',
    title: 'Salt Air & Scooters',
    span: 'Jun 5 — Jun 12',
    color: '#4fa3a5',
    mood: 5,
    moodLabel: 'wide open',
    blurb:
      'Six days in Goa with the group chat that never sleeps. A dented pink scooter. Sunscreen bought a day too late. The arc of this chapter is small on the map and enormous in the ledger.',
  },
  {
    id: 'a5',
    num: '05',
    title: 'New City, New Frequency',
    span: 'Jul 1 — Jul 20',
    color: '#a06bc9',
    mood: 4,
    moodLabel: 'tuning in',
    blurb:
      'A mattress. A lamp. A kettle. An empty room photographed before it filled. Moving to Bangalore alone — and the commuter playlists of someone learning a city by getting lost in it.',
  },
  {
    id: 'a6',
    num: '06',
    title: 'Two Straws, One Milkshake',
    span: 'Aug 8 — Sep 30',
    color: '#d16a7f',
    mood: 5,
    moodLabel: 'warm',
    blurb:
      'It begins at a birthday party with a twice-told story. Then milkshakes with two straws, a bench in Cubbon Park, a scarf "confiscated". Watch the messages, movies and playlists start to rhyme with each other.',
  },
  {
    id: 'a7',
    num: '07',
    title: 'Six Strings',
    span: 'Sep 21 — Nov 18',
    color: '#b07f3f',
    mood: 4,
    moodLabel: 'flow',
    blurb:
      'An impulse purchase: a Yamaha F280. Forty attempts at a barre chord. Blistered fingers, one high E string sacrificed, and on November 2nd — an entire song, start to finish, for one person in particular.',
  },
  {
    id: 'a8',
    num: '08',
    title: 'The Long Way Home',
    span: 'Nov 19 — Dec 31',
    color: '#c9754b',
    mood: 5,
    moodLabel: 'golden',
    blurb:
      'A side-lower berth home for Diwali. A rangoli that has never lost. K3G with no protests entertained. The year closes on a rooftop with the people who stayed — and one playlist made of all of it.',
  },
]

export const CHAPTER_MAP = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]))

export const TYPE_META = {
  music: { label: 'Music', icon: '🎵', ink: '#4a3b8f' },
  movie: { label: 'Movie', icon: '🎬', ink: '#8f3b6a' },
  place: { label: 'Place', icon: '📍', ink: '#2f7d5a' },
  purchase: { label: 'Purchase', icon: '🛍️', ink: '#a3552f' },
  photo: { label: 'Photo', icon: '📷', ink: '#356a8f' },
  message: { label: 'Message', icon: '💬', ink: '#6b6b3f' },
  search: { label: 'Search', icon: '🔎', ink: '#555555' },
  event: { label: 'Event', icon: '⭐', ink: '#b0891f' },
  note: { label: 'Note', icon: '📝', ink: '#4f4f6b' },
}
