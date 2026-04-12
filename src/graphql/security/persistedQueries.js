import crypto from "crypto";

const store = new Map();

export const persistedQueryPlugin = () => ({
  async requestDidStart() {
    return {
      async didResolveOperation({ request }) {
        const hash = request.extensions?.persistedQuery?.sha256Hash;

        if (!hash) return;

        if (!store.has(hash)) {
          if (!request.query) {
            throw new Error("Persisted query not found");
          }

          store.set(hash, request.query);
        } else {
          request.query = store.get(hash);
        }
      },
    };
  },
});

export const hashQuery = (query) =>
  crypto.createHash("sha256").update(query).digest("hex");
