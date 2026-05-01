// ============================================================
// Firebase 설정 파일
// ============================================================
//
// ⚠️ 사용 전 반드시 해야 할 일:
// 아래 firebaseConfig 의 값들을 사장님 Firebase 콘솔에서 가져온
// 실제 값으로 교체하세요.
//
// 가져오는 곳:
// Firebase 콘솔 → 좌측 ⚙️ 설정 → "프로젝트 설정"
// → "내 앱" 섹션 → 웹 앱 → "구성" 라디오 선택
// → 거기 보이는 firebaseConfig 객체를 그대로 아래에 붙여넣기
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ↓↓↓ 여기 값들을 Firebase 콘솔의 실제 값으로 교체 ↓↓↓
const firebaseConfig = {
  apiKey: "AIzaSyDpPVYqfvxZ1wwCeo212kBDxQVsVrw1K8A",
  authDomain: "livecafe-6ec04.firebaseapp.com",
  projectId: "livecafe-6ec04",
  storageBucket: "livecafe-6ec04.firebasestorage.app",
  messagingSenderId: "770184325430",
  appId: "1:770184325430:web:5fc8b983062f0ac0a1eb97"
};
// ↑↑↑ 여기까지 ↑↑↑

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
