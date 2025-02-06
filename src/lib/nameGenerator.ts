type NamePattern = {
  pattern: string;
  examples: string[];
  weight: number;
};

type IndustryPatterns = {
  patterns: NamePattern[];
  commonWords: string[];
  prefixRules: (word: string) => string[];
  suffixRules: (word: string) => string[];
};

const industryPatterns: Record<string, IndustryPatterns> = {
  technology: {
    patterns: [
      { 
        pattern: "prefix + root + ly",
        examples: ["Stackify", "Cloudify", "Codify"],
        weight: 0.4 
      },
      { 
        pattern: "root + io",
        examples: ["Twilio", "Rubio", "Stackio"],
        weight: 0.3 
      },
      { 
        pattern: "ai + root",
        examples: ["AiSense", "AiFlow", "AiCore"],
        weight: 0.3 
      }
    ],
    commonWords: ["stack", "cloud", "code", "data", "tech", "byte", "bit", "net", "web", "app"],
    prefixRules: (word) => [
      `${word}AI`,
      `i${word.charAt(0).toUpperCase() + word.slice(1)}`,
      `${word}Hub`,
      `${word}Flow`,
      `${word}Sync`
    ],
    suffixRules: (word) => [
      `${word}ify`,
      `${word}io`,
      `${word}ly`,
      `${word}Base`,
      `${word}Labs`
    ]
  },
  finance: {
    patterns: [
      {
        pattern: "fin + root",
        examples: ["FinWise", "FinCore", "FinFlow"],
        weight: 0.4
      },
      {
        pattern: "pay + root",
        examples: ["PayFlow", "PayWise", "PayCore"],
        weight: 0.3
      },
      {
        pattern: "root + capital",
        examples: ["WiseCapital", "CoreCapital", "FlowCapital"],
        weight: 0.3
      }
    ],
    commonWords: ["wealth", "money", "cash", "pay", "coin", "bank", "fund", "trade", "invest", "fin"],
    prefixRules: (word) => [
      `Fin${word.charAt(0).toUpperCase() + word.slice(1)}`,
      `${word}Capital`,
      `${word}Wealth`,
      `Smart${word}`,
      `${word}Trust`
    ],
    suffixRules: (word) => [
      `${word}Finance`,
      `${word}Bank`,
      `${word}Trade`,
      `${word}Fund`,
      `${word}Pay`
    ]
  },
  // Add more industries...
};

function generateIndustryName(keyword: string, industry: string): string[] {
  const patterns = industryPatterns[industry];
  if (!patterns) return [];

  const names = new Set<string>();
  const cleanKeyword = keyword.toLowerCase().trim();

  // Apply industry-specific patterns
  patterns.patterns.forEach(pattern => {
    if (Math.random() < pattern.weight) {
      patterns.prefixRules(cleanKeyword).forEach(name => names.add(name));
      patterns.suffixRules(cleanKeyword).forEach(name => names.add(name));
    }
  });

  // Generate compound words with industry common words
  patterns.commonWords.forEach(word => {
    if (word !== cleanKeyword) {
      names.add(`${cleanKeyword}${word.charAt(0).toUpperCase() + word.slice(1)}`);
      names.add(`${word}${cleanKeyword.charAt(0).toUpperCase() + cleanKeyword.slice(1)}`);
    }
  });

  // Apply advanced transformations
  const transformations = [
    // Vowel removal (e.g., Flickr, Tumblr)
    cleanKeyword.replace(/[aeiou]/g, ''),
    // Double letters (e.g., Fiverr)
    cleanKeyword.replace(/(.)\1*$/, '$1$1'),
    // -ly suffix (e.g., Fastly)
    `${cleanKeyword}ly`,
    // -ify suffix (e.g., Shopify)
    `${cleanKeyword}ify`,
    // -io suffix (e.g., Twilio)
    `${cleanKeyword}io`
  ];

  transformations.forEach(name => names.add(name));

  return Array.from(names)
    .map(name => name.charAt(0).toUpperCase() + name.slice(1))
    .filter(name => name.length > 3 && name.length < 15);
}

export function generateNames(keywords: string[], industry: string): string[] {
  const allNames = new Set<string>();
  
  keywords.forEach(keyword => {
    const names = generateIndustryName(keyword, industry);
    names.forEach(name => allNames.add(name));

    // Generate combinations of keywords
    keywords.forEach(secondKeyword => {
      if (keyword !== secondKeyword) {
        allNames.add(`${keyword}${secondKeyword.charAt(0).toUpperCase() + secondKeyword.slice(1)}`);
      }
    });
  });

  // Sort by relevance and length
  return Array.from(allNames)
    .sort((a, b) => {
      // Prefer names between 5-12 characters
      const aScore = Math.abs(8 - a.length);
      const bScore = Math.abs(8 - b.length);
      return aScore - bScore;
    })
    .slice(0, 15); // Return top 15 names
} 