type TrademarkResult = {
  isRegistered: boolean;
  similarMarks: string[];
  riskLevel: 'low' | 'medium' | 'high';
  advice: string;
};

export async function checkTrademarkCompatibility(name: string): Promise<TrademarkResult> {
  try {
    // Remove spaces and special characters
    const cleanName = name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    
    // Simulate API call to USPTO
    // In production, you would integrate with a real trademark API
    await new Promise(resolve => setTimeout(resolve, 300));

    // Simple trademark checking logic
    const commonTrademarks = new Map([
      ['apple', 'technology'],
      ['nike', 'clothing'],
      ['amazon', 'retail'],
      ['google', 'technology'],
      ['microsoft', 'technology'],
      // Add more common trademarks
    ]);

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    const similarMarks: string[] = [];
    let advice = 'This name appears to be safe to use.';

    for (const [trademark, industry] of commonTrademarks) {
      if (cleanName.includes(trademark)) {
        riskLevel = 'high';
        similarMarks.push(trademark);
        advice = `This name contains "${trademark}" which is a registered trademark in the ${industry} industry.`;
        break;
      }
      
      // Check for similar names using Levenshtein distance
      if (calculateSimilarity(cleanName, trademark) > 0.8) {
        riskLevel = 'medium';
        similarMarks.push(trademark);
        advice = `This name is similar to existing trademark "${trademark}". Consider modifications.`;
      }
    }

    return {
      isRegistered: riskLevel === 'high',
      similarMarks,
      riskLevel,
      advice
    };
  } catch (error) {
    console.error('Error checking trademark:', error);
    return {
      isRegistered: false,
      similarMarks: [],
      riskLevel: 'low',
      advice: 'Unable to check trademark compatibility. Please consult a legal professional.'
    };
  }
}

// Simple string similarity function (Levenshtein distance)
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const costs: number[] = [];
  for (let i = 0; i <= longer.length; i++) {
    costs[i] = i;
  }
  
  for (let i = 1; i <= shorter.length; i++) {
    costs[i - 1] = i;
    let nw = i - 1;
    for (let j = 1; j <= longer.length; j++) {
      const cj = Math.min(
        1 + Math.min(costs[j], costs[j - 1]),
        shorter[i - 1] === longer[j - 1] ? nw : nw + 1
      );
      nw = costs[j];
      costs[j] = cj;
    }
  }
  
  return (longer.length - costs[longer.length]) / longer.length;
} 