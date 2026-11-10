# condoguard-app

App do morador — Expo + Expo Router + TypeScript.

## Rodando
```
npm ci
EXPO_PUBLIC_API_URL=http://<host>:8080 npm start   # padrão: http://10.0.2.2:8080 (emulador Android)
```
Na PoC, use o endereço do túnel em `EXPO_PUBLIC_API_URL` (e em `eas.json` > `build.internal.env`).

## Qualidade
`npm run lint`, `npm run typecheck`, `npm test`, `npm audit`. O CI roda todos.

## API
Tipos gerados de `contract/openapi.json` (`npm run gen:api`). `/auth/refresh`, `/auth/logout` e `/users/me` seguem o desenho da 1a; trocar pelo snapshot real do `/openapi.json` quando ela entregar.

## Segurança
Access e refresh token ficam só no `expo-secure-store` (`src/auth/tokenStore.ts`); sem AsyncStorage. Refresh rotativo com single-flight; refresh revogado => logout.

## Build interno (APK)
`npx eas build -p android --profile internal` (requer conta Expo e `eas init`).
