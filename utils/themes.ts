export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    light: string;
    dark: string;
    secondaryText: string;
  };
  swatch: {
    primary: string;
    secondary: string;
  };
}

export const themes: { [key: string]: Theme } = {
  'uc-merced': {
    name: 'UC Merced',
    colors: {
      primary: '0 40 85',        // UCM Blue
      secondary: '255 181 0',     // UCM Gold
      light: '230 242 255',      // Lighter Blue
      dark: '0 20 45',         // Darker Blue
      secondaryText: '0 40 85', // UCM Blue text for on-gold
    },
    swatch: { primary: '#002855', secondary: '#FFB500' },
  },
  'crimson': {
    name: 'Crimson',
    colors: {
      primary: '153 27 27',      // Dark Red
      secondary: '220 38 38',     // Red
      light: '254 226 226',      // Light Red
      dark: '127 29 29',       // Darker Red
      secondaryText: '255 255 255', // White text
    },
    swatch: { primary: '#991b1b', secondary: '#dc2626' },
  },
  'sunset': {
    name: 'Sunset',
    colors: {
      primary: '194 65 12',       // Dark Orange
      secondary: '249 115 22',    // Orange
      light: '255 237 213',     // Light Orange
      dark: '154 52 18',      // Darker Orange
      secondaryText: '255 255 255', // White text
    },
    swatch: { primary: '#c2410c', secondary: '#f97316' },
  },
  'forest': {
    name: 'Forest',
    colors: {
      primary: '20 83 45',        // Dark Green
      secondary: '22 163 74',     // Green
      light: '220 252 231',      // Light Green
      dark: '21 128 61',       // Darker Green
      secondaryText: '255 255 255', // White text
    },
    swatch: { primary: '#14532d', secondary: '#16a34a' },
  },
  'royalty': {
    name: 'Royalty',
    colors: {
      primary: '76 29 149',      // Dark Purple
      secondary: '126 34 206',    // Purple
      light: '243 232 255',      // Light Purple
      dark: '91 33 182',       // Darker Purple
      secondaryText: '255 255 255', // White text
    },
    swatch: { primary: '#4c1d95', secondary: '#7e22ce' },
  },
};
