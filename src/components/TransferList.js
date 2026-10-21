import { Checkbox } from 'ui/checkbox'
import { Button } from 'ui/button'
import { cn, focusRing } from 'ui/utils'
import { KeyboardArrowRightRounded as KeyboardArrowRightRoundedIcon, RemoveRounded as RemoveRoundedIcon } from 'ui/icons'
import { useState } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import getLabel from 'utils/getTransferListLabel';

import SearchField from './SearchField';

// 清單列（原 ListItemButton dense：上下 2px、左右 16px，hover surface-hover）；整列為原生按鈕，可 Tab 聚焦、Enter／空白鍵觸發
const rowClass = cn(
  'flex w-full min-w-0 cursor-pointer items-center border-0 bg-transparent px-4 py-0.5 text-left transition-colors hover:bg-surface-hover',
  focusRing
)
// 原 ListItemText：primary 16px 主文字色、上下 4px
const RowText = ({ primary, id }) => (
  <span id={id} className="my-1 min-w-0 flex-1 text-body text-text">
    {primary}
  </span>
)

const TransferList = ({
  optionData, optionIds, handleSetValue, keyword, idsKey,
  keyWordsOnChange, title, keywordKey
}) => {
  // hooks 放在 return 之前（rules-of-hooks）。原寫法因 return 前沒有任何 hook，React 17 恰好不會報錯，
  // 但只要日後在 return 前加一個 hook 就會在資料切換時拋錯
  const [selectLeftIds, setSelectLeftIds] = useState([])
  const [selectRightIdx, setSelectRightIdx] = useState([])
  if (optionData === null) return null

  const handleSelectId = id => {
    const cloneData = cloneDeep(selectLeftIds)
    const idx = cloneData.indexOf(id)
    idx === -1 ? cloneData.push(id) : cloneData.splice(idx, 1)
    setSelectLeftIds(cloneData)
  }

  const handleSelectRemoveIdx = i => {
    const cloneData = cloneDeep(selectRightIdx)
    const idx = cloneData.indexOf(i)
    idx === -1 ? cloneData.push(i) : cloneData.splice(idx, 1)
    setSelectRightIdx(cloneData)
  }

  const addIds = () => {
    const ids = [...optionIds, ...selectLeftIds]
    handleSetValue(ids, idsKey)
    setSelectLeftIds([])
  }

  const removeIds = () => {
    const cloneServiceIds = cloneDeep(optionIds)
    const filtId = cloneServiceIds.filter((d, i) => !selectRightIdx.includes(i))
    handleSetValue(filtId, idsKey)
    setSelectRightIdx([])
  }
  return (
    <>
      <h5 className="m-0 text-heading text-text">{title}</h5>
      {/* 版面：搜尋列在上；900px（MUI md）以上為「左清單｜按鈕直排｜右清單」，以下改為上下堆疊、按鈕橫排 */}
      <div className="flex flex-col gap-2">
        <div>
          <SearchField value={keyword} onChange={value => keyWordsOnChange(value, keywordKey)} />
        </div>
        <div className="flex flex-col gap-4 min-[900px]:flex-row">
          <div className="min-w-0 min-[900px]:flex-1">
            <div className="h-[350px] overflow-auto rounded-md bg-background">
              <div role="list" className="py-2">
                {optionData.map(value => {
                  return value.display && (
                    <div key={`left-${value.id}`} role="listitem">
                      <button type="button" onClick={() => handleSelectId(value.id)} className={rowClass}>
                      <span className="inline-flex min-w-[56px] shrink-0">
                        <Checkbox
                          tabIndex={-1}
                          disableRipple
                          sx={{ ":hover": { background: 'unset !important' } }}
                          checked={selectLeftIds.includes(value.id)}
                          inputProps={{
                            'aria-labelledby': value.id,
                          }}
                        />
                      </span>
                      <RowText
                        primary={getLabel(value)}
                        id={value.id}
                      />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 min-[900px]:w-[8.333333%] min-[900px]:flex-col">
            <Button
              variant="secondary" size="icon" aria-label="加入選取項目" title="加入選取項目"
              onClick={addIds}
              disabled={selectLeftIds.length === 0}
            ><KeyboardArrowRightRoundedIcon /></Button>
            <Button
              variant="secondary" size="icon" aria-label="移除選取項目" title="移除選取項目"
              onClick={removeIds}
              disabled={selectRightIdx.length === 0}
            ><RemoveRoundedIcon /></Button>

          </div>
          <div className="w-full min-w-0 min-[900px]:flex-1">
            <div className="h-[350px] overflow-auto rounded-md bg-background">
              <div role="list" className="py-2" style={{ height: !optionIds.length ? '100%' : 'unset' }}>
                {optionIds.length ? optionIds.map((id, i) => {
                  const findData = optionData.find(d => d.id === id)
                  return (
                    <div key={`right-${id}-${i}`} role="listitem">
                      <button type="button" onClick={() => handleSelectRemoveIdx(i)} className={rowClass}>
                      <span className="inline-flex min-w-[56px] shrink-0">
                        <Checkbox
                          tabIndex={-1}
                          disableRipple
                          checked={selectRightIdx.includes(i)}
                          sx={{ ":hover": { background: 'unset !important' } }}
                          inputProps={{
                            'aria-labelledby': `left-${id}-${i}`,
                          }}
                        />
                      </span>
                      <RowText
                        primary={findData ? getLabel(findData) : ''}
                        id={`left-${id}-${i}`}
                      />
                      </button>
                    </div>
                  );
                }) : <div className="h-full text-center text-heading text-text [align-content:center]">選取左方選項加入組合</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default TransferList