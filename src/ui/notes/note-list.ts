import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { consume } from "@lit/context";

import "@material/web/fab/fab.js";
import "@material/web/icon/icon.js";
import "@material/web/list/list-item.js";
import "@material/web/list/list.js";

import { Note } from "../../core/note";
import { NotesCollection } from "../../core/notes-collection";
import { Requestor } from "../../mixins/dependency-injection";
import { AppRoute } from "../../app-routing";
import { webdavSyncContext, WebDavSync } from "../../core/webdav-sync/webdav-sync-context";


@customElement("note-note-list")
export class NoteList extends Requestor(LitElement) {
  static override styles = css`
    :host {
      display: block;
    }

    .fabs {
      --_viewport-margin: 2.5vmin;
      position: fixed;
      display: flex;
      z-index: 1;
      flex-direction: column-reverse;
      place-items: center;
      gap: var(--_viewport-margin);
      inset-block: auto var(--_viewport-margin);
      inset-inline: auto var(--_viewport-margin);
    }
  `;

  @consume({ context: webdavSyncContext })
  private webdavSync: WebDavSync;

  _notes: NotesCollection;

  @property()
  tag = "";

  public override connectedCallback(): void {
    super.connectedCallback();
    this._notes = this.requestInstance("notes");
  }

  override render() {
    const tagPrefix = "tag-";
    let displayTag = "";
    let notes: Note[] = [];
    if (this.tag === "") {
      displayTag = "All";
      notes = this._notes.getNotesSortedByDate();
    } else if (this.tag === "untagged") {
      displayTag = "Untagged";
      notes = this._notes.getUntaggedNotes();
    } else if (this.tag.startsWith(tagPrefix)) {
      displayTag = decodeURI(this.tag.slice(tagPrefix.length));
      notes = this._notes.getNotesByTag(displayTag);
    }

    return html`
    <h2>${displayTag}</h2>
    <md-list>
      ${notes.map(
      (note) => html`<md-list-item href="${AppRoute.NoteWithId(note.id)}"><div slot="headline">${note.title}</div><div slot="supporting-text">${this._formatDate(note.lastMod)}</div></md-list-item>`
    )}
    </md-list>
    <div class="fabs" role="group" aria-label="Floating action buttons">
      <md-fab class="fab" aria-label="Add new note" @click="${this._showNewNoteForm
      }"><md-icon aria-hidden="true" slot="icon">add</md-icon></md-fab>
      <md-fab class="fab" aria-label="Synchronize notes" @click="${async () => await this.webdavSync.syncNotes(this._notes)
      }"><md-icon aria-hidden="true" slot="icon">sync</md-icon></md-fab>
    </div>
      `;
  }

  private _formatDate(date: number) {
    const rtf = new Intl.RelativeTimeFormat(navigator.language, { numeric: "auto" });
    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;

    const elapsedTime = Date.now() - date;


    if (elapsedTime < minute) {
      return rtf.format(-Math.round(elapsedTime / second), "seconds");
    } else if (elapsedTime < hour) {
      return rtf.format(-Math.round(elapsedTime / minute), "minute");
    } else if (elapsedTime < day) {
      return rtf.format(-Math.round(elapsedTime / hour), "hour");
    } else if (elapsedTime < week) {
      return rtf.format(-Math.round(elapsedTime / day), "day");
    } else {
      return new Intl.DateTimeFormat(navigator.language).format(date);
    }
  }

  private _showNewNoteForm() {
    const a = document.createElement('a');
    a.href = AppRoute.NewNote;
    this.shadowRoot.appendChild(a);
    a.click();
    a.remove();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "note-note-list": NoteList;
  }
};
