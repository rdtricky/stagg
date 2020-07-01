export default {
    api: {
        host: 'http://localhost:8080/api',
        refresh: 10000,
    },
    login: {
        forward: {
            delay: 3000
        },
        forgot: {
            url: 'https://profile.callofduty.com/cod/login'
        }
    }
}