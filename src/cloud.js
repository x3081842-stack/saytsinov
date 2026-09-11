import CONFIG from "./config";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

let db = null;
let fireMethods = null;

async function initDb() {
  if (db || !CONFIG.firebaseEnabled) return;
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("YOUR_")) return;
  try {
    const appModule = await import("firebase/app");
    const firestore = await import("firebase/firestore");
    const app = appModule.initializeApp(firebaseConfig);
    db = firestore.getFirestore(app);
    fireMethods = {
      doc: firestore.doc,
      setDoc: firestore.setDoc,
      getDoc: firestore.getDoc,
      getDocs: firestore.getDocs,
      collection: firestore.collection,
      serverTimestamp: firestore.serverTimestamp,
    };
  } catch (e) {
    db = null;
    fireMethods = null;
  }
}

function sessionId() {
  const key = "love-session-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem("love-secret") || "{}");
  } catch {
    return {};
  }
}

function writeLocal(data) {
  const next = { ...readLocal(), ...data, updatedAt: Date.now() };
  localStorage.setItem("love-secret", JSON.stringify(next));
  return next;
}

async function notifyTelegram(text) {
  const { token, chatId } = CONFIG.telegram;
  if (!token || !chatId) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  }).catch(() => {});
}

export async function saveSecret(partial, telegramText) {
  const id = sessionId();
  const data = writeLocal({ id, ...partial });

  await initDb();
  if (db && fireMethods) {
    await fireMethods
      .setDoc(
        fireMethods.doc(db, "love_responses", id),
        { ...data, updatedAt: fireMethods.serverTimestamp() },
        { merge: true }
      )
      .catch(() => {});
  }

  if (telegramText) {
    await notifyTelegram(telegramText);
  }

  return data;
}

export async function saveNoAttempt(count) {
  return saveSecret(
    { noAttempts: count },
    `⚠️ <b>Yo‘q</b> tugmasiga urindi.\nJami urinish: <b>${count}</b>`
  );
}

export async function fetchAllSecrets() {
  const local = readLocal();
  const list = local.id ? [local] : [];

  await initDb();
  if (!db || !fireMethods) return list;

  const snap = await fireMethods.getDocs(fireMethods.collection(db, "love_responses"));
  const remote = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return remote.length ? remote : list;
}

export async function fetchOne() {
  const id = sessionId();
  await initDb();
  if (db && fireMethods) {
    const snap = await fireMethods.getDoc(fireMethods.doc(db, "love_responses", id));
    if (snap.exists()) return snap.data();
  }
  return readLocal();
}

export { sessionId };