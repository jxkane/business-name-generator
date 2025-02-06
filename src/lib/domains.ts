type DomainSuffix = '.com' | '.io' | '.co' | '.app' | '.dev' | '.ai';

type DomainRegistrar = {
  name: string;
  baseUrl: string;
  affiliateId: string;
  priceRange: string;
};

const registrars: DomainRegistrar[] = [
  {
    name: 'GoDaddy',
    baseUrl: 'https://www.godaddy.com/domains/domain-name-search?domainToCheck=',
    affiliateId: process.env.NEXT_PUBLIC_GODADDY_AFFILIATE_ID || '',
    priceRange: '$11.99/yr'
  },
  {
    name: 'Namecheap',
    baseUrl: 'https://www.namecheap.com/domains/registration/results/?domain=',
    affiliateId: process.env.NEXT_PUBLIC_NAMECHEAP_AFFILIATE_ID || '',
    priceRange: '$8.88/yr'
  }
];

export async function checkDomainAvailability(name: string, suffixes: DomainSuffix[] = ['.com']): Promise<any[]> {
  try {
    // Remove spaces and special characters
    const cleanName = name.toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '')
      .trim();

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Simulate domain availability check
    return suffixes.map(suffix => {
      const domain = `${cleanName}${suffix}`;
      // Random availability (70% chance of being available)
      const available = Math.random() > 0.3;

      // Generate affiliate links for each registrar
      const registrarLinks = registrars.map(registrar => ({
        name: registrar.name,
        url: `${registrar.baseUrl}${domain}${registrar.affiliateId ? `&aid=${registrar.affiliateId}` : ''}`,
        priceRange: registrar.priceRange
      }));

      return {
        domain,
        available,
        registrars: registrarLinks
      };
    });
  } catch (error) {
    console.error('Error checking domain availability:', error);
    return [];
  }
} 