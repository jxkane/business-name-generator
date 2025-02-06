'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Star, Sun, Moon, Twitter, Instagram, Facebook, Github, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { checkDomainAvailability } from '@/lib/domains';
import { checkTrademarkCompatibility } from '@/lib/trademark';
import { checkSocialAvailability } from '@/lib/social';
import { generateNames as generateIndustryNames } from '@/lib/nameGenerator';
import { generateLogo } from '@/lib/logoGenerator';

// Add these new types
type Industry = {
  name: string;
  prefixes: string[];
  suffixes: string[];
  modifiers: string[];
}

const industries: Record<string, Industry> = {
  technology: {
    name: 'Technology',
    prefixes: ['Tech', 'Digital', 'Cyber', 'Data', 'AI', 'Smart', 'Cloud', 'Net', 'Web', 'App'],
    suffixes: ['Labs', 'Tech', 'Systems', 'Solutions', 'Ware', 'Soft', 'Core', 'Matrix', 'Byte', 'Logic'],
    modifiers: ['Pro', 'Plus', 'Advanced', 'Next', 'Future', 'Modern', 'Innovative', 'Dynamic', 'Global', 'Connected']
  },
  finance: {
    name: 'Finance',
    prefixes: ['Fin', 'Capital', 'Wealth', 'Money', 'Asset', 'Trade', 'Trust', 'Credit', 'Cash', 'Bank'],
    suffixes: ['Invest', 'Finance', 'Capital', 'Partners', 'Group', 'Advisors', 'Markets', 'Holdings', 'Exchange', 'Fund'],
    modifiers: ['Global', 'Prime', 'Elite', 'Premier', 'First', 'Smart', 'Strategic', 'Secure', 'Direct', 'United']
  },
  health: {
    name: 'Healthcare',
    prefixes: ['Health', 'Med', 'Care', 'Vital', 'Life', 'Well', 'Bio', 'Cure', 'Heal', 'Pulse'],
    suffixes: ['Care', 'Health', 'Medical', 'Wellness', 'Life', 'Living', 'Clinic', 'Services', 'Path', 'Bridge'],
    modifiers: ['Total', 'Complete', 'Active', 'Better', 'Natural', 'Optimal', 'Pure', 'Essential', 'Balanced', 'Core']
  },
  education: {
    name: 'Education',
    prefixes: ['Edu', 'Learn', 'Mind', 'Brain', 'Skill', 'Know', 'Study', 'Teach', 'Academic', 'Scholar'],
    suffixes: ['Academy', 'School', 'Institute', 'Learning', 'Education', 'Studies', 'Skills', 'Center', 'Hub', 'Lab'],
    modifiers: ['Smart', 'Bright', 'Elite', 'Advanced', 'Premier', 'Global', 'Future', 'Leading', 'Prime', 'Core']
  },
  retail: {
    name: 'Retail',
    prefixes: ['Shop', 'Store', 'Mart', 'Market', 'Buy', 'Retail', 'Trade', 'Goods', 'Deal', 'Sale'],
    suffixes: ['Store', 'Market', 'Shop', 'Mart', 'Place', 'Zone', 'Hub', 'Center', 'World', 'Space'],
    modifiers: ['Prime', 'Super', 'Mega', 'Ultra', 'Best', 'Top', 'Direct', 'Smart', 'Value', 'Choice']
  },
  food: {
    name: 'Food & Restaurant',
    prefixes: ['Food', 'Taste', 'Flavor', 'Dish', 'Cook', 'Chef', 'Eat', 'Meal', 'Kitchen', 'Dining'],
    suffixes: ['Kitchen', 'Bistro', 'Cafe', 'Grill', 'Diner', 'Eats', 'Table', 'Plate', 'Bites', 'House'],
    modifiers: ['Fresh', 'Tasty', 'Gourmet', 'Delicious', 'Premium', 'Classic', 'Modern', 'Urban', 'Artisan', 'Select']
  },
  creative: {
    name: 'Creative & Design',
    prefixes: ['Art', 'Design', 'Create', 'Visual', 'Studio', 'Pixel', 'Color', 'Style', 'Brand', 'Media'],
    suffixes: ['Studio', 'Design', 'Arts', 'Media', 'Works', 'Creative', 'Lab', 'House', 'Space', 'Shop'],
    modifiers: ['Creative', 'Modern', 'Bold', 'Fresh', 'Prime', 'Pure', 'Elite', 'Smart', 'Next', 'Core']
  }
};

type GeneratedName = {
  name: string;
  logo: string;
  domains: {
    domain: string;
    available: boolean;
    registrars: {
      name: string;
      url: string;
      priceRange: string;
    }[];
  }[];
  trademark: {
    riskLevel: 'low' | 'medium' | 'high';
    advice: string;
  };
  social: {
    platform: string;
    handle: string;
    available: boolean;
    url: string;
  }[];
};

export default function Home() {
  const [keywords, setKeywords] = React.useState('');
  const [industry, setIndustry] = React.useState('');
  const [generatedNames, setGeneratedNames] = React.useState<GeneratedName[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const { toast } = useToast();

  // Load favorites from localStorage on mount
  React.useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const toggleFavorite = (name: string) => {
    const newFavorites = favorites.includes(name)
      ? favorites.filter(n => n !== name)
      : [...favorites, name];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    
    toast({
      title: favorites.includes(name) ? "Removed from favorites" : "Added to favorites",
      description: name,
    });
  };

  const copyToClipboard = async (name: string) => {
    await navigator.clipboard.writeText(name);
    toast({
      title: "Copied to clipboard",
      description: name,
    });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const generateNames = async () => {
    try {
      setIsLoading(true);
      const keywordArr = keywords.toLowerCase().split(' ').filter(k => k.length > 0);
      
      if (keywordArr.length === 0) {
        toast({
          title: "Please enter keywords",
          description: "Enter at least one keyword to generate names",
          variant: "destructive",
        });
        return;
      }

      // Start with basic combinations
      const names = new Set<string>();
      
      // Add simple capitalized keywords first
      keywordArr.forEach(keyword => {
        const capitalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        names.add(capitalizedKeyword);
      });

      // Add basic combinations
      const prefixes = ['Pro', 'Smart', 'Peak', 'Prime', 'Elite', 'Next', 'Future', 'Nova', 'Apex', 'Core'];
      const suffixes = ['Hub', 'Zone', 'Space', 'Works', 'Solutions', 'Labs', 'Tech', 'Logic', 'Mind', 'Sync'];

      keywordArr.forEach(keyword => {
        const capitalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        
        prefixes.forEach(prefix => {
          names.add(`${prefix}${capitalizedKeyword}`);
        });
        
        suffixes.forEach(suffix => {
          names.add(`${capitalizedKeyword}${suffix}`);
        });
      });

      // Add industry-specific names if an industry is selected
      if (industry && industries[industry]) {
        const industryData = industries[industry];
        keywordArr.forEach(keyword => {
          const capitalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          
          industryData.prefixes.forEach(prefix => {
            names.add(`${prefix}${capitalizedKeyword}`);
          });
          
          industryData.suffixes.forEach(suffix => {
            names.add(`${capitalizedKeyword}${suffix}`);
          });
          
          industryData.modifiers.forEach(modifier => {
            names.add(`${modifier}${capitalizedKeyword}`);
          });
        });
      }

      // Convert to array and get random selection
      const randomNames = Array.from(names)
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);

      // Process each name
      const processedNames = await Promise.all(
        randomNames.map(async (name) => {
          const domains = await checkDomainAvailability(name, ['.com', '.io', '.co', '.app']);
          const trademark = await checkTrademarkCompatibility(name);
          const social = await checkSocialAvailability(name);
          const logo = generateLogo(name, industry || 'technology');

          return {
            name,
            logo,
            domains,
            trademark: {
              riskLevel: trademark.riskLevel,
              advice: trademark.advice
            },
            social
          };
        })
      );

      console.log('About to set generated names:', processedNames);
      setGeneratedNames(processedNames);
      
      // Show success toast
      toast({
        title: "Names generated successfully",
        description: `Generated ${processedNames.length} names`,
      });

    } catch (error) {
      console.error('Error generating names:', error);
      toast({
        title: "Error generating names",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  console.log('Current state:', {
    keywords,
    industry,
    generatedNames,
    isLoading,
    favorites
  });

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDarkMode ? "dark bg-gray-900" : "bg-white"
    )}>
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Business Name Generator</h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              A one-stop-shop for <span className="text-primary font-medium">names, domains, and social media handles</span>. 
              Even create and download a <span className="text-primary font-medium">logo</span> for your business!
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Business Name Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Keywords (separated by spaces)
                  </label>
                  <Input
                    value={keywords}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeywords(e.target.value)}
                    placeholder="e.g., tech software digital"
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    disabled={isLoading}
                  >
                    <option value="">Select an industry</option>
                    {Object.entries(industries).map(([key, data]) => (
                      <option key={key} value={key}>
                        {data.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <Button 
                onClick={generateNames}
                className="w-full"
                disabled={keywords.trim().length === 0 || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Names'
                )}
              </Button>

              {generatedNames.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-bold mb-4">Generated Names:</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedNames.map((nameData, index) => (
                      <Card 
                        key={index} 
                        className={cn(
                          "hover:shadow-lg transition-all duration-300",
                          "transform hover:-translate-y-1"
                        )}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-4">
                              <div 
                                className="w-12 h-12 rounded-lg overflow-hidden shadow-sm"
                                dangerouslySetInnerHTML={{ __html: nameData.logo }}
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{nameData.name}</span>
                                {nameData.trademark.riskLevel !== 'low' && (
                                  <div className={cn(
                                    "px-2 py-1 rounded-full text-xs",
                                    nameData.trademark.riskLevel === 'high' 
                                      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
                                  )}>
                                    Trademark Risk
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(nameData.name)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleFavorite(nameData.name)}
                              >
                                <Star 
                                  className={cn(
                                    "h-4 w-4",
                                    favorites.includes(nameData.name) ? "fill-yellow-400 text-yellow-400" : ""
                                  )}
                                />
                              </Button>
                            </div>
                          </div>

                          {nameData.trademark.riskLevel !== 'low' && (
                            <div className={cn(
                              "mb-4 p-3 rounded-md text-sm",
                              nameData.trademark.riskLevel === 'high'
                                ? "bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-200"
                                : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/10 dark:text-yellow-200"
                            )}>
                              {nameData.trademark.advice}
                            </div>
                          )}

                          <div className="mb-4">
                            <h3 className="text-sm font-medium mb-2">Social Media Availability:</h3>
                            <div className="flex flex-wrap gap-2">
                              {nameData.social.map((social, idx) => (
                                <a
                                  key={idx}
                                  href={social.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    "text-sm px-3 py-1 rounded-full transition-colors flex items-center gap-2",
                                    social.available
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-100"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-100"
                                  )}
                                >
                                  {social.platform === 'twitter' && <Twitter className="h-4 w-4" />}
                                  {social.platform === 'instagram' && <Instagram className="h-4 w-4" />}
                                  {social.platform === 'facebook' && <Facebook className="h-4 w-4" />}
                                  {social.platform === 'github' && <Github className="h-4 w-4" />}
                                  <span>{social.handle}</span>
                                  <span className="text-xs opacity-75">
                                    {social.available ? '✓' : '✗'}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {nameData.domains.map((domain, i) => (
                              <div 
                                key={i}
                                className={cn(
                                  "p-3 rounded border",
                                  domain.available 
                                    ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                                    : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                                )}
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">{domain.domain}</span>
                                  <span className={cn(
                                    "text-sm px-2 py-1 rounded-full",
                                    domain.available 
                                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                  )}>
                                    {domain.available ? 'Available' : 'Taken'}
                                  </span>
                                </div>
                                {domain.available && (
                                  <div className="space-y-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">Register with:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {domain.registrars.map((registrar, idx) => (
                                        <a
                                          key={idx}
                                          href={registrar.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={cn(
                                            "text-sm px-3 py-1 rounded-full transition-colors",
                                            "bg-primary text-primary-foreground hover:bg-primary/90",
                                            "flex items-center gap-2"
                                          )}
                                        >
                                          {registrar.name}
                                          <span className="text-xs opacity-75">
                                            {registrar.priceRange}
                                          </span>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="mb-4"
                            onClick={() => {
                              const blob = new Blob([nameData.logo], { type: 'image/svg+xml' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${nameData.name}-logo.svg`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Logo
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {favorites.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-bold mb-4">Favorites:</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.map((name, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 flex justify-between items-center">
                          <span className="text-lg">{name}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(name)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleFavorite(name)}
                            >
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
