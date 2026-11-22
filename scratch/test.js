const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');

const css = `
@import "tailwindcss";
.test1 { @apply scale-108; }
`;

postcss([tailwind]).process(css, { from: 't.css' })
  .then(r => console.log('scale-108 works:', r.css))
  .catch(e => console.log('scale-108 error:', e.message));
