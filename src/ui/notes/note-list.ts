import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { consume } from "@lit/context";

import "@material/web/button/outlined-button.js";
import "@material/web/fab/fab.js";
import "@material/web/icon/icon.js";
import "@material/web/list/list-item.js";
import "@material/web/list/list.js";

import { Note } from "../../core/note";
import { AppRoute } from "../../app-routing";
import { NotesCollection, notesContext } from "../../core/notes-context";
import { formatDate } from "../../core/utilities/time";


@customElement("note-note-list")
export class NoteList extends LitElement {
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

  @consume({ context: notesContext })
  private _notes: NotesCollection;

  @state()
  private _sortBy: "title" | "date" = "title";

  @property()
  tag = "";

  override render() {
    const tagPrefix = "tag-";
    let displayTag = "";
    let notes: Note[] = [];
    if (this.tag === "") {
      displayTag = "All";
      notes = this._notes.getNotes(this._sortBy);
    } else if (this.tag === "untagged") {
      displayTag = "Untagged";
      notes = this._notes.getNotes(this._sortBy, "");
    } else if (this.tag.startsWith(tagPrefix)) {
      displayTag = decodeURI(this.tag.slice(tagPrefix.length));
      notes = this._notes.getNotes(this._sortBy, displayTag);
    }

    return html`
    <h2>${displayTag} <md-outlined-button @click="${() => this._sortBy = (this._sortBy === "date") ? "title" : "date"}">Sorted by ${this._sortBy}</md-outlined-button></h2>
    <p></p>
    <md-list>
      ${notes.map(
      (note) => html`<md-list-item href="${AppRoute.NoteWithId(note.id)}"><div slot="headline">${note.title}</div><div slot="supporting-text">${formatDate(note.lastMod)}</div></md-list-item>`
    )}
    </md-list>
    <div class="fabs" role="group" aria-label="Floating action buttons">
      <md-fab class="fab" aria-label="Add new note" @click="${this._showNewNoteForm
      }"><md-icon aria-hidden="true" slot="icon">add</md-icon></md-fab>
    </div>
    `;
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
