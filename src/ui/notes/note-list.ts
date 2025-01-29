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
import { addIcon, searchIcon } from "../icons";
import { SortCriterion, sortCriterionToString } from "../../core/notes-collection";


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
  private _sortBy: SortCriterion = SortCriterion.Title;

  @state()
  private _search = "";

  @property()
  tag = "";

  override render() {
    const tagPrefix = "tag-";
    let displayTag = "";
    let searchTag = null;

    if (this.tag === "") {
      displayTag = "All";
      searchTag = null;
    } else if (this.tag === "untagged") {
      displayTag = "Untagged";
      searchTag = "";
    } else if (this.tag.startsWith(tagPrefix)) {
      displayTag = decodeURI(this.tag.slice(tagPrefix.length));
      searchTag = displayTag;
    }
    const notes = this._notes.getNotes().filterByTag(searchTag).search(this._search).sortBy(this._sortBy);

    return html`
    <h2>${displayTag} <md-outlined-button @click="${() => this._sortBy = (this._sortBy === SortCriterion.Date) ? SortCriterion.Title : SortCriterion.Date}">Sorted by ${sortCriterionToString(this._sortBy)}</md-outlined-button></h2>
    <div><md-outlined-text-field type="search" id="url" placeholder="Search" @input=${(evt: InputEvent) => this._search = (evt.target as HTMLInputElement).value}>
        ${searchIcon("leading-icon")}
      </md-outlined-text-field></div>
    <md-list>
      ${notes.map(
      (note) => html`<md-list-item href="${AppRoute.NoteWithId(note.id)}"><div slot="headline">${note.title}</div><div slot="supporting-text">${formatDate(note.lastMod)}</div></md-list-item>`
    )}
    </md-list>
    <div class="fabs" role="group" aria-label="Floating action buttons">
      <md-fab class="fab" aria-label="Add new note" @click="${this._showNewNoteForm
      }">${addIcon}</md-fab>
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
