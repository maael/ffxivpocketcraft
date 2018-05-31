# FFXIV Pocketcraft

## Install

```
yarn
```

## Setup

### Development

```
npm run dev
```

### Produnction

```
npm run build && npm start
```

## Available commands

- `dev` - `NODE_ENV=development node server`,
- `start` - `NODE_ENV=production node server`,
- `build` - `NODE_ENV=production next build`,
- `extract-items` - `node scripts/extract-items-from-local-recipes`,
- `import-recipes` - `node scripts/import-recipes-from-xivdb`,
- `db-dump` - `mongodump --db pocketcraft`,
- `db-restore` - `mongorestore --drop -d pocketcraft`
