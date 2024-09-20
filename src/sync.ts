import { createClient, FileStat } from "webdav";
import { Note, NoteSchema } from "./core/note";
import { NotesCollection } from "./core/notes-collection";
import * as v from "valibot";

const client = createClient("http://localhost:8080/webdav/user/notes", {
  username: "user",
  password: "pass"
}
);

function log(comment: string, note: Note | null, id: string = "") {
  if (note) {
    console.log(comment, note.id, note.title);
  }
  else {
    console.log(comment, id);
  }
}

export async function syncNotes(notesCollection: NotesCollection) {
  const lastSync = new Date(parseInt(localStorage.getItem('last-sync')));

  let currentLocalIndex = 0;
  const localNotes = Array.from(notesCollection.getNotes()).sort((a: Note, b: Note) => a.id.localeCompare(b.id));

  let currentRemoteIndex = 0;
  const remoteNotes = (await client.getDirectoryContents("/") as FileStat[]).sort((a: FileStat, b: FileStat) => a.basename.localeCompare(b.basename));


  while (currentLocalIndex < localNotes.length || currentRemoteIndex < remoteNotes.length) {
    const localNote = currentLocalIndex < localNotes.length ? localNotes[currentLocalIndex] : null;
    const remoteNote = currentRemoteIndex < remoteNotes.length ? remoteNotes[currentRemoteIndex] : null;

    if (localNote && !localNote.fileLastMod) {
      // new note that has not been syncronized
      log("new note that has not been syncronized", localNote);
      const response = await client.putFileContents(noteFileName(localNote.id), JSON.stringify(localNote));
      if (!response) {
        console.error("Failed to write sync status");
      }
      const stat = await client.stat(noteFileName(localNote.id)) as FileStat;
      notesCollection.setFileLastMod(localNote.id, new Date(stat.lastmod));
      currentLocalIndex++;
    } else if (localNote && remoteNote && noteFileName(localNote.id) === remoteNote.basename) {

      if (localNote.fileLastMod === new Date(remoteNote.lastmod).getTime() && localNote.lastMod < lastSync.getTime()) {
        log("note is in sync", localNote);
        // do nothing
      } else {
        if (localNote.fileLastMod < new Date(remoteNote.lastmod).getTime()) {
          // transfer remote to local
          const rawNote = await client.getFileContents(remoteNote.filename);
          const note = v.parse(NoteSchema, JSON.parse(new TextDecoder().decode(rawNote)));
          notesCollection.editNote(note.id, note.title, note.content);
          notesCollection.setTags(note.id, note.tags);
          log("remote note is newer", note);
        } else if (localNote.fileLastMod > new Date(remoteNote.lastmod).getTime() || localNote.lastMod > lastSync.getTime()) {
          // transfer local to remote
          const response = await client.putFileContents(noteFileName(localNote.id), JSON.stringify(localNote));
          if (!response) {
            console.error("Failed to write sync status");
          }
          log("local note is newer", localNote);
        }
        const stat = await client.stat(noteFileName(localNote.id)) as FileStat;
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
        const response = await client.putFileContents(noteFileName(localNote.id), JSON.stringify(localNote));
        if (!response) {
          console.error("Failed to write sync status");
        }
        const stat = await client.stat(noteFileName(localNote.id)) as FileStat;
        notesCollection.setFileLastMod(localNote.id, new Date(stat.lastmod));
        log("transfer local to remote", localNote);
      }
      currentLocalIndex++;
    } else if (remoteNote && (!localNote || noteFileName(localNote.id) > remoteNote.basename)) {
      if (new Date(remoteNote.lastmod) < lastSync) {
        // delete remote
        await client.deleteFile(remoteNote.filename);
        log("delete remote", null, remoteNote.filename);
      } else {
        // transfer remote to local
        const rawNote = await client.getFileContents(remoteNote.filename);
        const note = v.parse(NoteSchema, JSON.parse(new TextDecoder().decode(rawNote)));
        notesCollection.appendNote(note);
        log("transfer remote to local", note);
      }
      currentRemoteIndex++;
    }
  }

  localStorage.setItem('last-sync', Date.now().toString());
}

function noteFileName(id: string): string {
  return id + '.json';
}