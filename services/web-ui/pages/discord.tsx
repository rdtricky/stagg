import Head from 'next/head'
import cfg from '../config/ui'

export const Page = ({ user }) => {
  return (
      <>
        <Head>
            <title>Stagg Discord</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossOrigin="anonymous" />
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:300,400,700,900" media="all" />
            <link rel="stylesheet" href="/assets/css/discord.css" media="all" />
        </Head>
        <div className="overlay"></div>
        <div className="container d-flex flex-column">
            <div className="header d-flex flex-column justify-content-between align-items-center">
                <nav className="topmenu d-flex justify-content-center">
                    <a href="/">Home</a>
                    <div className="line align-self-center"></div>
                    <a href="#features">Features</a>
                    <div className="line align-self-center"></div>
                    <a target="_blank" href={cfg.discord.server.url}>Join</a>
                </nav>
                <div className="server-info d-flex align-items-center flex-column text-center">
                    <h1>Stagg/Discord</h1>
                    <a className="links-suppressor join-btn btn-pill white" target="_blank" href={cfg.discord.server.url}>Join Now</a>
                </div>
            </div>
            <div className="inner d-flex flex-column">
                <section className="d-flex justify-content-between flex-lg-nowrap flex-wrap" id="features">
                    <div className="image image1 flexGrow1"></div>
                    <div className="text">
                        <h2>Features</h2>
                        <p>
                            <b>Stagg</b>&nbsp;provides a full-featured Discord bot <small>(Stagg#4282)</small> that offers functionality previously reserved
                            for premium subscribers on other similar platforms. But why stop there? Unlike other platforms, Stagg aggregates your entire match 
                            history while allowing users to filter, sort, compare, and analyze in-game performance like never before.
                            <br/><br/>
                            <b>Fan-favorite features include:</b>
                            <br/>
                        </p>
                        <ul>
                            <li>Custom stat-based server roles (KD, WR, etc)</li>
                            <li>On-demand charts drawn with your custom rulesets</li>
                            <li>Profile comparison to see how you stack up against the rest</li>
                            <li>Personalized progress reports as you beat your previous bests</li>
                            <li>Custom commands to shortlist your favorite games and metrics</li>
                            <li>Cash tournaments with lower entry fees and higher payouts</li>
                        </ul>
                    </div>
                </section>
                <section className="d-flex justify-content-between flex-lg-nowrap flex-wrap flex-row-reverse" id="rules">
                    <div className="image image2 flexGrow1"></div>
                    <div className="text">
                        <h2 style={{margin: 0, display: 'inline-block'}}>Coaching</h2>
                        <h3 style={{position: 'relative', top: '-6px', margin: '0 0 2rem 1rem', display: 'inline-block'}}><small>(Coming soon)</small></h3>
                        <p>
                            <b>Stagg</b>&nbsp;is taking in-game stat analytics to the next level by providing your own personal automated coach via Discord bot. 
                            Our differential correlation system compares your profile to Known Good Players (KGPs) to analyze where you're strong 
                            and where you're falling short. With to-the-point, digestible tips you'll know where you stand and what needs work.
                            <br/><br/>
                            <b>At its core the coaching system follows a simple procedure:</b>
                            <br/>
                        </p>
                        <ol>
                            <li>Identify your play-style based on stat trends</li>
                            <li>Match you with players that complement your play-style</li>
                            <li>Send tangible tips on how to improve your game after each match</li>
                            <li>Rinse and repeat</li>
                        </ol>
                    </div>
                </section>
                <section className="join d-flex justify-content-center">
                    <div className="line align-self-center flexGrow1"></div>
                    <a className="links-suppressor btn-pill white" target="_blank" href={cfg.discord.server.url}>Join Now</a>
                    <div className="line align-self-center flexGrow1"></div>
                </section>
            </div>
            <div className="footer d-flex flex-lg-nowrap flex-wrap">
                <div className="d-flex">
                    <div className="block d-flex flex-column">
                        <h3 className="d-flex">Staff</h3>
                        <span>Stagg#4282</span>
                        <span>SixNoSkin#4451</span>
                        <span>parker_ballner#9178</span>
                    </div>
                    <div style={{color: 'transparent'}} className="block d-flex flex-column">
                        <span>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        </span>
                    </div>
                </div>
                <p style={{marginTop: '-2em'}}>
                    Stagg is a fully automated open-source analytics and coaching platform complete with a premium Discord bot. We're using game data
                    to drive players to more wins and more enjoyable games while pairing them with teammates that are hand-selected for their 
                    play-style compatability.
                </p>
            </div>
        </div>
      </>
  )
}

export default Page
