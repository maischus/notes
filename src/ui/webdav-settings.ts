import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";


import "@material/web/textfield/outlined-text-field.js";
import { MdOutlinedTextField } from "@material/web/textfield/outlined-text-field.js";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";



@customElement("webdav-settings")
export class WebdavSettings extends LitElement {

  public override connectedCallback(): void {
    super.connectedCallback();
  }

  override render() {
    return html`
      <h2>WebDAV settings</h2>
      <form slot="content" id="form-id" method="dialog">
        
          <md-outlined-text-field id="note-title" label="WebDAV URL" value="http://localhost:8080/webdav/user/notes" style="width: 100%"></md-outlined-text-field>
          <md-outlined-text-field id="note-title" label="User" value="user" style="width: 100%"></md-outlined-text-field>
          <md-outlined-text-field id="note-title" label="Password" value="pass" style="width: 100%" type="password"></md-outlined-text-field>
        
      </form>
      <div slot="actions">
        <md-outlined-button @click="${() => history.back()}">Back</md-outlined-button>
        <md-filled-button @click="${() => history.back()}">Save</md-filled-button>
      </div>
    `;
  }

  static override styles = css`
    :host, form {
      display: grid;
      gap: 1em;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "webdav-settings": WebdavSettings;
  }
}
