import { createContext } from "@lit/context";
import { WebDavSync } from "./webdav-sync";
export { WebDavSync } from "./webdav-sync";

export const webdavSyncContext = createContext<WebDavSync>("WebdavSyncContext");