// admin.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  authDomain: "reliquiasdoxis.firebaseapp.com",
  projectId: "reliquiasdoxis",
  storageBucket: "reliquiasdoxis.appspot.com",
  messagingSenderId: "673027539850",
  appId: "1:673027539850:web:c8c5fa9e5dbff158cf92ed"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const publicarBtn = document.getElementById("publicar");
const resenhaInput = document.getElementById("resenha");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "index.html";
    return;
  }

  publicarBtn.addEventListener("click", async () => {
    const conteudo = resenhaInput.value.trim();
    if (!conteudo) {
      alert("Digite algo antes de publicar.");
      return;
    }

    try {
      await addDoc(collection(db, "resenhas"), {
        html: conteudo,
        autor: user.email,
        criadoEm: serverTimestamp()
      });
      alert("Resenha publicada com sucesso!");
      resenhaInput.value = "";
    } catch (error) {
      console.error("Erro ao salvar resenha:", error);
      alert("Erro ao publicar. Veja o console.");
    }
  });
});
