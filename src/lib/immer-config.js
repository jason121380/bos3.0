// immer 的全域設定（2026/10/21 自 7 升到 9：關掉 critical 的原型污染漏洞，並與 Redux Toolkit 共用同一份 immer）。
//
// immer 7 只在開發／測試凍結 produce 的結果，正式 build 不凍結；immer 8 起一律凍結。
// 全站 123 個檔案用 produce，正式環境若多出「凍結」這個新行為，任何在 produce 之後又直接修改結果的寫法都會拋
// 「Cannot assign to read only property」而讓頁面壞掉。這裡維持 immer 7 的行為：開發／測試照舊凍結（能抓到錯誤寫法），
// 正式環境不凍結（不會因為升版多出新的拋錯路徑）。副作用：Redux 狀態在正式環境也不再凍結（只是少一層保護，不影響 reducer）。
import { setAutoFreeze } from 'immer'

// 依環境決定是否凍結：與 immer 7 的預設（__DEV__ ? true : false）相同
export function immerAutoFreezeFor(nodeEnv) {
  return nodeEnv !== 'production'
}

setAutoFreeze(immerAutoFreezeFor(process.env.NODE_ENV))
