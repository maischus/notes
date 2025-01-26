import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { consume } from "@lit/context";

import { NotesCollection, notesContext } from "../../core/notes-context";
import { Note } from "../../core/note";
import { AppRoute } from "../../app-routing";
import { formatDate } from "../../core/utilities/time";
import { searchIcon } from "../icons";

@customElement("note-search")
export class NoteSearch extends LitElement {
  @consume({ context: notesContext })
  private _notes: NotesCollection;

  @state()
  private _notesFound: Note[] = [];

  override render() {
    return html`
      <div><md-outlined-text-field type="search" id="url" placeholder="Search" @input=${this._search}>
        ${searchIcon("leading-icon")}
      </md-outlined-text-field></div>
      <md-list>
      ${this._notesFound.map(
      (note) => html`<md-list-item href="${AppRoute.NoteWithId(note.id)}"><div slot="headline">${note.title}</div><div slot="supporting-text">${formatDate(note.lastMod)}</div></md-list-item>`
    )}
    </md-list>
    `;
  }

  private _search(evt: InputEvent) {
    const search = (evt.target as HTMLInputElement).value;
    if (search.length < 3) {
      this._notesFound = this._notes.getNotes();
      return;
    }

    const keywords = search.split(" ");
    this._notesFound = this._notes.search(keywords);
  }

}

declare global {
  interface HTMLElementTagNameMap {
    "note-search": NoteSearch;
  }
};