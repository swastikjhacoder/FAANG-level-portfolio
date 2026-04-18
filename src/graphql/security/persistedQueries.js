import crypto from "crypto";
import { GraphQLError } from "graphql";

const store = new Map();
const MAX_SIZE = 1000;

export const persistedQueryPlugin = () => ({
  onParams({ params, setParams }) {
    const hash = params.extensions?.persistedQuery?.sha256Hash;
    if (!hash) return;

    if (params.query) {
      const computedHash = crypto
        .createHash("sha256")
        .update(params.query)
        .digest("hex");

      if (computedHash !== hash) {
        throw new GraphQLError("Persisted query hash mismatch", {
          extensions: { code: "PERSISTED_QUERY_HASH_MISMATCH" },
        });
      }

      if (!store.has(hash)) {
        if (store.size >= MAX_SIZE) {
          const firstKey = store.keys().next().value;
          store.delete(firstKey);
        }
        store.set(hash, params.query);
      }
    } else {
      if (!store.has(hash)) {
        throw new GraphQLError("Persisted query not found", {
          extensions: { code: "PERSISTED_QUERY_NOT_FOUND" },
        });
      }

      setParams({
        ...params,
        query: store.get(hash),
      });
    }
  },
});

export const hashQuery = (query) =>
  crypto.createHash("sha256").update(query).digest("hex");
