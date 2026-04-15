# Setup

1. ```pnpm install```
2. ```cp apps/server/.env.example apps/server/.env```
3. ```cp apps/client/.env.example apps/client/.env```
4. ```cp packages/db/.env.example packages/db/.env```
5. Update the env files with your values
6. ```docker compose up -d```
7. ```pnpm dev:server```
8. connect phone
9. ```pnpm --filter @baza/client android --device```
10. wait for build to finish
11. done
  