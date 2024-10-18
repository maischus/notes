import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";

import { AppRoute } from "../app-routing";

@customElement("home-page")
export class HomePage extends LitElement {

  override render() {
    return html`
      <h1>My Notes</h1>
      <md-filled-button href="${AppRoute.NewNote}">Create new note</md-filled-button>
      <md-outlined-button href="${AppRoute.Tags}">Show all tags</md-outlined-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "home-page": HomePage;
  }
}
