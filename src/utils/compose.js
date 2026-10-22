// compose([f, g, h], C) === f(g(h(C)))：由右到左逐層包裝（Jason 2026/10/22 fix all）。
// 原本的迴圈對第二個之後的 module 只呼叫 first(module) 並丟棄結果，實際只得到 first(C)。
export default function compose(modules, component) {
  return modules.reduceRight((wrapped, module) => module(wrapped), component)
}
