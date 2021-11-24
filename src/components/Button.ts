import { Helpers, Types } from "discord-slim";
import { randomUUID } from "crypto";

export class Button {
  callback: (interaction: Types.Interaction) => Types.InteractionResponse;
  params: Types.Button;

  constructor (callback: (interaction: Types.Interaction) => Types.InteractionResponse, style: Helpers.ButtonStyles, label: string, emoji?: Types.Emoji) {
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
