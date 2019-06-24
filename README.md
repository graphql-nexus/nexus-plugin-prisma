# nexus-prisma

## Getting started

#### 1. Clone the repo

Clone this repository:

```
git clone https://github.com/prisma/nexus-prisma.git
cd example
```

#### 2. Install dependencies

Install Node depencies:

```
npm install
```

> Note that the Photon & Photogen generation are included in an [`install`](./example/package.json#L6) script in your [`package.json`](./example/package.json), which means Photon also gets (re-)generated upon each `npm install`.

#### 3. Migrate the database

With Prisma 2, database migrations are performed using the `lift` subcommand of the Prisma CLI, i.e. `prisma2 lift <command>`.

##### 3.1. Create migration

Run the following command to create a new migration:

```
prisma2 lift create --name 'init'
```

This creates a new directory called `migrations`. This directory stores detailed info about each migration you perform throughout the lifetime of your project.

Every migration is represented via its own directory inside the `migrations` directory. In this case, your first migration is called `TIMESTAMP-init` (e.g. `20190605165416-init`). It contains tree files:

- `datamodel.prisma`: The target datamodel for the migration.
- `steps.json`: A summary of all the required steps to perform the migration.
- `README.md`: A markdown file highlighting important information about the migration (e.g. a diff of the datamodel or the performed SQL statements).

##### 3.2. Execute migration

To actually execute the migration against your database, run:

```
prisma2 lift up
```

This applies the steps specified in `steps.json` and therefore migrates the database schema to match the datamodel.

#### 4. Run the GraphQL Server

Run the following command to run the GraphQL Server:

```
npm start
```
