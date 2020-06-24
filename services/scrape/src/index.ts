import { CallOfDuty } from '@stagg/api'

(async () => {
    const tokens = {
        sso: 'MTIzMDk5MjY6MTU5MzkxODY1NzE1MjoyMDhhODg5ODczN2E2YzExNjY2NWJjMDJlNjBmNDBjNA',
        xsrf: 'gp297GuQWBbhhrqJXIh-wqM36tojsLYqPCTf5DhV-S-pFVPd1Ny8b9ufHhwurvK3',
        atkn: 'eyJhbGciOiAiQTEyOEtXIiwgImVuYyI6ICJBMTI4R0NNIiwgImtpZCI6ICJ1bm9fcHJvZF9sYXNfMSJ9.Hjc4Z2zCPaKFl-o6UGpZeIb0Ffkwmgj0snd_2DZuO_sjEDLA43pwXQ.b3SHMZEtIWXroxio.0NkwdGruONSckfYVa9iXz9_SOMwW8aM5saf3YlTw8EE5RuaqiN4LT5qN0deD9pF-AJht6eyu6g0CwpwtPDKTWcFT7FUdl3ShW8GwOqKTlbsTqHqyDgcFiYUOF07DBIdH4stolaqiSwsKJsPbvjJpZ2pnoGkOl9xT7c0IuYA_S_XLO-ho7ntfWsBlXTMSIiarrMgrVe3nEukcQb6lhPPXt1VLyFYNzD0d8eU4MsRrMjZe9hYvsKQAcGmne1_h-98e-mTbdm_UFocQjBDDRbil8XmIzuPbX5PYR5r-TfpN26TdckwI4uwvzeMMmfr3J29bJ1bkkg_metqMSlZm_4SBDrnf7ukONZLWn8-oukDQNvVx_zkGWZ32hSEKm6vs7JLQAPB0ZmsmiwOJsSlVdQKseT_e32I4UNO--IHcZppS5mM.qxACgvzpkJosj-THymBntg',
    }
    const API = new CallOfDuty(tokens)
    console.log(await API.Identity())
})()
