# Stagg Monorepo

Built with TypeScript, Node, React, MongoDB, Express, and Socket.io; package management provided by Lerna

## Contributing

You will need a `.env` file in the root of each service you intend to run for local development. See the `README` of the `services` to learn more.

### To do

PRs are always welcome!

#### Cleanup

- Get rid of @stagg/util
- Set all packages to empty with no deps
- Unpublish all packages
- Create new repo
- Republish

#### Call of Duty API

- WZ/MP Profiles
- Match summaries
- Multiplayer API/types
- Testing and error reporting
- Login/Platforms/Friends types
- Some teamPlacement props are 0
- Backfill rankedTeams with TRN whenever possible

### Publishing

To publish new packages, you will need access to [Stagg NPM](https://www.npmjs.com/settings/stagg/packages). After gaining permissions to publish to this organization, use the following command to authenticate your local client.

```
npm login --registry=https://registry.npmjs.org/ --scope=stagg
```
