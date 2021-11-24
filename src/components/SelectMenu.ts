import { Helpers, Types } from "discord-slim";
import { randomUUID } from "crypto";

export class SelectMenu {
  callback: (interaction: Types.Interaction) => Types.InteractionResponse;
  params: Types.SelectMenu;

  constructor(callback: (interaction: Types.Interaction) => Types.InteractionResponse, options: { label: string, value: string, description?: string, emoji?: Types.Emoji }[], placeholder?: string) {
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
