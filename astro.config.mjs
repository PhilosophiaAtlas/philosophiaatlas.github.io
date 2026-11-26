import { defineConfig } from 'astro/config';
export default defineConfig({site:'https://philosophia.diepnguyenhong834.workers.dev',output:'static',trailingSlash:'always',build:{format:'directory'},vite:{server:{fs:{allow:['.']}}}});
