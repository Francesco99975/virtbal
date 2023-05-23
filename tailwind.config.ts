import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#EAF9D9",
        accent: "#5EDFA7",
        darkAccent: "#084028",
        // accent: "#955e42",
        // darkAccent: "#5A3522",
        bcd: "#232020",
        bl: "#F8F8E9",
        error: "#D8223D"
      },
      // backgroundImage: {
      //   cake: "url('/public/cake.webp')",
      // },
      keyframes: {
        slide: {
          from: {
            opacity: "0",
            transform: "translateY(-3rem)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },

        slide2: {
          from: {
            opacity: "0",
            transform: "translateY(3rem)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        slide: "slide 300ms ease-out forwards",
        slide2: "slide2 300ms ease-in forwards",
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide'), require('@headlessui/tailwindcss')({ prefix: 'ui' })],
} satisfies Config

