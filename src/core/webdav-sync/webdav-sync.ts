import { createClient, FileStat, WebDAVClient } from "webdav";
import { Note, NoteSchema } from "../note";
import { NotesCollection } from "../notes-collection";
import * as v from "valibot";

const WebDavSettingsSchema = v.object({
  url: v.string(),
  user: v.string(),
  password: v.string()
});

type WebDavSettings = v.InferInput<typeof WebDavSettingsSchema>;

export class WebDavSync {
  private _client?: WebDAVClient = null;
  settings: WebDavSettings;
  private readonly _storageKeySettings = "webdav-settings";
  private readonly _storageKeyLastSyncDate = "last-sync";

  constructor() {
    this.loadSettings();
  }

  setSettings(url: string, user: string, password: string) {
    this.settings = <WebDavSettings>{ url, user, password };
    localStorage.setItem(this._storageKeySettings, JSON.stringify(this.settings));
    this._client = createClient(this.settings.url, {
      username: this.settings.user,
      password: this.settings.password
    });
  }

  loadSettings() {
    const rawSettings = localStorage.getItem(this._storageKeySettings);
    if (!rawSettings) {
      return;
    }

    this.settings = v.parse(WebDavSettingsSchema, JSON.parse(rawSettings));
    this._client = createClient(this.settings.url, {
      username: this.settings.user,
      password: this.settings.password
    });
  }

  async syncNotes(notesCollection: NotesCollection) {
    if (!this._client) {
      return;
    }

    const lastSync = new Date(parseInt(localStorage.getItem(this._storageKeyLastSyncDate)));

    let currentLocalIndex = 0;
    const localNotes = Array.from(notesCollection.getNotes()).sort((a: Note, b: Note) => a.id.localeCompare(b.id));

    let currentRemoteIndex = 0;
    const remoteNotes = (await this._client.getDirectoryContents("/") as FileStat[]).sort((a: FileStat, b: FileStat) => a.basename.localeCompare(b.basename));


    while (currentLocalIndex < localNotes.length || currentRemoteIndex < remoteNotes.length) {
      const localNote = currentLocalIndex < localNotes.length ? localNotes[currentLocalIndex] : null;
      const remoteNote = currentRemoteIndex < remoteNotes.length ? remoteNotes[currentRemoteIndex] : null;

      if (localNote && !localNote.fileLastMod) {
        // new note that has not been syncronized
        log("new note that has not been syncronized", localNote);
        const response = await this._client.putFileContents(noteFileName(localNote.id), JSON.stringify(localNote));
        if (!response) {
          console.error("Failed to write sync status");
        }
        const stat = await this._client.stat(noteFileName(localNote.id)) as FileStat;
        notesCollection.setFileLastMod(localNote.id, new Date(stat.lastmod));
        currentLocalIndex++;
      } else if (localNote && remoteNote && noteFileName(localNote.id) === remoteNote.basename) {

        if (localNote.fileLastMod === new Date(remoteNote.lastmod).getTime() && localNote.lastMod < lastSync.getTime()) {
          log("note is in sync", localNote);
          // do nothing
        } else {
          if (localNote.fileLastMod < new Date(remoteNote.lastmod).getTime()) {
            // transfer remote to local
            const rawNote = await this._client.getFileContents(remoteNote.filename);
            const note = v.parse(NoteSchema, JSON.parse(new TextDecoder().decode(rawNote)));
            notesCollection.editNote(note.id, note.title, note.content);
            notesCollection.setTags(note.id, note.tags);
            log("remote note is newer", note);
          } else if (localNote.fileLastMod > new Date(remoteNote.lastmod).getTime() || localNote.lastMod > lastSync.getTime()) {
            // transfer local to remote
            const response = await this._client.putFileContents(noteFileName(localNote.id), JSON.stringify(localNote));
            if (!response) {
              console.error("Failed to write sync status");
            }
            log("local note is newer", localNote);
          }
          const stat = await this._client.stat(noteFileName(localNote.id)) as FileStat;
          notesCollection.setFileLastMod(localNote.id, new Date(stat.lastmod));
        }

        currentLocalIndex++;
        currentRemoteIndex++;
      } else if (localNote && (!remoteNote || noteFileName(localNote.id) < remoteNote.basename)) {
        if (localNote.lastMod < lastSync.getTime()) {
          // delete local
          notesCollection.deleteNote(localNote.id);
          log("delete local note", localNote);
        } else {
          // transfer local to remote
          const response = await this._client.putFileContents(noteFileName(localNote.id), JSON.stringify(localNote));
          if (!response) {
            console.error("Failed to write sync status");
          }
          const stat = await this._client.stat(noteFileName(localNote.id)) as FileStat;
          notesCollection.setFileLastMod(localNote.id, new Date(stat.lastmod));
          log("transfer local to remote", localNote);
        }
        currentLocalIndex++;
      } else if (remoteNote && (!localNote || noteFileName(localNote.id) > remoteNote.basename)) {
        if (new Date(remoteNote.lastmod) < lastSync) {
          // delete remote
          await this._client.deleteFile(remoteNote.filename);
          log("delete remote", null, remoteNote.filename);
        } else {
          // transfer remote to local
          const rawNote = await this._client.getFileContents(remoteNote.filename);
          const note = v.parse(NoteSchema, JSON.parse(new TextDecoder().decode(rawNote)));
          notesCollection.appendNote(note);
          log("transfer remote to local", note);
        }
        currentRemoteIndex++;
      }
    }

    localStorage.setItem(this._storageKeyLastSyncDate, Date.now().toString());
  }
};

function log(comment: string, note: Note | null, id: string = "") {
  if (note) {
    console.log(comment, note.id, note.title);
  }
  else {
    console.log(comment, id);
  }
}


function noteFileName(id: string): string {
  return id + '.json';
}