# Stagg Monorepo

Built with TypeScript, Node, React, MongoDB, Express, and Socket.io; package management provided by Lerna

## Contributing

You will need a `.env` file in the root of each service you intend to run for local development. See the `README` of the `services` to learn more.

### To do

PRs are always welcome!

#### Republish

- Get rid of @stagg/util
- Discord bot service fixes/updates
    - If already logged in exit process
    - Make all interactions via UI API
    - Log all interactions (input/user/output?)
- Set all packages to empty with no deps
- Unpublish all packages
- Create new repo
- Republish

#### Web UI

- Breakage when no Discord linked
- Large expandable charts dont fit mobile screen
- Add tooltips to each chart to explain the correlations
- Customizable dashboard with custom-built charts
- Correlation creation tool

#### Call of Duty API

- WZ game modes
- WZ/MP Profiles
- Match summaries
- Multiplayer API/types
- Testing and error reporting
- Login/Platforms/Friends types
- Some teamPlacement props are 0
- Backfill rankedTeams with TRN whenever possible (maybe useless without uno ids?)

### Publishing to NPM

To publish new packages, you will need access to [Stagg NPM](https://www.npmjs.com/settings/stagg/packages). After gaining permissions to publish to this organization, use the following command to authenticate your local client.

```
npm login --registry=https://registry.npmjs.org/ --scope=stagg
```
