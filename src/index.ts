import { Actions, Authorization, Client, ClientEvents, Events, Helpers, Types } from 'discord-slim';

import { MessageParams, MessageWithComponents } from "./resources/MessageParams";
import { InteractionCallbacks } from "./resources/InteractionCallbacks";
import { Button } from './components/Button.js';
import { LinkButton } from './components/LinkButton.js';
import { SelectMenu } from './components/SelectMenu.js';
import { ActionRow } from './components/ActionRow.js';

interface DiscordConfig {
  botToken: string;
  applicationId: string;
}

export class DiscordButtons {
  private client = new Client();
  private config: DiscordConfig;
  interactionCallbacks: InteractionCallbacks = {};

  constructor(config: DiscordConfig, interactionCallbacks: InteractionCallbacks) {
    this.config = config;
    this.setupClientListeners();
    this.setupEventListeners();
    this.interactionCallbacks = interactionCallbacks;

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
    this.client.events.on(Events.INTERACTION_CREATE, (interaction: Types.Interaction) => this.handleButtonInteraction(interaction));
  }

  private async handleButtonInteraction(interaction: Types.Interaction) {
    if (interaction.type !== Helpers.InteractionTypes.MESSAGE_COMPONENT) return;

    const callback = this.interactionCallbacks[interaction.data.custom_id];
    if (!callback) return;

    const params: Types.InteractionResponse = callback(interaction);
    await Actions.Application.CreateInteractionResponse(interaction.id, interaction.token, params)

    return;
  }

  async sendMessage (channelId: string, params: MessageParams, actionRows: ActionRow[]): Promise<InteractionCallbacks> {
    if (actionRows.length > 5) {
      throw new Error('Can have up to 5 action rows in single message');
    }

    const components = [];
    let actionRowsCallbacks: InteractionCallbacks = {};
    for (const actionRow of actionRows) {
      components.push(actionRow.params);
      actionRowsCallbacks = { ...actionRowsCallbacks, ...actionRow.interactionCallbacks };
    }

    this.interactionCallbacks = { ...this.interactionCallbacks, ...actionRowsCallbacks };

    const paramsWithComponents: MessageWithComponents = { ...params, components };
    await Actions.Message.Create(channelId, paramsWithComponents).catch(err => {
      console.log(err)
    });

    return actionRowsCallbacks;
  }
}

export { Button, LinkButton, SelectMenu, ActionRow };

async function main() {
  const discordButtons = new DiscordButtons({
    botToken: process.env.BOT_TOKEN,
    applicationId: process.env.APPLICATION_ID
  }, {});

  const button = new Button(interaction => ({ type: Helpers.InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE, data: { content: interaction.data.custom_id } }), Helpers.ButtonStyles.SUCCESS, 'ok', { "id": null, "name": "🔥" });
  const button2 = new Button(interaction => ({ type: Helpers.InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE, data: { content: interaction.data.custom_id } }), Helpers.ButtonStyles.DANGER, 'close');
  const button3 = new LinkButton('ok', 'https://google.com/', { "id": null, "name": "🔥" });

  const selectMenuOptions = [
    {
      label: "Rogue",
      value: "rogue",
      description: "Sneak n stab",
      emoji: {
        name: "rogue",
        id: "625891304148303894"
      }
    },
    {
      label: "Mage",
      value: "mage",
      description: "Turn 'em into a sheep",
      emoji: {
        name: "mage",
        id: "625891304081063986"
      }
    },
    {
      label: "Priest",
      value: "priest",
      description: "You get heals when I'm done doing damage",
      emoji: {
        name: "priest",
        id: "625891303795982337"
      }
    }
  ];

  const selectMenu = new SelectMenu(interaction => ({ type: Helpers.InteractionCallbackTypes.CHANNEL_MESSAGE_WITH_SOURCE, data: { content: interaction.data.custom_id } }), selectMenuOptions, 'Make a selection');
  const actionRow = new ActionRow(selectMenu);
  const actionRow2 = new ActionRow([button, button3, button2]);

  const params = {
    content: 'To jest fajna wiadomość :)',
    embeds: [{ title: 'Kliknij w ciastko!', description: 'Click! Click! Click!', color: 15105570, url: 'https://orteil.dashnet.org/cookieclicker/' }]
  }

  const callbacks = await discordButtons.sendMessage('897069950047502346', params, [actionRow, actionRow2]);
  console.log(callbacks);
}

main();
