const host = 'https://api-dot-stagcp.ue.r.appspot.com'
export default {
    io: {
        host,
        delay: 1000,
        abandon: 5000,
    },
    http: {
        host,
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