export default {
    http: {
        refresh: 10000,
    },
    login: {
        forward: {
            url: '/dashboard',
            delay: 3000
        },
        forgot: {
            url: 'https://profile.callofduty.com/cod/login'
        }
    }
}