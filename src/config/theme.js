// School Theme Configuration
// Update these 2 colors to match any school's branding

export const THEME = {
  // Primary color (used for headers, buttons, sidebar, headings)
  primary: '#7b1113',       // Maroon - Chatrah
  primaryHover: '#5c0d0f',  // Darker maroon for hover states

  // Accent color (used for badges, highlights, gold elements)
  accent: '#d4a017',        // Gold
  accentHover: '#b8891a',   // Darker gold for hover

  // To change school colors, just update the 2 values above.
  // Examples:
  //   Blue school:   primary: '#1e40af', accent: '#f59e0b'
  //   Green school:  primary: '#166534', accent: '#ca8a04'
  //   Navy school:   primary: '#1e3a5f', accent: '#c9a227'
  //   Purple school: primary: '#581c87', accent: '#d97706'
};

// Tailwind class helpers (use these in components)
export const tw = {
  // Backgrounds
  bgPrimary: 'bg-[#7b1113]',
  bgPrimaryHover: 'hover:bg-[#5c0d0f]',
  bgAccent: 'bg-[#d4a017]',
  bgPrimaryLight: 'bg-[#7b1113]/10',
  bgPrimaryLighter: 'bg-[#7b1113]/5',

  // Text
  textPrimary: 'text-[#7b1113]',
  textAccent: 'text-[#d4a017]',

  // Borders
  borderPrimary: 'border-[#7b1113]/10',

  // Gradients
  gradientPrimary: 'bg-gradient-to-r from-[#7b1113] to-[#5c0d0f]',

  // Buttons
  btnPrimary: 'bg-[#7b1113] text-white hover:bg-[#5c0d0f]',
  btnAccent: 'bg-[#d4a017] text-white hover:bg-[#b8891a]',
};
