import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        arcade: {
          yellow: '#FFDE59',
          orange: '#FF914D',
          dark: '#1E1E2F',
          green: '#7ED957',
          red: '#FF5757',
        },
      },
    },
  },
  plugins: [],
};
export default config;
