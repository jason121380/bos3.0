import PropTypes from 'prop-types'

// 頁面標題（STYLE.md §3 title）。舊版 subTitle 多為裝飾用的全大寫英文 overline，
// 依 STYLE.md「不使用全大寫英文標題」只顯示含中文的 subTitle（作為標題上方的說明）。
const hasCJK = text => typeof text === 'string' && /[一-鿿]/.test(text)

const PageTitle = ({ title, subTitle, className, style }) => {
  // 標題一律使用 text 色；保留呼叫端其他 style（如外距），忽略舊版指定的藍色
  const { color, ...restStyle } = style || {}
  return (
    <div className={`ui-root noprint flex min-w-0 flex-col gap-1${className ? ` ${className}` : ''}`} style={restStyle}>
      {hasCJK(subTitle) && <span className="text-caption text-text-tertiary">{subTitle}</span>}
      <h1 className="m-0 text-title !font-bold text-text">{title}</h1>
    </div>
  )
}

PageTitle.propTypes = {
  title: PropTypes.string,
  subTitle: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object
}

export default PageTitle
