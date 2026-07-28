"use client";

// Fila offline para "Novo pedido" no painel — o sinal cai na rua, então o
// pedido nunca pode se perder. Grava em IndexedDB (nunca localStorage) e
// sincroniza sozinho quando a conexão volta.

const DB_NOME = "xnorte-painel";
const DB_VERSAO = 1;
const LOJA = "fila_pedidos";

export type PedidoEnfileirado<T> = {
  id: string;
  payload: T;
  criadoEm: string;
};

function abrirBanco(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NOME, DB_VERSAO);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(LOJA)) {
        db.createObjectStore(LOJA, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enfileirarPedido<T>(payload: T): Promise<string> {
  const db = await abrirBanco();
  const id = crypto.randomUUID();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(LOJA, "readwrite");
    tx.objectStore(LOJA).add({ id, payload, criadoEm: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  return id;
}

export async function listarFila<T>(): Promise<PedidoEnfileirado<T>[]> {
  const db = await abrirBanco();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(LOJA, "readonly");
    const req = tx.objectStore(LOJA).getAll();
    req.onsuccess = () => resolve(req.result as PedidoEnfileirado<T>[]);
    req.onerror = () => reject(req.error);
  });
}

async function removerDaFila(id: string): Promise<void> {
  const db = await abrirBanco();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(LOJA, "readwrite");
    tx.objectStore(LOJA).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Tenta gravar direto; se a rede falhar, cai para a fila offline. */
export async function salvarComFallbackOffline<T>(
  payload: T,
  enviar: (payload: T) => Promise<unknown>
): Promise<{ offline: boolean }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await enfileirarPedido(payload);
    return { offline: true };
  }
  try {
    await enviar(payload);
    return { offline: false };
  } catch {
    await enfileirarPedido(payload);
    return { offline: true };
  }
}

/** Esvazia a fila em ordem, parando no primeiro erro (provável rede ainda fora). */
export async function processarFila<T>(
  enviar: (payload: T) => Promise<unknown>
): Promise<{ enviados: number; restam: number }> {
  const fila = await listarFila<T>();
  let enviados = 0;
  for (const item of fila) {
    try {
      await enviar(item.payload);
      await removerDaFila(item.id);
      enviados++;
    } catch {
      break;
    }
  }
  const restante = await listarFila<T>();
  return { enviados, restam: restante.length };
}

export function aoVoltarOnline(callback: () => void): () => void {
  window.addEventListener("online", callback);
  return () => window.removeEventListener("online", callback);
}
