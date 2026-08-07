export interface DestinationGuide {
  id: string
  match: RegExp
  label: string
  blurb: string
  climate: string
  packing: string[]
  places: { title: string; detail: string; category: string }[]
  tips: string[]
}

const PILOT_BASE_PACKING = [
  'Passport / crew ID',
  'Pilot certificate & medical',
  'Logbook',
  'Noise-cancelling headset (if positioning)',
  'Phone + aviation apps charged',
  'Universal power adapter',
  'Favorite dog photo for the hotel nightstand',
  'Portable lint roller (uniform + pup hair)',
]

export const DESTINATION_GUIDES: DestinationGuide[] = [
  {
    id: 'lisbon',
    match: /lisbon|lisboa|portugal|porto|sintra/i,
    label: 'Lisbon & Portugal',
    blurb: 'Hills, tiles, and Atlantic light — pack for walking and mild evenings.',
    climate: 'Mild Atlantic · expect hills and breezy evenings',
    packing: [
      'Comfortable walking shoes',
      'Light jacket for miradouro sunsets',
      'Reusable water bottle',
      'Metro / transit card space in wallet',
      'Sunscreen (coastal glare)',
    ],
    places: [
      {
        title: 'Miradouro da Senhora do Monte',
        detail: 'Classic Lisbon sunset overlook in Graça.',
        category: 'Viewpoint',
      },
      {
        title: 'Belém & Pastéis de Belém',
        detail: 'Monastery, tower, and the famous custard tarts — go early.',
        category: 'Food & culture',
      },
      {
        title: 'Tram 28',
        detail: 'Scenic ride through Alfama; watch bags and sit on the right.',
        category: 'Transit',
      },
      {
        title: 'Day trip to Sintra',
        detail: 'Pena Palace timed tickets; train from Rossio every ~30 min.',
        category: 'Day trip',
      },
    ],
    tips: [
      'LIS is well connected by metro — Aeroporto stop is straightforward.',
      'Hills are real; plan softer footwear than dress shoes.',
      'Many museums close Mondays — check before you lock the day.',
    ],
  },
  {
    id: 'tokyo',
    match: /tokyo|japan|osaka|kyoto|narita|haneda/i,
    label: 'Tokyo & Japan',
    blurb: 'Efficient, layered, and easy to overpack — travel light and cash-smart.',
    climate: 'Seasonal swings · summers humid, winters crisp',
    packing: [
      'IC transit card (Suica/Pasmo) or phone wallet ready',
      'Compact umbrella',
      'Slip-on shoes for temples / some lodgings',
      'Portable battery pack',
      'Light layers for trains and AC indoors',
    ],
    places: [
      {
        title: 'TeamLab Planets or Borderless',
        detail: 'Book timed entry; plan a half-day around it.',
        category: 'Experience',
      },
      {
        title: 'Tsukiji Outer Market breakfast',
        detail: 'Early seafood and tamagoyaki before the city wakes up.',
        category: 'Food',
      },
      {
        title: 'Shimokitazawa stroll',
        detail: 'Record shops, coffee, and quieter side streets.',
        category: 'Neighborhood',
      },
      {
        title: 'Day trip to Kamakura or Nikko',
        detail: 'Temples + coast or shrines in the hills — easy rail day.',
        category: 'Day trip',
      },
    ],
    tips: [
      'HND and NRT both work; factor transfer time into duty-free plans.',
      'Convenience stores are excellent for quick meals between hops.',
      'Trash cans are scarce — pack a small bag for wrappers.',
    ],
  },
  {
    id: 'paris',
    match: /paris|france|cdg|ory/i,
    label: 'Paris & France',
    blurb: 'Walkable core with café rhythm — dress neat and plan museum slots.',
    climate: 'Temperate · rain possible any month',
    packing: [
      'Smart-casual outfit for dinners',
      'Compact umbrella or rain shell',
      'Comfortable city shoes',
      'Museum reservation confirmations offline',
      'Light scarf for evenings',
    ],
    places: [
      {
        title: 'Musée d’Orsay',
        detail: 'Book ahead; quieter than the Louvre for a first art stop.',
        category: 'Museum',
      },
      {
        title: 'Canal Saint-Martin walk',
        detail: 'Cafés and bridges — good reset after a long sector.',
        category: 'Neighborhood',
      },
      {
        title: 'Sainte-Chapelle',
        detail: 'Stained glass at its best mid-morning on a clear day.',
        category: 'Sight',
      },
      {
        title: 'Marché des Enfants Rouges',
        detail: 'Oldest covered market — easy lunch grazing.',
        category: 'Food',
      },
    ],
    tips: [
      'RER B from CDG is fine with light bags; taxi if you’re short on turn time.',
      'Many kitchens close mid-afternoon — snack before long museum blocks.',
      'Validate tickets on regional trains before boarding.',
    ],
  },
  {
    id: 'nyc',
    match: /new york|nyc|manhattan|brooklyn|jfk|lga|ewr/i,
    label: 'New York City',
    blurb: 'Fast pace, subway logic, and layers for building-to-building weather.',
    climate: 'Four seasons · winters cold, summers humid',
    packing: [
      'MetroCard / OMNY-ready phone',
      'Layered clothing for subway heat vs street cold',
      'Comfortable walking shoes',
      'Small day bag with zip pockets',
      'Reusable water bottle',
    ],
    places: [
      {
        title: 'The High Line + Chelsea Market',
        detail: 'Easy half-day without deep planning.',
        category: 'Walk',
      },
      {
        title: 'Brooklyn Bridge at sunrise',
        detail: 'Quieter light and fewer crowds before briefings.',
        category: 'Viewpoint',
      },
      {
        title: 'Museum of Modern Art',
        detail: 'Central, focused, and easy to time-box.',
        category: 'Museum',
      },
      {
        title: 'Dumbo waterfront',
        detail: 'Skyline photos and coffee between commitments.',
        category: 'Neighborhood',
      },
    ],
    tips: [
      'Build buffer into JFK/LGA/EWR transfers — traffic is the real METAR.',
      'Tip for sit-down meals; many counters are quick-service.',
      'Download offline maps for subway backups when signal drops.',
    ],
  },
  {
    id: 'beach',
    match: /maui|hawaii|bali|cancun|maldives|caribbean|santorini|nice|miami|phuket|ibiza/i,
    label: 'Beach & warm coast',
    blurb: 'Sun, salt, and light bags — protect skin and keep one nicer evening outfit.',
    climate: 'Warm to hot · UV is the main factor',
    packing: [
      'Reef-safe sunscreen',
      'Swimwear + quick-dry cover-up',
      'Sunglasses and hat',
      'Sandals and one closed-toe pair',
      'After-sun lotion / aloe',
    ],
    places: [
      {
        title: 'Sunrise waterfront walk',
        detail: 'Beat heat and crowds with an early coastal loop.',
        category: 'Outdoors',
      },
      {
        title: 'Local seafood market dinner',
        detail: 'Ask the hotel or crew lounge for the current favorite stall.',
        category: 'Food',
      },
      {
        title: 'Boat or snorkel half-day',
        detail: 'Book with cancellation flexibility around duty changes.',
        category: 'Activity',
      },
    ],
    tips: [
      'Hydrate more than you think on humid layovers.',
      'Keep electronics out of direct sun in the bag.',
      'One wrinkle-resistant dinner outfit covers most resort nights.',
    ],
  },
  {
    id: 'mountain',
    match: /aspen|denver|alps|swiss|zermatt|banff|queenstown|innsbruck|reykjav|iceland|patagonia/i,
    label: 'Mountains & cool air',
    blurb: 'Layers win — mornings cold, afternoons bright, evenings sharp.',
    climate: 'Cool to cold · wind and elevation matter',
    packing: [
      'Insulating mid-layer',
      'Waterproof shell',
      'Warm hat and gloves',
      'Broken-in hiking shoes',
      'Lip balm and strong moisturizer',
    ],
    places: [
      {
        title: 'Scenic overlook drive or gondola',
        detail: 'Easy win when turn time is short.',
        category: 'Viewpoint',
      },
      {
        title: 'Thermal soak or spa hour',
        detail: 'Recovery after a long duty day in thin air.',
        category: 'Recovery',
      },
      {
        title: 'Local bakery breakfast',
        detail: 'Carb up before elevation walks.',
        category: 'Food',
      },
    ],
    tips: [
      'Altitude can sneak up — ease into day-one activity.',
      'Weather flips fast; keep the shell reachable in your bag.',
      'Confirm mountain road or trail closures before locking plans.',
    ],
  },
]

export const GENERIC_GUIDE: DestinationGuide = {
  id: 'generic',
  match: /.*/,
  label: 'Your destination',
  blurb: 'Solid crew-style packing plus flexible plans you can tighten once you land.',
  climate: 'Check the local forecast before you lock layers',
  packing: [
    'Weather-appropriate layers',
    'Comfortable all-day shoes',
    'Medications & basic first aid',
    'Offline maps downloaded',
    'One smart-casual outfit',
  ],
  places: [
    {
      title: 'Neighborhood orientation walk',
      detail: 'First evening: groceries, pharmacy, and a simple dinner nearby.',
      category: 'Settle in',
    },
    {
      title: 'One signature local meal',
      detail: 'Ask hotel staff or other crew for the current favorite.',
      category: 'Food',
    },
    {
      title: 'City viewpoint or waterfront',
      detail: 'A high or open spot helps you learn the layout fast.',
      category: 'Viewpoint',
    },
  ],
  tips: [
    'Keep day one light after a positioning flight.',
    'Screenshot confirmations in case roaming is spotty.',
    'Leave one open block for whatever the layover invites.',
  ],
}

export function findDestinationGuide(destination: string): DestinationGuide {
  const trimmed = destination.trim()
  if (!trimmed) return GENERIC_GUIDE
  return (
    DESTINATION_GUIDES.find((guide) => guide.match.test(trimmed)) ??
    GENERIC_GUIDE
  )
}

export function packingSuggestionsFor(destination: string): string[] {
  const guide = findDestinationGuide(destination)
  const combined = [...PILOT_BASE_PACKING, ...guide.packing]
  return [...new Set(combined)]
}
