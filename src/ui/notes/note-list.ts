import "@material/web/fab/fab.js";
import "@material/web/icon/icon.js";
import "@material/web/list/list-item.js";
import "@material/web/list/list.js";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Note } from "../../core/note";
import { NotesCollection } from "../../core/notes-collection";
import { Requestor } from "../../mixins/dependency-injection";
import { AppRoute } from "../../app-routing";
import { syncNotes } from "../../sync";

@customElement("note-note-list")
export class NoteList extends Requestor(LitElement) {
  static override styles = css`
    :host {
      display: block;
    }

    .fab-container {
      position: fixed;
      bottom: 90px;
      right: 30px;
    }
  `;

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
      notes = this._notes.getNotes();
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
      (note) => html`<md-list-item href="${AppRoute.NoteWithId(note.id)}">${note.title}</md-list-item>`
    )}
    </md-list>
    <div class="fab-container">
      <md-fab @click="${this._showNewNoteForm
      }"><md-icon slot="icon">add</md-icon></md-fab>
      <md-fab @click="${async () => await syncNotes(this._notes)
      }"><md-icon slot="icon">sync</md-icon></md-fab>
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
