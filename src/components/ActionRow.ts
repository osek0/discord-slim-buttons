import { Helpers } from "discord-slim";

import { LinkButton } from "./LinkButton.js";
import { Button } from "./Button.js";
import { SelectMenu } from "./SelectMenu.js";
import { InteractionCallbacks } from "../resources/InteractionCallbacks";

export class ActionRow {
  params: { type: Helpers.ComponentTypes.ACTION_ROW, components: SelectMenu[] | (LinkButton | Button)[] }
  interactionCallbacks: InteractionCallbacks = {};

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
