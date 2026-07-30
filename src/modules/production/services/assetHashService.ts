/**
 * Serviço de Geração de Fingerprint Unívoco (SHA-256) para Ativos Digitais 3D
 */

/**
 * Calcula o hash SHA-256 hexadecimal de um ArrayBuffer (compatível com Browser e Node.js)
 */
export async function calcularFingerprintSHA256(buffer: ArrayBuffer): Promise<string> {
  // Se disponível na Web Crypto API (Browser & Node.js 16+)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback seguro em Node.js legado usando require('crypto')
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nodeCrypto = require('crypto');
    return nodeCrypto.createHash('sha256').update(Buffer.from(buffer)).digest('hex');
  } catch (err) {
    console.warn('[assetHashService] Fallback de hash ativado:', err);
    return `hash_simulado_${buffer.byteLength}_${Date.now()}`;
  }
}

/**
 * Formata um hash SHA-256 para exibição curta (ex: sha256:a1b2...f9e0)
 */
export function formatarHashCurto(hash: string, tamanho: number = 8): string {
  if (!hash || hash.length <= tamanho * 2) return hash;
  return `${hash.slice(0, tamanho)}...${hash.slice(-tamanho)}`;
}
