## Nexus Prisma Plugin Contributors Guide

Hey 👋

Thanks for making or considering to make a contribution to the Nexus Prisma plugin. This document assumes you are already familiar with Nexus, Prisma, and this plugin that bridges the two. If any of these three things are not familiar to you then before contributing you might want to brush up on what this plugin does. Start [here](http://nxs.li/plugins/prisma).

There are many ways you can help:

- Get active in [community discussions](https://nxs.li/discussions) and help other users
- [Create bug reports](https://nxs.li/issues/create/bug) when you find an issue
- [Create feature requests](https://nxs.li/issues/create/feature) when you hit a use-case that isn't served well or at all
- Improve the documentation

If you want to contribute code, that's awesome! Here's how to do that.

#### Project Layout

The Nexus Prisma plugin is actually two. One at the schema level (`src/schema`) and one at the framework level (`src/framework`). The framework level builds on top of the schema level.

#### Tests

- See the package json scripts. There are different suites you can run. They all begin with the prefix `test:`.
- To run the e2e tests locally, do:
  - Set `NEXUS_VERSION` as you wish
  - Set `NEXUS_PLUGIN_PRISMA_VERSION` as you wish
  - Have docker running on your machine
  - `docker-compose up -d`
  - `yarn test:fw:e2e:<name>`

#### Small PRs

If you see a small problem with a simple fix just open a PR for it. Chances are we'll merge it promptly. We're not going to hassel you over details. We try to keep the bar as low as possible on these kinds of things.

#### Big PRs

If you have an idea then _please_ do not do a bunch of work up front expecting it will get merged. Draft PRs that help you explore your idea are great, but it should be in support of, not replacing, a feature request issue. We do not have a formal RFC process in place right now, but we do have a basic feature request issue template.
