import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#171717',
        mist: '#F7F5F1',
        clay: '#D8CFC4',
        olive: '#4F5B4A',
        rosewood: '#6E4A45',
      },
    },
  },
  plugins: [],
};

export default config;
