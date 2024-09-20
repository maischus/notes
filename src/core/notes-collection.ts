import { Note } from "./note";
import { v4 } from "uuid";

class NotesCollection {
  private notes: Note[];
  private version = "1.0.0";

  public constructor() {
    this.notes = [];
    this.load();
  }

  public addNote(title: string, content: string): string {
    const id = v4();
    const note: Note = {
      id,
      title: title,
      content: content,
      tags: [],
      lastMod: Date.now(),
      fileLastMod: null
    };

    this.notes.push(note);
    this.save();

    return id;
  }

  public appendNote(note: Note) {
    this.notes.push(note);
    this.save();
  }

  public editNote(id: string, title: string, content: string): void {
    const note = this.notes.find((note) => note.id === id);

    if (!note) {
      throw new Error("Note not found.");
    }

    note.title = title;
    note.content = content;
    note.lastMod = Date.now();
    this.save();
  }

  public deleteNote(id: string) {
    for (let i = 0; i < this.notes.length; i++) {
      if (this.notes[i].id === id) {
        this.notes.splice(i, 1);
        i--;
        this.save();
      }
    }
  }

  public setFileLastMod(noteId: string, date: Date) {
    const note = this.notes.find((note) => note.id === noteId);

    if (!note) {
      return;
    }

    note.fileLastMod = date.getTime();
    this.save();
  }

  public setTags(noteId: string, tags: string[]) {
    const note = this.notes.find((note) => note.id === noteId);

    if (!note) {
      return;
    }

    note.tags = tags;
    note.lastMod = Date.now();
    this.save();
  }

  public getTags(): string[] {
    const tags: string[] = [];
    this.notes.forEach((note) => {
      tags.push(...note.tags);
    });

    const uniqueTag = [...new Set(tags)];

    return uniqueTag.sort((a, b) => {
      const tagAName = a.toUpperCase(); // ignore upper and lowercase
      const tagBName = b.toUpperCase(); // ignore upper and lowercase
      if (tagAName < tagBName) {
        return -1;
      }

      if (tagAName > tagBName) {
        return 1;
      }

      return 0;
    });
  }

  public getNote(id: string) {
    return this.notes.find((note) => note.id === id);
  }

  public getNotes(): Note[] {
    return this.notes.sort((a, b) => {
      const noteATitle = a.title.toUpperCase(); // ignore upper and lowercase
      const noteBTitle = b.title.toUpperCase(); // ignore upper and lowercase
      if (noteATitle < noteBTitle) {
        return -1;
      }

      if (noteATitle > noteBTitle) {
        return 1;
      }

      return 0;
    });
  }

  public getNotesByTag(tagId: string): Note[] {
    return this.notes.filter((note) => note.tags.includes(tagId));
  }

  public getUntaggedNotes(): Note[] {
    return this.notes.filter((note) => note.tags.length == 0);
  }

  public export(): string {
    return JSON.stringify(this);
  }

  public import(content: string) {
    console.log(JSON.parse(content));
  }

  private save() {
    localStorage.setItem('notes', JSON.stringify({ version: this.version, notes: this.notes }));

    //syncNotes(this.notes);
  }

  private load() {
    const notes = JSON.parse(localStorage.getItem('notes'));
    if (notes == null) {
      return;
    }
    this.notes = notes.notes;
  }
}

export { NotesCollection };
