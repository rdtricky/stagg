# Stagg Monorepo

Built with TypeScript, Node, Express, MongoDB, React, and Next; package management provided by Lerna

## Contributing

You will need a `.env` file in the root of each service you intend to run for local development. See the `README` of the `services` to learn more.

### To do

PRs are always welcome!

#### Republish

- Set all packages to empty with no deps
- Unpublish all packages
- Create new repo
- Republish

#### Web UI

- Large expandable charts dont fit mobile screen
- Add tooltips to each chart to explain the correlations
- Customizable dashboard with custom-built charts
- Correlation creation tool

#### Misc

- Sign ups seem to double create
- Create roles for Discord servers (eg: "@2+ KD")
- Alert when someone beats their previous best or gets a BR win
- Store generated JWTs in db and provide back an ID for the confirmation email link
- Add field to denote if registered player, enemy player, or control player (known good players)

#### Call of Duty API

- WZ/MP Profiles
- Match summaries
- Multiplayer API/types
- Testing and error reporting
- Some teamPlacement props are 0
- Backfill rankedTeams with TRN whenever possible (maybe useless without uno ids?)

### Publishing to NPM

To publish new packages, you will need access to [Stagg NPM](https://www.npmjs.com/settings/stagg/packages). After gaining permissions to publish to this organization, use the following command to authenticate your local client.

```
npm login --registry=https://registry.npmjs.org/ --scope=stagg
```
