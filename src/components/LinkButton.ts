import { Helpers, Types } from "discord-slim";

export class LinkButton {
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
