# Stagg Integration APIs

Provided by [Stagg.co](https://stagg.co)

## Call of Duty API

Simply install the package and instantiate new instances with your own tokens.

```typescript
import { CallOfDuty } from '@stagg/datasources'
(async () => {
    const tokens = {
        sso: '<YOUR-SSO-TOKEN-HERE>',
        xsrf: '<YOUR-CSRF/XSRF-TOKEN-HERE>',
        atkn: '<YOUR-ATKN-TOKEN-HERE>',
    }
    const API = new CallOfDuty(tokens)
    const myProfiles = await API.Identity()
    console.log(myProfiles)
})()
```
