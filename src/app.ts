import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { provide } from "@lit/context";
import { Router } from "@lit-labs/router";

import "@material/web/icon/icon.js";
import "@material/web/iconbutton/icon-button.js";
import '@material/web/labs/navigationbar/navigation-bar.js';
import "@material/web/labs/navigationdrawer/navigation-drawer-modal.js";
import '@material/web/labs/navigationtab/navigation-tab.js';

import { Provider } from "./mixins/dependency-injection";
import "./ui/notes/note-edit-view";
import "./ui/notes/note-list";
import "./ui/notes/note-view";
import "./ui/notes/tag-list";
import { AppRoute, routeConfig } from "./app-routing";
import { NotesCollection, notesContext } from "./core/notes-context";
import { WebDavSync, webdavSyncContext } from "./core/webdav-sync/webdav-sync-context";

// @ts-ignore: Property 'UrlPattern' does not exist
if (!globalThis.URLPattern) {
  /*await*/ import("urlpattern-polyfill");
}

@customElement("notes-app")
export class NotesApp extends Provider(LitElement) {
  static override styles = css`
    :host > header {
      z-index: 2;
    }

    :host > main {
      overflow: auto;
      padding: 15px 15px 10px 15px;
    }

    md-navigation-drawer-modal > div {
      box-shadow: 0 2px 5px 0 rgb(0 0 0 / 16%), 0 2px 10px 0 rgb(0 0 0 / 12%);
      margin-inline-end: 5px;
      height: 100vh;
    }

    header > div {
      display: flex;
      align-items: center;
    }
  `;

  @provide({ context: notesContext })
  notes = new NotesCollection();

  @provide({ context: webdavSyncContext })
  webdavSync = new WebDavSync();

  private _router = new Router(this, routeConfig);

  public constructor() {
    super();
    this.provideInstance("notes", this.notes);
  }

  public override connectedCallback(): void {
    super.connectedCallback();
  }

  override render() {
    return html`
      <header>
        <div>
          <md-icon-button @click="${this._toggleNavigation}"><md-icon>menu</md-icon></md-icon-button>
          <span>Notes</span>
        </div>
        <md-navigation-drawer-modal>
          <div>
            <a href="${AppRoute.Home}">Home</a>
            <note-tag-list></note-tag-list>
            <div>
              <a href="${AppRoute.WebdavSettings}">Settings</a>
            </div>
          </div>
        </md-navigation-drawer-modal>
      </header>

      <main>${this._router.outlet()}</main>
    `;
  }

  override firstUpdated() {
    const tagList = this.renderRoot.querySelector("note-tag-list");
    tagList.addEventListener("click", () => {
      this._toggleNavigation();
    });
  }

  private _toggleNavigation() {
    const navDrawer = this.renderRoot.querySelector("md-navigation-drawer-modal");
    if (!navDrawer) {
      return;
    }

    if (!navDrawer.opened) {
      const tagList = this.renderRoot.querySelector("note-tag-list");
    }

    navDrawer.opened = !navDrawer.opened;
  }

  private _goto(evt: Event) {
    const el = evt.target as HTMLElement;
    if (el.dataset.href && el.dataset.href != "") {
      const a = document.createElement('a');
      a.href = el.dataset.href;
      this.shadowRoot.appendChild(a);
      a.click();
      a.remove();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "notes-app": NotesApp;
  }
}
