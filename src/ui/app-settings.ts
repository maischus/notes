import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { consume } from "@lit/context";

import "@material/web/button/outlined-button.js";

import { WebDavSync, webdavSyncContext } from "../core/webdav-sync/webdav-sync-context";
import { NotesCollection, notesContext } from "../core/notes-context";
import { AppRoute } from "../app-routing";
import { downloadBlobAsFile } from "../core/utilities/download";


@customElement("app-settings")
export class AppSettings extends LitElement {

  @consume({ context: webdavSyncContext })
  private webdavSync: WebDavSync;

  @consume({ context: notesContext })
  private _notes: NotesCollection;

  override render() {
    return html`
      <h2>Settings</h2>
      <md-outlined-button href="${AppRoute.WebdavSettings}">WebDAV settings</md-outlined-button>
      <md-outlined-button @click="${async () => await this.webdavSync.syncNotes(this._notes)
      }">Synchronize notes</md-outlined-button>
      <md-outlined-button @click="${this._exportNotes}">Export notes</md-outlined-button>
    `;
  }

  private _exportNotes() {
    const blob = new Blob([JSON.stringify(this._notes.getNotes())], {
      type: "application/json"
    });
    downloadBlobAsFile(blob, "my-notes.json");
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
    "app-settings": AppSettings;
  }
}
