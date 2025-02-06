type SocialPlatform = 'twitter' | 'instagram' | 'facebook' | 'github';

type SocialResult = {
  platform: SocialPlatform;
  handle: string;
  available: boolean;
  url: string;
};

export async function checkSocialAvailability(name: string): Promise<SocialResult[]> {
  try {
    // Remove spaces and special characters
    const handle = name.toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '')
      .trim();

    // In production, you would integrate with actual social media APIs
    // This is a simulation for demonstration
    await new Promise(resolve => setTimeout(resolve, 300));

    const platforms: SocialPlatform[] = ['twitter', 'instagram', 'facebook', 'github'];
    
    // Simulate some random availability
    return platforms.map(platform => {
      const random = Math.random();
      const available = random > 0.5;
      
      const urls = {
        twitter: `https://twitter.com/${handle}`,
        instagram: `https://instagram.com/${handle}`,
        facebook: `https://facebook.com/${handle}`,
        github: `https://github.com/${handle}`,
      };

      return {
        platform,
        handle: `@${handle}`,
        available,
        url: urls[platform]
      };
    });
  } catch (error) {
    console.error('Error checking social media:', error);
    return [];
  }
} 