export default {
    io: {
        host: 'http://localhost:8082',
        delay: 1000,
        abandon: 5000,
    },
    http: {
        host: 'http://localhost:8081',
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