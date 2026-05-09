import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
    test: {
        poolOptions: {
            workers: {
                wrangler: { configPath: './wrangler.toml' },
            },
        },
        exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    },
});
