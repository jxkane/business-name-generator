type ColorScheme = {
  primary: string;
  secondary: string;
  accent: string;
};

const industryColors: Record<string, ColorScheme> = {
  technology: {
    primary: '#0066FF',
    secondary: '#00C2FF',
    accent: '#FF3366'
  },
  finance: {
    primary: '#00875A',
    secondary: '#66B2A0',
    accent: '#004D40'
  },
  health: {
    primary: '#4CAF50',
    secondary: '#81C784',
    accent: '#388E3C'
  },
  education: {
    primary: '#5C6BC0',
    secondary: '#7986CB',
    accent: '#3949AB'
  },
  retail: {
    primary: '#FF6B6B',
    secondary: '#FF8E8E',
    accent: '#FF4949'
  },
  food: {
    primary: '#FF9800',
    secondary: '#FFB74D',
    accent: '#F57C00'
  },
  creative: {
    primary: '#9C27B0',
    secondary: '#BA68C8',
    accent: '#7B1FA2'
  }
};

function generateAbstractLogo(name: string, industry: string): string {
  const colors = industryColors[industry] || industryColors.technology;
  const initials = name
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Generate a unique pattern based on the name
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Create SVG patterns based on the hash
  const patterns = [
    createCirclePattern(hash, colors),
    createTrianglePattern(hash),
    createSquarePattern(hash)
  ];

  const selectedPattern = patterns[Math.abs(hash) % patterns.length];

  return `
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="200" height="200" fill="white"/>
      
      <!-- Abstract Pattern -->
      ${selectedPattern}
      
      <!-- Text -->
      <text
        x="100"
        y="115"
        font-family="Arial, sans-serif"
        font-size="40"
        font-weight="bold"
        text-anchor="middle"
        fill="${colors.accent}"
      >${initials}</text>
    </svg>
  `;
}

function createCirclePattern(hash: number, _colors: ColorScheme): string {
  const circles = [];
  for (let i = 0; i < 5; i++) {
    const cx = 40 + (hash % 120);
    const cy = 40 + ((hash * i) % 120);
    const r = 20 + (hash % 40);
    circles.push(`
      <circle
        cx="${cx}"
        cy="${cy}"
        r="${r}"
        fill="url(#grad)"
        opacity="${0.1 + (i * 0.2)}"
      />
    `);
  }
  return circles.join('');
}

function createTrianglePattern(hash: number): string {
  const points = [
    `${50 + (hash % 50)},${50 + (hash % 30)}`,
    `${150 - (hash % 50)},${50 + (hash % 30)}`,
    `${100 + (hash % 20)},${150 - (hash % 30)}`
  ].join(' ');
  
  return `
    <polygon
      points="${points}"
      fill="url(#grad)"
      opacity="0.8"
    />
  `;
}

function createSquarePattern(hash: number): string {
  const squares = [];
  for (let i = 0; i < 3; i++) {
    const x = 40 + ((hash * i) % 80);
    const y = 40 + ((hash * i) % 80);
    const size = 40 + (hash % 40);
    const rotation = hash % 90;
    squares.push(`
      <rect
        x="${x}"
        y="${y}"
        width="${size}"
        height="${size}"
        transform="rotate(${rotation} ${x + size/2} ${y + size/2})"
        fill="url(#grad)"
        opacity="${0.3 + (i * 0.2)}"
      />
    `);
  }
  return squares.join('');
}

export function generateLogo(name: string, industry: string): string {
  return generateAbstractLogo(name, industry);
} 