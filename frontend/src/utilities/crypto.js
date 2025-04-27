// Common parameters for RSA-OAEP with SHA-256
const OAEP_PARAMS = { name: 'RSA-OAEP', hash: { name: 'SHA-256' } };

// 1) Генерація пари ключів RSA-OAEP
export async function generateKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: { name: 'SHA-256' }
      },
      true,
      ['encrypt', 'decrypt']
    );
    const publicKeyJwk  = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
    const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
    return { publicKeyJwk, privateKeyJwk };
  }
  
  // 2) Випадкова соль + IV
  export function randomBase64(bytes = 16) {
    const arr = new Uint8Array(bytes);
    crypto.getRandomValues(arr);
    return btoa(String.fromCharCode(...arr));
  }
  
  // 3) Виведення симетричного ключа з пароля + солі (PBKDF2 → AES-GCM)
  export async function deriveSymKey(password, saltB64) {
    const enc = new TextEncoder();
    const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    const baseKey = await crypto.subtle.importKey(
      'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 150_000, hash: 'SHA-256' },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt','decrypt']
    );
  }
  
  // 4) Шифрування приватного ключа JWK
  export async function encryptPrivateKey(privateKeyJwk, symKey, ivB64) {
    const enc = new TextEncoder();
    const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
    const data = enc.encode(JSON.stringify(privateKeyJwk));
    const ct = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, symKey, data);
    return btoa(String.fromCharCode(...new Uint8Array(ct)));
  }
  
  // 5) Розшифрування приватного ключа
  export async function decryptPrivateKey(ctB64, symKey, ivB64) {
    const iv  = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
    const ct  = Uint8Array.from(atob(ctB64), c => c.charCodeAt(0));
    const pt  = await crypto.subtle.decrypt({ name:'AES-GCM', iv }, symKey, ct);
    const dec = new TextDecoder();
    return JSON.parse(dec.decode(pt));  // це JWK приватного ключа
  }
  
  // common RSA-OAEP algorithm
  const RSA_OAEP_ALGO = { name: 'RSA-OAEP', hash: { name: 'SHA-256' } };
  
  // 6) Шифрування повідомлення RSA
  export async function encryptMessageRSA(pubKeyJwk, message) {
    // import public key with OAEP/SHA-256
    const pubKey = await crypto.subtle.importKey(
      'jwk', pubKeyJwk,
      RSA_OAEP_ALGO,
      false,
      ['encrypt']
    );
    const data = new TextEncoder().encode(message);
    const ct = await crypto.subtle.encrypt(
      RSA_OAEP_ALGO,
      pubKey,
      data
    );
    return btoa(String.fromCharCode(...new Uint8Array(ct)));
  }
  
  // 7) Розшифрування RSA-повідомлення
  export async function decryptMessageRSA(privKeyJwk, ctB64) {
    // import private key with OAEP/SHA-256
    const privKey = await crypto.subtle.importKey(
      'jwk', privKeyJwk,
      RSA_OAEP_ALGO,
      false,
      ['decrypt']
    );
    const cipher = Uint8Array.from(atob(ctB64), c => c.charCodeAt(0));
    const pt = await crypto.subtle.decrypt(
      RSA_OAEP_ALGO,
      privKey,
      cipher
    );
    return new TextDecoder().decode(pt);
  }

// Helper to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
function base64ToArrayBuffer(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  Array.prototype.forEach.call(binary, (ch, i) => bytes[i] = ch.charCodeAt(0));
  return bytes.buffer;
}

// AES-GCM encrypt a UTF-8 string, returns { ct: base64, iv: base64 }
export async function encryptMessageAES(message, symKey) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  // generate random 12-byte IV for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ctBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    symKey,
    data
  );
  return {
    ct: arrayBufferToBase64(ctBuffer),
    iv: arrayBufferToBase64(iv)
  };
}

// AES-GCM decrypt from base64 ciphertext + iv
export async function decryptMessageAES(ctB64, ivB64, symKey) {
  const ivBuf = base64ToArrayBuffer(ivB64);
  const ctBuf = base64ToArrayBuffer(ctB64);
  const ptBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(ivBuf) },
    symKey,
    ctBuf
  );
  const decoder = new TextDecoder();
  return decoder.decode(ptBuffer);
}

// Decrypt a base64 RSA-OAEP ciphertext using private JWK, returns ArrayBuffer (raw symmetric key)
export async function decryptRSA(privateKeyJwk, ctB64) {
  const privKey = await crypto.subtle.importKey(
    'jwk',
    privateKeyJwk,
    { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
    false,
    ['decrypt']
  );
  const cipher = Uint8Array.from(atob(ctB64), c => c.charCodeAt(0));
  const ptBuffer = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
    privKey,
    cipher
  );
  return ptBuffer;
}

// Import a raw symmetric key (ArrayBuffer) as CryptoKey for AES-GCM
export async function importSymKey(rawKey) {
  return crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}