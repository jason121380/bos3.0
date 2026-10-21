// v4 UUID（2026/10/21 取代 uuid 套件：原本用的是 uuid@3 的預設匯出 `uuid()`，等同 v4；
// 升到 uuid@14 要改成具名匯入且 npm audit 的 moderate 只影響 v3／v5／v6，與我們無關，乾脆不依賴套件）。
// 隨機來源用 crypto.getRandomValues（Safari 11／Chrome 11 起皆有）；單元測試環境由 setupTests 補 Node 的 webcrypto。
const HEX = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, '0'))

export default function uuid() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant 10xx
  const h = Array.from(bytes, b => HEX[b]).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}
