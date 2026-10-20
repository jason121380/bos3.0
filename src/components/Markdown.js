import Prism from 'prismjs'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

// 原 emotion styles.root（theme.typography h1～h6／subtitle1，spacing 單位 8px）逐值轉 Tailwind 任意變體；
// 字型由 main.scss 的 `* { font-family … !important }` 決定，故不另寫 fontFamily
const rootClassName = [
  '[&_h1]:text-[34px] [&_h1]:font-bold [&_h1]:leading-[41px] [&_h1]:tracking-[0.37px] [&_h1]:text-[#000000] [&_h1]:mb-[8px]',
  '[&_h2]:text-[24px] [&_h2]:font-bold [&_h2]:leading-[30px] [&_h2]:tracking-[0.35px] [&_h2]:text-[#000000] [&_h2]:mb-[8px]',
  '[&_h3]:text-[20px] [&_h3]:font-bold [&_h3]:leading-[26px] [&_h3]:tracking-[0.38px] [&_h3]:text-[#000000] [&_h3]:mb-[8px]',
  '[&_h4]:text-[18px] [&_h4]:font-semibold [&_h4]:leading-[24px] [&_h4]:tracking-[-0.24px] [&_h4]:text-[#000000] [&_h4]:mb-[8px]',
  '[&_h5]:text-[16px] [&_h5]:font-semibold [&_h5]:leading-[22px] [&_h5]:tracking-[-0.41px] [&_h5]:text-[#000000] [&_h5]:mb-[8px]',
  '[&_h6]:text-[14px] [&_h6]:font-semibold [&_h6]:leading-[20px] [&_h6]:tracking-[-0.24px] [&_h6]:text-[#000000] [&_h6]:mb-[8px]',
  '[&_p]:text-[15px] [&_p]:font-medium [&_p]:leading-[20px] [&_p]:tracking-[-0.24px] [&_p]:text-[#000000] [&_p]:mb-[16px]',
  '[&_ul]:ml-[24px] [&_ul]:mb-[16px] [&_ol]:ml-[24px] [&_ol]:mb-[16px]',
  '[&_li]:text-[15px] [&_li]:font-medium [&_li]:leading-[20px] [&_li]:tracking-[-0.24px] [&_li]:text-[#000000] [&_li]:mb-[8px]',
  '[&_hr]:mt-[24px] [&_hr]:mb-[24px] [&_hr]:bg-[rgb(var(--border))] [&_hr]:border-0 [&_hr]:h-[1px]',
  '[&_a]:text-[#007AFF] [&_a:hover]:underline',
].join(' ')

function Markdown({ className = '', ...rest }) {
  useEffect(() => {
    Prism.highlightAll()
  }, [])

  return (
    <div className={className ? `${rootClassName} ${className}` : rootClassName}>
      <ReactMarkdown {...rest} />
    </div>
  )
}

Markdown.propTypes = {
  className: PropTypes.string,
}

export default Markdown
