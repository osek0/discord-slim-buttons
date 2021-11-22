import {Actions, Authorization, Client, ClientEvents, Events, Helpers, Types} from 'discord-slim';
import { randomUUID } from 'crypto'

import { handleButtonInteraction } from './interactions.js';
import {MessageParams} from "@/resources/MessageParams";

interface DiscordConfig {
  botToken: string;
  applicationId: string;
}

class DiscordButtons {
  private client = new Client();
  private config: DiscordConfig;

  constructor(config: DiscordConfig) {
    this.config = config;
    this.setupClientListeners();
    this.setupEventListeners();

    const authorization = new Authorization(this.config.botToken);
    Actions.setDefaultRequestOptions({ authorization });
    this.client.Connect(authorization);
  }

  private setupClientListeners () {
    this.client.on(ClientEvents.CONNECT, () => console.log('Connection established.'));
    this.client.on(ClientEvents.DISCONNECT, (code) => console.error(`Disconnect. (${code})`));
    this.client.on(ClientEvents.WARN, console.warn);
    this.client.on(ClientEvents.ERROR, console.error);
    this.client.on(ClientEvents.FATAL, (e) => {
      console.error(e);
      process.exit(1);
    });
  }

  private setupEventListeners () {
    this.client.events.on(Events.INTERACTION_CREATE, (interaction: Types.Interaction) => handleButtonInteraction(interaction));
  }

  async sendMessage (channelId: string, params: MessageParams) {
    await Actions.Message.Create(channelId, params).catch(err => console.log(err, err.response.errors.components[0].components[2]));
  }
}


async function main() {
  const discordButtons = new DiscordButtons({
    botToken: process.env.BOT_TOKEN,
    applicationId: process.env.APPLICATION_ID
  });

  await discordButtons.sendMessage('897069950047502346', {
    content: 'test',
    components: [{
      type: Helpers.ComponentTypes.ACTION_ROW,
      components: [
        // {
        //   type: Helpers.ComponentTypes.BUTTON,
        //   style: Helpers.ButtonStyles.SUCCESS,
        //   label: 'test',
        //   custom_id: randomUUID()
        // },
        // {
        //   type: Helpers.ComponentTypes.BUTTON,
        //   style: Helpers.ButtonStyles.DANGER,
        //   label: 'test2',
        //   custom_id: randomUUID()
        // },
        {
          type: Helpers.ComponentTypes.SELECT_MENU,
          custom_id: randomUUID(),
          options: [
            {
              "label": "Rogue",
              "value": "rogue",
              "description": "Sneak n stab",
              "emoji": {
                "name": "rogue",
                "id": "625891304148303894"
              }
            },
            {
              "label": "Mage",
              "value": "mage",
              "description": "Turn 'em into a sheep",
              "emoji": {
                "name": "mage",
                "id": "625891304081063986"
              }
            },
            {
              "label": "Priest",
              "value": "priest",
              "description": "You get heals when I'm done doing damage",
              "emoji": {
                "name": "priest",
                "id": "625891303795982337"
              }
            }
          ],
          min_values: 1,
          max_values: 3
        }
      ]
    }],
  })
}

main();
