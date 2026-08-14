import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    server: {
      deps: {
        // SDK packages ship bundled runtime values; let vite transpile them.
        inline: [/@deepseek-ai\//],
      },
    },
  },
})
