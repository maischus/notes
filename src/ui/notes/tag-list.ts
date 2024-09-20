import "@material/web/divider/divider";
import "@material/web/list/list-item.js";
import "@material/web/list/list.js";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { AppRoute } from "../../app-routing";
import { consume } from "@lit/context";
import { NotesCollection } from "../../core/notes-collection";
import { notesContext } from "../../core/notes-context";

@customElement("note-tag-list")
export class TagList extends LitElement {

  @consume({ context: notesContext })
  private notes: NotesCollection;

  override render() {
    return html`
      <md-list>
        <md-list-item href="${AppRoute.TagsAll}">All</md-list-item>
        <md-divider></md-divider>
        ${this.notes.getTags().map((tag) => html`<md-list-item href="/tags/tag-${tag}">${tag}</md-list-item>`)}
        <md-divider></md-divider>
        <md-list-item href="${AppRoute.TagsUntagged}">Untagged</md-list-item>
      </md-list>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "note-tag-list": TagList;
  }
}
