# FFXIV Pocketcraft

## Install

```
yarn
```

## Setup

### Prerequisites
- MongoDB
- Node.js (v9.x.x+, at least that's what I used)

### Config
Copy `.env.schema` to `.env`, and fill it out.

### Data

Data is pulled from [xivdb.com](http://xivdb.com), and you will want to run `yarn import-recipes` followed by `extract-items`.
These commands will populate MongoDB databases, as specified via the `MONGO_URI` and `MONGO_DB` values in `.env`. There will be a database per region, with `'_en', '_de', '_fr', '_ja'` as the suffixes on `MONGO_DB`. In the databse there will be two collections, `recipes` and `items` respectively.

### Development

```
yarn dev
```

### Production

```
yarn build && yarn start
```

Although on production this is managed via [pm2](https://github.com/Unitech/pm2).

## Available commands

- `dev` - `NODE_ENV=development node server`,
- `start` - `NODE_ENV=production node server`,
- `build` - `NODE_ENV=production next build`,
- `extract-items` - `node scripts/extract-items-from-local-recipes`,
- `import-recipes` - `node scripts/import-recipes-from-xivdb`,
- `db-dump` - `mongodump --db pocketcraft`,
- `db-restore` - `mongorestore --drop -d pocketcraft`
- `lint` - `standard`
