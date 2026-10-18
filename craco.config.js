// React 17 的 package.json 沒有 exports 欄位，Radix 的 ESM 檔（.mjs）import 'react/jsx-runtime' 時，
// webpack 5 要求完整副檔名而無法解析。只對 node_modules 內的 .mjs 放寬這項檢查，其餘沿用 react-scripts 預設。
// 升級 React 18 後可移除本檔與 craco。
module.exports = {
  webpack: {
    configure: config => {
      config.module.rules.unshift({
        test: /\.mjs$/,
        include: /node_modules/,
        resolve: { fullySpecified: false },
      })
      return config
    },
  },
}
