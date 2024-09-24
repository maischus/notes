import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { consume } from "@lit/context";

import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/textfield/outlined-text-field.js";
import { MdOutlinedTextField } from "@material/web/textfield/outlined-text-field.js";

import { WebDavSync, webdavSyncContext } from "../core/webdav-sync/webdav-sync-context";


@customElement("webdav-settings")
export class WebdavSettings extends LitElement {

  @consume({ context: webdavSyncContext })
  private webdavSync: WebDavSync;

  override render() {
    return html`
      <h2>WebDAV settings</h2>
      <form slot="content" id="form-id" method="dialog">
          <md-outlined-text-field id="url" label="WebDAV URL" value="${this.webdavSync.settings.url}"></md-outlined-text-field>
          <md-outlined-text-field id="user" label="User" value="${this.webdavSync.settings.user}"></md-outlined-text-field>
          <md-outlined-text-field id="password" label="Password" value="${this.webdavSync.settings.password}" type="password"></md-outlined-text-field>
      </form>
      <div slot="actions">
        <md-outlined-button @click="${() => history.back()}">Cancel</md-outlined-button>
        <md-filled-button @click="${this._saveSettings}">Save</md-filled-button>
      </div>
    `;
  }

  private _saveSettings() {
    const urlField = this.shadowRoot.querySelector("#url") as MdOutlinedTextField;
    const userField = this.shadowRoot.querySelector("#user") as MdOutlinedTextField;
    const passwordField = this.shadowRoot.querySelector("#password") as MdOutlinedTextField;
    this.webdavSync.setSettings(urlField.value, userField.value, passwordField.value);
  }

  static override styles = css`
    :host, form {
      display: grid;
      gap: 1em;
    }

    md-outlined-text-field {
      width: 100%;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "webdav-settings": WebdavSettings;
  }
}
