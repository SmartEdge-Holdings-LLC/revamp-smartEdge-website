import { PersistedClient, Persister } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const localStoragePersister: Persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : null as any,
});

export { localStoragePersister };
