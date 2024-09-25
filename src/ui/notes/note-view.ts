import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { consume } from "@lit/context";
import { marked } from 'marked';
import DOMPurify from 'dompurify';

import "@material/web/chips/assist-chip.js";
import "@material/web/chips/chip-set.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/menu/menu-item.js";
import "@material/web/menu/menu.js";

import { AppRoute } from "../../app-routing";
import { NotesCollection, notesContext } from "../../core/notes-context";

@customElement("note-view")
export class NoteView extends LitElement {
  static override styles = css`
    h2 {
      display: flex;
      justify-content: space-between;
    }
  `;

  @consume({ context: notesContext })
  private _notes: NotesCollection;

  @property()
  note: string = "";

  override render() {
    const note = this._notes.getNote(this.note);
    if (!note) {
      return html`<p>Note not found.</p>`;
    }

    const parser = new DOMParser();
    const content = parser.parseFromString(DOMPurify.sanitize(marked.parse(note.content) as string), 'text/html');

    return html`
      <h2>
        ${note.title}
        <span style="position: relative"
          ><md-icon-button @click="${this.showMenu}" id="edit-button"
            ><md-icon>more_vert</md-icon></md-icon-button
          >
          <md-menu anchor="edit-button">
            <md-menu-item href="${AppRoute.EditNoteWithId(note.id)}"
              ><div slot="headline">Edit</div></md-menu-item
            >
            <md-menu-item @click="${() => this._deleteNote(note.id)}"
              ><div slot="headline">Delete</div></md-menu-item
            >
          </md-menu>
        </span>
      </h2>
      ${content.body.childNodes}
      <md-chip-set>
        ${note.tags.map(
      (tag) => html`<md-assist-chip label="${tag}" href="${AppRoute.TagWithId("tag-" + tag)}"></md-assist-chip>`,
    )}
      </md-chip-set>
    `;
  }

  private showMenu(evt: MouseEvent) {
    const menu = this.shadowRoot.querySelector("md-menu");
    if (!menu) {
      return;
    }
    menu.open = true;
  }

  private _deleteNote(noteId: string) {
    this._notes.deleteNote(noteId);
    history.back();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "note-view": NoteView;
  }
}
