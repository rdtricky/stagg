# Stagg Monorepo

Built with TypeScript, Node, Express, MongoDB, React, and Next; package management provided by Lerna

## Contributing

You will need a `.env` file in the root of each service you intend to run for local development. See the `README` of the `services` to learn more.

### To do

PRs are always welcome so please feel free to fork or request feature branch access.

#### Web UI

- Cache data in IDB again
- Discord landing page off-center in mobile
- Large expandable charts dont fit mobile screen
- Add tooltips to each chart to explain correlations
- Customizable dashboard with custom-built charts
- Correlation creation tool

#### Discord Bot

- Make X axis date/time for OT charts
- Group by time of day (eg: compare 8pm-9pm vs 12am-1am)
- Correlations
    - kills/avgLifeTime
    - damageDone/timePlayed
- Summarize with `wz barracks` and `mp barracks`
    - Time played
    - Games played
    - Win/Loss Ratio
    - Kill/Death Ratio
    - Score Per Minute
    - Best game
        - Kills
        - Score
        - Team Wipes
        - Damage Done
        - Damage Taken
- Custom Discord roles
    - KD
    - SPM
    - Win/Top5/Top10 Rate
    - Correlations from above
- Alert when player beats previous best
    - Kills
    - Damage
    - Any win

#### Call of Duty API

- WZ/MP Profiles
- Match summaries
- Multiplayer API/types
- Some teamPlacement props are 0
- Scrape isolated summary for each match with `start=(startTime-1)*1000, end=(endTime-1)*1000`
- Alert/Logs to notify when the API returns a field we current don't include or ignore

#### Republish

- Set all packages to empty with no deps
- Unpublish all packages
- Create new repo
- Republish
- Testing and error reporting

### Publishing to NPM

To publish new packages, you will need access to [Stagg NPM](https://www.npmjs.com/settings/stagg/packages). After gaining permissions to publish to this organization, use the following command to authenticate your local client.

```
npm login --registry=https://registry.npmjs.org/ --scope=stagg
```

https://quickchart.io/chart?c={type:'bar',data:{labels:['Q1','Q2','Q3','Q4'], datasets:[{label:'Users',data:[50,60,70,180]},{label:'Revenue',data:[100,200,300,400]}]}}
https://quickchart.io/chart?c={type:'pie',data:{labels:['Solos','Duos','Trios','Quads'],datasets:[{data:[6,0,52,42]}]}}

{type:'pie',data:{labels:['Solos','Duos','Trios','Quads'],datasets:}}
{'labels':['Solos','Duos','Trios','Quads'],'datasets':[{'data':[6,0,52,42],'backgroundColor':['#003f5c','#2f4b7c','#665191','#a05195','#d45087','#f95d6a','#ff7c43','#ffa600'],'hoverBackgroundColor':['#003f5c','#2f4b7c','#665191','#a05195','#d45087','#f95d6a','#ff7c43','#ffa600']}]}
