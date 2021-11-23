import {Actions, Authorization, Client, ClientEvents, Events, Helpers, Types} from 'discord-slim';
import { randomUUID } from 'crypto'

import {MessageParams, MessageWithComponents} from "@/resources/MessageParams";

interface DiscordConfig {
  botToken: string;
  applicationId: string;
}

class DiscordButtons {
  private client = new Client();
  private config: DiscordConfig;
  interactionCallbacks: { [k: string]: (interactions: Types.Interaction) => any } = {};

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
    this.client.events.on(Events.INTERACTION_CREATE, (interaction: Types.Interaction) => this.handleButtonInteraction(interaction));
  }

  private handleButtonInteraction(interaction: Types.Interaction) {
    this.interactionCallbacks[interaction.data.custom_id](interaction);
  }

  async sendMessage (channelId: string, params: MessageParams, actionRows: ActionRow[]) {
    if (actionRows.length > 5) {
      throw new Error('Can have up to 5 action rows in single message');
    }

    const components = [];
    for (const actionRow of actionRows) {
      components.push(actionRow.params);
      this.interactionCallbacks = { ...this.interactionCallbacks, ...actionRow.interactionCallbacks };
    }

    const paramsWithComponents: MessageWithComponents = {
      ...params,
      components
    }

    await Actions.Message.Create(channelId, paramsWithComponents).catch(err => {
      console.log(err)
    });
  }
}

class Button {
  callback: (interaction: Types.Interaction) => any;
  params: Types.Button;

  constructor (callback: (interaction: Types.Interaction) => any, style: Helpers.ButtonStyles, label: string, emoji?: Types.Emoji) {
    this.callback = callback;
    this.params = {
      type: Helpers.ComponentTypes.BUTTON,
      style,
      label,
      emoji,
      custom_id: randomUUID()
    };
  }
}

class LinkButton {
  params: Types.Button;

  constructor(label: string, url: string, emoji: Types.Emoji) {
    this.params = {
      type: Helpers.ComponentTypes.BUTTON,
      style: Helpers.ButtonStyles.LINK,
      label,
      emoji,
      url
    };
  }
}

class SelectMenu {
  callback: (interaction: Types.Interaction) => any;
  params: Types.SelectMenu;

  constructor(callback: (interaction: Types.Interaction) => any, options: { label: string, value: string, description?: string, emoji?: Types.Emoji }[], placeholder?: string) {
    this.callback = callback;
    this.params = {
      type: Helpers.ComponentTypes.SELECT_MENU,
      custom_id: randomUUID(),
      options,
      placeholder,
      min_values: 1,
      max_values: options.length
    };
  }
}

class ActionRow {
  params: { type: Helpers.ComponentTypes.ACTION_ROW, components: SelectMenu[] | (LinkButton | Button)[] }
  interactionCallbacks: { [k: string]: (interactions: Types.Interaction) => any } = {};

  constructor(component: SelectMenu | (Button | LinkButton)[]) {
    const actionComponents = Array.isArray(component) ? component : [component];
    if (actionComponents.length > 5) {
      throw new Error('Can have up to 5 buttons in action row');
    }

    const components = [];
    for (const actionComponent of actionComponents) {
      components.push(actionComponent.params);
      if (actionComponent instanceof LinkButton) continue;

      this.interactionCallbacks[actionComponent.params.custom_id] = actionComponent.callback;
    }

    this.params = {
      type: Helpers.ComponentTypes.ACTION_ROW,
      components
    }
  }
}

async function main() {
  const discordButtons = new DiscordButtons({
    botToken: process.env.BOT_TOKEN,
    applicationId: process.env.APPLICATION_ID
  });

  const button = new Button(interaction => console.log(interaction.message.content), Helpers.ButtonStyles.SUCCESS, 'ok', { "id": null, "name": "🔥" });
  const button2 = new Button(interaction => console.log(interaction), Helpers.ButtonStyles.DANGER, 'close');
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

  const selectMenu = new SelectMenu(interaction => console.log(interaction.data.values), selectMenuOptions, 'Make a selection');
  const actionRow = new ActionRow(selectMenu);
  const actionRow2 = new ActionRow([button, button3, button2]);

  const params = {
    content: 'To jest fajna wiadomość :)',
    embeds: [{ title: 'Kliknij w ciastko!', description: 'Click! Click! Click!', color: 15105570, url: 'https://orteil.dashnet.org/cookieclicker/' }]
  }

  discordButtons.sendMessage('897069950047502346', params, [actionRow, actionRow2]);
}

main();
