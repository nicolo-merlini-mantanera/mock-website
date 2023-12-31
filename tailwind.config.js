import formsPlugin from '@tailwindcss/forms';
import typographyPlugin from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'nero': '#090302',
        'beige': '#c1bf84',
        'rosso': '#a2332e'
      },
    },
  },
  plugins: [formsPlugin, typographyPlugin],
};


// import type { Config } from "tailwindcss";

// export default {
//   content: ["./app/**/*.{js,jsx,ts,tsx}",
//     "./components/**/*.{js,jsx,ts,tsx}"
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [formsPlugin, typographyPlugin],
// } satisfies Config;

