export namespace confirm {
    export interface Discord {
        jwt: string
        username: string
        discord: {
            id: string
            avatar: string
            tag: string
        }
    }
    export const discord = ({ jwt, username, discord }:Discord) => {
        return `
            <style>
                p {
                    font-size: 16px;
                }
                .fine-print {
                    font-size: 12px;
                    color: #aaa;
                }
                .fint-print a {
                    text-decoration: none !important;
                    color: inherit !important;
                }
                .wrapper {
                    font-family: sans-serif;
                    padding: 0 24px;
                    max-width: 768px;
                    margin: 0 auto;
                }
                .logo-wrapper {
                    display: block;
                    margin: 0 auto;
                    width: 25vw;
                    height: 25vw;
                    max-width: 120px;
                    max-height: 120px;
                }
                .logo-wrapper img.logo {
                    display: inline-block;
                    width: 25vw;
                    height: 25vw;
                    max-width: 120px;
                    max-height: 120px;
                    border-radius: 50%;
                    border: 1px solid #aaa;
                    box-shadow: 0 10px 10px -5px rgba(0, 0, 0, 0.75);
                }
                .headline {
                    font-size: 20px;
                    text-align: center;
                }
                .accts-wrapper {
                    text-align: center;
                }
                .acct-link-wrapper {
                    border: 1px solid #aaa;
                    border-radius: 12px;
                    display: inline-block;
                    height: 64px;
                    padding: 12px 24px 12px 12px;
                }
                .acct-link-username {
                    display: inline-block;
                    position: relative;
                    top: -0.9em;
                    font-size: 26px;
                }
                .acct-link-icon {
                    display: inline-block;
                    position: relative;
                    height: 64px;
                    width: 64px;
                }
                .acct-link-icon img {
                    display: inline-block;
                    position: relative;
                    height: 64px;
                    width: 64px;
                }
                .acct-link-icon.discord img:first-of-type {
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 0;
                }
                .acct-link-icon.discord img:last-of-type {
                    position: absolute;
                    top: 12px;
                    left: 13px;
                    z-index: 1;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: 1px solid rgba(255, 255, 255, 0.5);
                }
                .acct-link-arrow-wrapper {
                    display: inline-block;
                    text-align: center;
                    margin: 0 12px;
                }
                .acct-link-arrow-wrapper img {
                    width: 96px;
                    
                    position: relative;
                    top: 16px;
                }
                @media only screen and (max-width: 833px) {
                    .acct-link-wrapper, .acct-link-arrow-wrapper {
                    display: block;
                    text-align: center;
                    margin: auto;
                    max-width: 24em;
                    }
                    .acct-link-arrow-wrapper img {
                    width: 46px;
                    transform: rotate(-90deg);
                    margin-bottom: 24px;
                    }
                    .acct-link-wrapper:last-of-type {
                    margin-bottom: 64px;
                    }
                }
                .cta-wrapper {
                    text-align: center;
                    margin: 50px 0;
                    color: rgba(255, 255, 255, 0.9)
                }
                .cta-button {
                    box-shadow: 0 10px 10px -5px rgba(0, 0, 0, 0.75);
                    text-decoration: none;
                    text-align: center;
                    background: #007bff;
                    color: inherit;
                    font-size: 20px;
                    padding: 6px 32px;
                    outline: none;
                    border: 1px solid #0069d9;
                    border-radius: 4px;
                }
            </style>
            <div class="wrapper">
                <div class="logo-wrapper">
                    <a href="https://stagg.co">
                    <img class="logo" alt="Stagg.co" src="https://i.imgur.com/TOViUqV.png" />
                    </a>
                </div>
                <div class="accts-wrapper">
                    <p class="headline">Connect your Discord account and enjoy our full suite of features</p>
                    <div>
                        <span class="acct-link-wrapper">
                            <span class="acct-link-icon discord">
                                <img alt="Discord avatar background" src="https://i.imgur.com/eqcjZoH.png" />
                                <img alt="Discord avatar" src="https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.webp" />
                            </span>
                            <span class="acct-link-username">
                                ${username}
                            </span>
                        </span>
                        <span class="acct-link-arrow-wrapper">
                            <img alt="arrows" src="https://i.imgur.com/xhRVi0n.png" />
                        </span>
                        <span class="acct-link-wrapper">
                            <span class="acct-link-icon">
                                <img alt="Activision account" src="https://i.imgur.com/Birm17c.png" />
                            </span>
                            <span class="acct-link-username">
                                ${discord.tag}
                            </span>
                        </span>
                    </div>
                    <p>Click the button below to connect your Discord account with your Stagg profile; if you did not make this request just ignore this email.</p>
                </div>
                <div class="cta-wrapper">
                    <a href="https://stagg.co/mail?t=${jwt}" class="cta-button">
                        Confirm Discord
                    </a>
                </div>
                <p class="fine-print">
                    This automated email was sent as a result of a user action at <a href="https://stagg.co">Stagg.co</a>;
                    if you did not create this request simply disregard and no furher emails will be sent.
                </p>
            </div>
        `
    }
}
