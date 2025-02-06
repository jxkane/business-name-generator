type SocialPlatform = 'twitter' | 'instagram' | 'facebook' | 'github';

type SocialResult = {
  platform: SocialPlatform;
  handle: string;
  available: boolean;
  url: string;
};

// Rate limiting configuration
const RATE_LIMITS = {
  REQUESTS_PER_HOUR: 100,
  COOLDOWN_MS: 36000, // 36 seconds between requests
  WINDOW_MS: 3600000, // 1 hour in milliseconds
};

// Rate limiting state
const rateLimiter = {
  instagram: {
    requests: new Map<string, number[]>(), // Timestamps of requests
    lastCheck: new Map<string, number>(), // Last check time per handle
  }
};

// Check if we can make a request
function canMakeInstagramRequest(handle: string): boolean {
  const now = Date.now();
  const timestamps = rateLimiter.instagram.requests.get(handle) || [];
  const lastCheck = rateLimiter.instagram.lastCheck.get(handle) || 0;

  // Enforce cooldown period between requests
  if (now - lastCheck < RATE_LIMITS.COOLDOWN_MS) {
    console.log(`Rate limit: Too soon to check Instagram handle ${handle}`);
    return false;
  }

  // Remove timestamps older than the window
  const recentTimestamps = timestamps.filter(
    time => now - time < RATE_LIMITS.WINDOW_MS
  );

  // Check if we're within the hourly limit
  if (recentTimestamps.length >= RATE_LIMITS.REQUESTS_PER_HOUR) {
    console.log(`Rate limit: Too many requests for Instagram handle ${handle}`);
    return false;
  }

  return true;
}

// Record a request
function recordInstagramRequest(handle: string): void {
  const now = Date.now();
  const timestamps = rateLimiter.instagram.requests.get(handle) || [];
  
  // Update timestamps
  timestamps.push(now);
  rateLimiter.instagram.requests.set(handle, timestamps);
  rateLimiter.instagram.lastCheck.set(handle, now);
}

async function checkInstagram(handle: string) {
  try {
    // Check rate limits first
    if (!canMakeInstagramRequest(handle)) {
      return false; // Return unavailable if rate limited
    }

    // Record this request
    recordInstagramRequest(handle);

    const response = await fetch(`https://www.instagram.com/${handle}/`, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    return response.status === 404;
  } catch (error) {
    console.error('Instagram check error:', error);
    return false;
  }
}

export async function checkSocialAvailability(name: string): Promise<SocialResult[]> {
  try {
    const handle = name.toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '')
      .trim();

    const results = await Promise.all([
      // Check GitHub (doesn't require auth)
      checkGithub(handle).then(available => ({
        platform: 'github' as SocialPlatform,
        handle: `@${handle}`,
        available,
        url: `https://github.com/${handle}`
      })),
      // Check Instagram with rate limiting
      checkInstagram(handle).then(available => ({
        platform: 'instagram' as SocialPlatform,
        handle: `@${handle}`,
        available,
        url: `https://instagram.com/${handle}`
      })),
      // Simulate others
      Promise.resolve({
        platform: 'twitter' as SocialPlatform,
        handle: `@${handle}`,
        available: Math.random() > 0.5,
        url: `https://twitter.com/${handle}`
      }),
      Promise.resolve({
        platform: 'facebook' as SocialPlatform,
        handle: `@${handle}`,
        available: Math.random() > 0.5,
        url: `https://facebook.com/${handle}`
      })
    ]);

    return results;
  } catch (error) {
    console.error('Error checking social media:', error);
    return [];
  }
}

async function checkTwitter(handle: string) {
  try {
    const response = await fetch(`https://api.twitter.com/2/users/by/username/${handle}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_TWITTER_API_KEY}`
      }
    });
    // If we get a 404, the handle is available
    return response.status === 404;
  } catch (error) {
    console.error('Twitter API error:', error);
    return false;
  }
}

async function checkGithub(handle: string) {
  try {
    const response = await fetch(`https://api.github.com/users/${handle}`);
    // If we get a 404, the handle is available
    return response.status === 404;
  } catch (error) {
    console.error('GitHub API error:', error);
    return false;
  }
}

async function checkFacebook(handle: string) {
  try {
    const response = await fetch(`https://graph.facebook.com/${handle}`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_FACEBOOK_API_KEY}`
      }
    });
    return response.status === 404;
  } catch (error) {
    console.error('Facebook API error:', error);
    return false;
  }
} 