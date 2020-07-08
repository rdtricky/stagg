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
                    <a href="#about">About</a>
                    <div className="line align-self-center"></div>
                    <a href={cfg.discord.server.url}>Join</a>
                </nav>
                <div className="server-info d-flex align-items-center flex-column text-center">
                    <h1>Stagg Discord</h1>
                    <a className="links-suppressor join-btn btn-pill white" href={cfg.discord.server.url}>Join Server</a>
                </div>
            </div>
            <div className="inner d-flex flex-column">
                <section className="d-flex justify-content-between flex-lg-nowrap flex-wrap" id="about">
                    <div className="image image1 flexGrow1"></div>
                    <div className="text">
                        <h2>About</h2>
                        <p>
                            <b>Stagg</b>&nbsp;is a fully modular bot which comes with sets of features/commands that can be enabled/disabled to your liking, 
                            making it customizable exactly how you want. You can turn Red into a trivia bot, an admin bot, a music bot (...) or all of these together
                            <br/><br/>
                            <b>The default set of modules includes and it's not limited to:</b>
                            <br/>
                        </p>
                        <ul>
                            <li>Moderation features (kick/ban/softban, filters, mod-log...)</li>
                            <li>Trivia (lists included and you can make new ones!)</li>
                            <li>Music features (playlists, youtube, soundcloud, queues...)</li>
                            <li>Stream alerts (twitch/hitbox)</li>
                            <li>Slot machines (yes, really!)</li>
                            <li>Custom commands</li>
                            <li>Imgur/gif search</li>
                            <li>And much much more</li>
                        </ul>
                    </div>
                </section>
                <section className="discord-widget">
                    <iframe style={{height: '200px'}} className="d-flex" src={`https://discordapp.com/widget?id=${cfg.discord.server.id}&theme=dark`} frameBorder={0}></iframe>
                </section>
                <section className="d-flex justify-content-between flex-lg-nowrap flex-wrap flex-row-reverse" id="rules">
                    <div className="image image2 flexGrow1"></div>
                    <div className="text">
                        <h2>Rules</h2>
                        <p>
                            <b>Red</b>&nbsp;is a fully modular bot which comes with sets of features/commands that can be enabled/disabled to your liking, 
                            making it customizable exactly how you want. You can turn Red into a trivia bot, an admin bot, a music bot (...) or all of these together
                            <br/><br/>
                            <b>The default set of modules includes and it's not limited to:</b>
                            <br/>
                        </p>
                        <ul>
                            <li>Moderation features (kick/ban/softban, filters, mod-log...)</li>
                            <li>Trivia (lists included and you can make new ones!)</li>
                            <li>Music features (playlists, youtube, soundcloud, queues...)</li>
                            <li>Stream alerts (twitch/hitbox)</li>
                            <li>Slot machines (yes, really!)</li>
                            <li>Custom commands</li>
                            <li>Imgur/gif search</li>
                            <li>And much much more</li>
                        </ul>
                    </div>
                </section>
                <section className="join d-flex justify-content-center">
                    <div className="line align-self-center flexGrow1"></div>
                    <a className="links-suppressor btn-pill white" href={cfg.discord.server.url}>Join Server</a>
                    <div className="line align-self-center flexGrow1"></div>
                </section>
            </div>
            <div className="footer d-flex flex-lg-nowrap flex-wrap">
                <div className="d-flex">
                    <div className="block d-flex flex-column">
                        <h3 className="d-flex">Staff</h3>
                        <span>mdlindsey#8745</span>
                        <span>SurgicalSeyeco#0840</span>
                    </div>
                    <div style={{color: 'transparent'}} className="block d-flex flex-column">
                        <span>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        </span>
                    </div>
                </div>
                <p style={{marginTop: '-2em'}}>
                    Stagg is a fully automated open-source platform complete with a premium Discord bot. We're using game data to drive players to more wins and
                    better games while simultaneously pairing them with partners that are hand-selected for their play-style compatability.
                </p>
            </div>
        </div>
      </>
  )
}

export default Page
