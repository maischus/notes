import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { consume } from "@lit/context";

import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/chips/chip-set.js";
import "@material/web/chips/filter-chip.js";
import "@material/web/select/outlined-select.js";
import "@material/web/textfield/outlined-text-field.js";
import { MdFilterChip } from "@material/web/chips/filter-chip.js";
import { MdOutlinedTextField } from "@material/web/textfield/outlined-text-field.js";

import { Note } from "../../core/note";
import { NotesCollection, notesContext } from "../../core/notes-context";

interface Tag {
  name: string;
  selected: boolean;
}

@customElement("note-edit-view")
export class NoteEditView extends LitElement {
  static override styles = css`
    :host {
    }
    /*md-outlined-text-field {
      width: 100%;
    }*/
  `;

  @property()
  note: string = "";

  @state()
  tags: Tag[] = [];

  @consume({ context: notesContext })
  _notes: NotesCollection;

  public override connectedCallback(): void {
    super.connectedCallback();
    this.tags = this._notes.getTags().map(tag => <Tag>{ name: tag, selected: false });
  }

  override render() {
    let note = <Note>{ title: "", content: "", tags: [] };
    if (this.note !== "") {
      note = this._notes.getNote(this.note);
    }

    return html`
      <h2>${this.note === "" ? "Add new" : "Edit"} note</h2>
      <form slot="content" id="form-id" method="dialog">
        <p>
          <md-outlined-text-field id="note-title" label="Title" value="${note.title}" style="width: 100%"></md-outlined-text-field>
        </p>
        <p>
          <md-outlined-text-field
            id="note-content"
            label="Note"
            type="textarea"
            value="${note.content}"
            style="width: 100%; height: 200px"
          ></md-outlined-text-field>
        </p>
        <p>
          <md-chip-set>
            ${this.tags.map((tag) => html`<md-filter-chip label="${tag.name}" ?selected=${tag.selected || note.tags.includes(tag.name)}></md-filter-chip>`)}
          </md-chip-set>
          <md-outlined-text-field id="new-tag" label="New tag" @keydown="${this._appendTag}"></md-outlined-text-field>
        </p>
      </form>
      <div slot="actions">
        <md-outlined-button @click="${() => history.back()}">Back</md-outlined-button>
        <md-filled-button @click="${this._saveNote}">Save</md-filled-button>
      </div>
    `;
  }

  private _appendTag(evt: KeyboardEvent) {
    if (evt.key === "Enter") {
      const select = evt.target as MdOutlinedTextField;
      if (select.value !== "" && !this.tags.find(tag => tag.name === select.value)) {
        this.tags.push({ name: select.value, selected: true });
        this.requestUpdate("tags");
        select.value = "";
      }
    }
  }

  private _saveNote() {
    const title = this.shadowRoot.querySelector<MdOutlinedTextField>("#note-title");
    const content = this.shadowRoot.querySelector<MdOutlinedTextField>("#note-content");

    if (!title || !content) {
      console.error("Title or content fields not found");
      return;
    }

    let noteId = this.note;
    if (noteId === "") {
      noteId = this._notes.addNote(title.value, content.value);
    }
    else {
      this._notes.editNote(noteId, title.value, content.value);
    }

    // tags
    const tags: string[] = [];
    const selectedTags = this.shadowRoot.querySelectorAll<MdFilterChip>("md-filter-chip");
    selectedTags.forEach(tag => {
      if (tag.selected) {
        tags.push(tag.label);
      }
    });

    const newTag = this.shadowRoot.querySelector<MdOutlinedTextField>("#new-tag");
    if (newTag.value !== "") {
      tags.push(newTag.value);
    }
    this._notes.setTags(noteId, tags);

    // go back
    history.back();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "note-edit-view": NoteEditView;
  }
}
