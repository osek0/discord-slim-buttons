import { Types } from "discord-slim";

export interface InteractionCallbacks {
  [k: string]: (interactions: Types.Interaction) => Types.InteractionResponse;
}
