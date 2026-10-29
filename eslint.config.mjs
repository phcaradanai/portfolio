import next from "eslint-config-next";

const config = [
  ...next,
  { ignores: [".next/**", "out/**", "content/assets-src/**", "node_modules/**", "docs/**", ".impeccable/**", ".clones/**", ".tmp/**"] },
];

export default config;
