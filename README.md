# Stagg Monorepo

Built with TypeScript, Node, React, MongoDB, Express, and Socket.io; package management provided by Lerna

## Contributing

You will need a `.env` file in the root of each service you intend to run for local development. See the `README` of the `services` to learn more.

### Publishing

To publish new packages, you will need access to [Stagg NPM](). After gaining permissions to publish to this organization, use the following command to authenticate your local client.

```
npm login --registry=https://registry.npmjs.org/ --scope=stagg
```

### To do

PRs are always welcome!

#### Call of Duty API

- Implement Multiplayer API and types
- Types for Login/Identity/Platforms/Friends
