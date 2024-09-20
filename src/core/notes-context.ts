import { createContext } from "@lit/context";
import { NotesCollection } from "./notes-collection";

export const notesContext = createContext<NotesCollection>(
    "NotesContext"
)