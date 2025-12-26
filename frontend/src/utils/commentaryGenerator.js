const commentaryTemplates = {
  runs: [
    "{runs} run(s) taken.",
    "They run {runs}.",
    "{runs} more to the total.",
    "Good running between the wickets, {runs} runs.",
    "Easy {runs} run(s)."
  ],
  boundaries: {
    4: [
      "FOUR! What a shot!",
      "Cracking shot through the {zone} for FOUR!",
      "Boundary! The ball races to the {zone} boundary.",
      "FOUR runs! Excellent placement to {zone}.",
      "Elegantly driven through {zone} for FOUR."
    ],
    6: [
      "SIX! That's huge!",
      "Maximum! Clears the {zone} boundary with ease.",
      "SIX runs! What a hit!",
      "That's gone all the way! SIX over {zone}.",
      "Monstrous hit! SIX into the {zone} stands."
    ]
  },
  wickets: {
    bowled: [
      "OUT! Bowled him!",
      "Timber! The stumps are shattered.",
      "Clean bowled! That's a great delivery.",
      "Bowled! No chance for the batsman."
    ],
    caught: [
      "OUT! Caught!",
      "That's a simple catch at {zone}.",
      "Caught! The fielder makes no mistake.",
      "OUT! Edged and taken."
    ],
    lbw: [
      "OUT! LBW!",
      "That's plumb! LBW given.",
      "Appeal... and given! LBW.",
      "Trapped in front! That's OUT."
    ],
    'run out': [
      "OUT! Run out!",
      "What a throw! Run out at the {zone} end.",
      "Direct hit! Run out.",
      "Miscommunication and he's RUN OUT!"
    ],
    stumped: [
      "OUT! Stumped!",
      "Brilliant work by the keeper! Stumped.",
      "Stumped! He was well out of his crease.",
      "OUT! Stumped down the leg side."
    ]
  },
  extras: {
    wide: [
      "Wide ball.",
      "That's too wide, called a wide.",
      "Wide down the {zone} side.",
      "Extra run, called wide."
    ],
    'no ball': [
      "No ball! Free hit coming up.",
      "Overstepped! That's a no ball.",
      "No ball for height.",
      "That's a no ball, extra run."
    ]
  },
  dot: [
    "No run.",
    "Good delivery, defended.",
    "Dot ball.",
    "Played straight to the fielder at {zone}.",
    "Well bowled, no run."
  ]
};

function generateCommentary(runs, isWicket, wicketType, shotArea) {
  let commentary = '';
  const zone = shotArea?.zone || 'off side';
  
  if (isWicket && wicketType) {
    const templates = commentaryTickets.wickets[wicketType] || commentaryTickets.wickets.bowled;
    commentary = templates[Math.floor(Math.random() * templates.length)];
  } else if (runs === 4) {
    const templates = commentaryTemplates.boundaries[4];
    commentary = templates[Math.floor(Math.random() * templates.length)];
  } else if (runs === 6) {
    const templates = commentaryTemplates.boundaries[6];
    commentary = templates[Math.floor(Math.random() * templates.length)];
  } else if (runs > 0) {
    const templates = commentaryTemplates.runs;
    commentary = templates[Math.floor(Math.random() * templates.length)];
  } else {
    const templates = commentaryTemplates.dot;
    commentary = templates[Math.floor(Math.random() * templates.length)];
  }
  
  // Replace placeholders
  commentary = commentary.replace('{runs}', runs);
  commentary = commentary.replace('{zone}', zone);
  
  return commentary;
}

module.exports = { generateCommentary };