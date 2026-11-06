# Filosofia

Landing page em Next.js com quatro capítulos sobre a filosofia da Grécia Antiga. As sequências de rolagem e o vídeo do hero usam os arquivos de mídia em `public/`.

## Desenvolvimento

Use Node.js 24 e execute os comandos na raiz do repositório.

```sh
npm ci
npm run dev
```

Abra [localhost:3000](http://localhost:3000). No PowerShell, use `npm.cmd` se a política local bloquear `npm.ps1`.

## Verificação e publicação

```sh
npm test
NEXT_PUBLIC_BASE_PATH=/Filosofia npm run build
npm run typecheck
node scripts/check-export.mjs /Filosofia
```

No PowerShell, defina `$env:NEXT_PUBLIC_BASE_PATH = '/Filosofia'` antes do build. O build baixa fontes do Google Fonts e as inclui na exportação.

O workflow em `.github/workflows/deploy.yml` roda em pushes para `main` e pode ser executado manualmente a partir desse branch. Em **Settings → Pages**, selecione **GitHub Actions** como fonte. O workflow publica apenas `out/`.
