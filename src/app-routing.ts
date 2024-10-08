import { RouteConfig } from "@lit-labs/router";
import { html } from "lit";

import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";

import "./ui/webdav-settings";
import "./ui/app-settings";

export class AppRoute {
  static Home = "/";
  static AppSettings = "/settings";
  static WebdavSettings = "/settings/webdav";
  static NewNote = "/notes/new";
  static Tags = "/tags";
  static TagsAll = "/tags/all";
  static TagsUntagged = "/tags/untagged";
  static TagWithId = (id: string) => { return `/tags/${id}`; };
  static NoteWithId = (id: string) => { return `/notes/${id}`; };
  static EditNoteWithId = (id: string) => { return `/notes/${id}/edit`; };
}

export const routeConfig: RouteConfig[] = [
  { path: AppRoute.Home, render: () => html`<h1>My Notes</h1><md-filled-button href="${AppRoute.NewNote}">Create new note</md-filled-button> <md-outlined-button href="${AppRoute.Tags}">Show all tags</md-outlined-button>` },
  { path: AppRoute.AppSettings, render: () => html`<app-settings></app-setttings>` },
  { path: AppRoute.WebdavSettings, render: () => html`<webdav-settings></webdav-setttings>` },
  { path: AppRoute.Tags, render: () => html`<note-tag-list></note-tag-list>` },
  { path: AppRoute.TagsAll, render: () => html`<note-note-list></note-note-list>` },
  {
    path: AppRoute.TagsUntagged,
    render: () => html`<note-note-list tag="untagged"></note-note-list>`,
  },
  {
    path: AppRoute.TagWithId(":id"),
    render: ({ id }) => html`<note-note-list tag="${id}"></note-note-list>`,
  },
  {
    path: AppRoute.NewNote,
    render: () => html`<note-edit-view></note-edit-view>`,
  },
  {
    path: AppRoute.NoteWithId(":id"),
    render: ({ id }) => html`<note-view note="${id}"></note-view>`,
  },
  {
    path: AppRoute.EditNoteWithId(":id"),
    render: ({ id }) => html`<note-edit-view note="${id}"></note-edit-view>`,
  }
];