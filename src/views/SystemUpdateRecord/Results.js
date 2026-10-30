// 每筆紀錄的展開區改用 ui/accordion（受控 expanded＋標題 onClick，與原用法相同；收合時內容保持掛載）。
// ui-root 的基礎重置以 :where() 零權重撰寫，Markdown 預覽（md-editor-rt .default-theme）的清單編號、邊距規則權重較高，照常生效。
// 外觀比照 Grok 式卡片（surface 底、16px 圓角、無框），與相容層原外觀一致
import { Accordion, AccordionDetails, AccordionSummary } from 'ui/accordion'
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import MdEditor from 'md-editor-rt'
import 'md-editor-rt/lib/style.css'

const Results = ({ data }) => {
  const [open, setOpen] = useState(0)
  const [theme, setTheme] = useState('')
  // 等 data-color-mode 出現後讀一次主題。原本 setInterval 寫在 render 本體：每次 render 多一個計時器、卸載後仍會 setState
  useEffect(() => {
    const getTheme = setInterval(() => {
      const mode = document.documentElement.getAttribute('data-color-mode')
      if (mode !== null) {
        setTheme(mode)
        clearInterval(getTheme)
      }
    }, 500)
    return () => clearInterval(getTheme)
  }, [])

  MdEditor.config({
    markedRenderer(renderer) {
      renderer.link = (href, title, text) => {
        return `<a href="${href}" title="${title}" target="_blank">${text}</a>`
      }
      return renderer
    },
  })

  return (
    <div className="flex flex-col gap-3">
      {data.length > 0 &&
        data.map((d, index) => {
          return (
            <Accordion key={index} expanded={index === open} className="overflow-hidden rounded-2xl border-0 bg-surface">
              <AccordionSummary
                className="rounded-none px-4 hover:bg-surface-hover"
                expandIcon={<ChevronDown className="h-4 w-4" strokeWidth={1.75} />}
                onClick={() => {
                  index === open ? setOpen(-1) : setOpen(index)
                }}
              >
                <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 pr-2">
                  <h2 className="m-0 min-w-0 max-w-full text-heading text-text">{d.title}</h2>
                  <div className="flex w-full max-w-full flex-wrap items-center gap-x-3 gap-y-0.5 sm:w-auto sm:justify-end">
                    <span className="whitespace-nowrap text-caption tabular-nums text-text-secondary">
                      更新日期:{format(d.updateTime, 'yyyy/MM/dd')}
                    </span>
                    <div className="whitespace-nowrap text-label tabular-nums text-text-secondary">版本:{d.versionNo}</div>
                  </div>
                </div>
              </AccordionSummary>
              <AccordionDetails className="flex flex-col overflow-x-auto">
                <MdEditor theme={theme} modelValue={d.content} previewOnly language="en-US" />
                <div className="ui-root flex w-full items-center justify-end gap-1 pt-3 text-caption text-text-secondary">
                  <div className="mr-2 tabular-nums">更新日期:{format(d.updateTime, 'yyyy/MM/dd')}</div>
                </div>
              </AccordionDetails>
            </Accordion>
          )
        })}
    </div>
  )
}

export default Results
