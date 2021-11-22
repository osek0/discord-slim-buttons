import { Types } from "discord-slim";

export interface MessageParams {
  content?: string;
  nonce?: number | string;
  tts?: string;
  embeds?: Types.Embed[];
  embed?: Types.Embed;
  allowed_mentions?: Types.AllowedMentions;
  message_reference?: Types.MessageReference;
  components?: Types.ActionRow[];
}
