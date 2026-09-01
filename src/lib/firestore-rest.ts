/**
 * Firestore REST API Client
 * Provides 100% serverless cloud persistence directly over HTTPS with zero dependency on local files
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "saas-64015";
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB7nnrGVSUxVTmKw4t6qXrBVxAGbxarVvE";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function toFirestoreFields(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof value === "string") {
      fields[key] = { stringValue: value };
    } else if (typeof value === "number") {
      fields[key] = Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    } else if (typeof value === "boolean") {
      fields[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map((item) =>
            typeof item === "string" ? { stringValue: item } : { stringValue: JSON.stringify(item) }
          ),
        },
      };
    } else if (typeof value === "object") {
      fields[key] = { stringValue: JSON.stringify(value) };
    }
  }
  return fields;
}

function fromFirestoreDoc(doc: any): any {
  if (!doc || !doc.fields) return null;
  const result: Record<string, any> = {};
  const docPath = doc.name || "";
  result.id = docPath.split("/").pop() || "";

  for (const [key, valObj] of Object.entries<any>(doc.fields)) {
    if (valObj.stringValue !== undefined) {
      try {
        if ((valObj.stringValue.startsWith("{") && valObj.stringValue.endsWith("}")) || (valObj.stringValue.startsWith("[") && valObj.stringValue.endsWith("]"))) {
          result[key] = JSON.parse(valObj.stringValue);
        } else {
          result[key] = valObj.stringValue;
        }
      } catch {
        result[key] = valObj.stringValue;
      }
    } else if (valObj.integerValue !== undefined) {
      result[key] = parseInt(valObj.integerValue, 10);
    } else if (valObj.doubleValue !== undefined) {
      result[key] = valObj.doubleValue;
    } else if (valObj.booleanValue !== undefined) {
      result[key] = valObj.booleanValue;
    } else if (valObj.arrayValue?.values) {
      result[key] = valObj.arrayValue.values.map((v: any) => v.stringValue || Object.values(v)[0]);
    } else if (valObj.nullValue !== undefined) {
      result[key] = null;
    }
  }
  return result;
}

export const FirestoreREST = {
  async setDocument(collection: string, docId: string, data: Record<string, any>): Promise<any> {
    try {
      const url = `${BASE_URL}/${collection}/${encodeURIComponent(docId)}?key=${API_KEY}`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: toFirestoreFields(data) }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.warn(`Firestore REST setDocument [${collection}/${docId}] error:`, res.status, err);
        return null;
      }
      const json = await res.json();
      return fromFirestoreDoc(json);
    } catch (err) {
      console.warn(`Firestore REST setDocument [${collection}/${docId}] fetch failed:`, err);
      return null;
    }
  },

  async getDocument(collection: string, docId: string): Promise<any | null> {
    try {
      const url = `${BASE_URL}/${collection}/${encodeURIComponent(docId)}?key=${API_KEY}`;
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) return null;
      const json = await res.json();
      return fromFirestoreDoc(json);
    } catch {
      return null;
    }
  },

  async queryDocuments(collection: string, field: string, value: string): Promise<any[]> {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery?key=${API_KEY}`;
      const queryBody = {
        structuredQuery: {
          from: [{ collectionId: collection }],
          where: {
            fieldFilter: {
              field: { fieldPath: field },
              op: "EQUAL",
              value: { stringValue: value },
            },
          },
          limit: 10,
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queryBody),
      });

      if (!res.ok) return [];
      const json = await res.json();
      if (!Array.isArray(json)) return [];

      return json
        .filter((item) => item.document)
        .map((item) => fromFirestoreDoc(item.document));
    } catch {
      return [];
    }
  },

  async listDocuments(collection: string, limit = 50): Promise<any[]> {
    try {
      const url = `${BASE_URL}/${collection}?pageSize=${limit}&key=${API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const json = await res.json();
      if (!json.documents || !Array.isArray(json.documents)) return [];
      return json.documents.map(fromFirestoreDoc);
    } catch {
      return [];
    }
  },
};
