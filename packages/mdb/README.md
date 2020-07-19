# Stagg MongoDB Integration

Provided by [Stagg.co](https://stagg.co)

## Getting Started

Install the package

```
yarn install @stagg/mdb
```

Configure the connection on startup (only done once).

```typescript
import * as Mongo from '@stagg/mdb'
(async () => {
    const cfg:Mongo.Config = {...}
    Mongo.config(cfg)
    const db = await Mongo.client()
    // ... do stuff
})()
```

In any subsequent requests, only the client needs to be fetched.


```typescript
import * as Mongo from '@stagg/mdb'
(async () => {
    const db = await Mongo.client()
    // ... do stuff
})()
```

The config interface can be found in `<PKG>.Config`

```typescript
export interface Config {
    db:string
    host:string
    user:string
    password:string
}
```

### Call of Duty

Currently supports Warzone
