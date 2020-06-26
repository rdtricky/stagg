# Stagg MongoDB Integration

Provided by [Stagg.co](https://stagg.co)

## Getting Started

Install the package

```
yarn install @stagg/mongo
```

Configure the connection on startup (only done once).

```typescript
import * as Mongo from '@stagg/mongo'
(async () => {
    const cfg:Mongo.T.Config = {...}
    Mongo.Config(cfg)
    const db = await Mongo.Client()
    // ... do stuff
})()
```

In any subsequent requests, only the client needs to be fetched.


```typescript
import * as Mongo from '@stagg/mongo'
(async () => {
    const db = await Mongo.Client()
    // ... do stuff
})()
```

The config interface can be found in `<PKG>.T.Config`

```typescript
export namespace T {
    export interface Config {
        db:string
        host:string
        user:string
        password:string
    }
}
```

### Call of Duty

Currently supports Warzone
