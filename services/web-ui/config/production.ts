export default {
    io: {
        host: 'https://io-dot-stagcp.ue.r.appspot.com',
        delay: 1000,
        abandon: 5000,
    },
    http: {
        host: 'https://api-dot-stagcp.ue.r.appspot.com',
        refresh: 10000,
    },
    idb: {
        store: 'profiles'
    },
    login: {
        forward: {
            url: '/dashboard',
            delay: 3000
        },
        forgot: {
            url: 'https://profile.callofduty.com/cod/login'
        }
    },
    provider: {
        threshold: {
            ready: 10
        }
    }
}