import { useState, useEffect } from 'react';
import { fetchWithAuth } from './api';
import { decryptRSA, importSymKey } from '../../../utilities/crypto';

/**
 * Hook to load and decrypt the symmetric AES-GCM key for a given chat.
 * Returns { symKey: CryptoKey, loading, error }
 */
export function useChatKey(chatId) {
  const [symKey, setSymKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chatId) return;
    let cancelled = false;

    async function loadKey() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWithAuth(`/api/chat/${chatId}/key/`);
        // data: { encrypted_key }
        const privJwk = JSON.parse(sessionStorage.getItem('privateKeyJwk'));
        // Decrypt RSA to ArrayBuffer of raw AES key
        const rawKey = await decryptRSA(privJwk, data.encrypted_key);
        // Import symmetric key
        const aesKey = await importSymKey(rawKey);
        if (!cancelled) setSymKey(aesKey);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadKey();
    return () => { cancelled = true };  
  }, [chatId]);

  return { symKey, loading, error };
} 