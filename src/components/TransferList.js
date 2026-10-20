import { Checkbox } from 'ui/checkbox'
import { List, ListItemButton, ListItemText, ListItemIcon } from '@mui/material'
import { Button } from 'ui/button'
import { KeyboardArrowRightRounded as KeyboardArrowRightRoundedIcon, RemoveRounded as RemoveRoundedIcon } from 'ui/icons'
import { useState } from 'react';
import { cloneDeep } from 'lodash';
import getLabel from 'utils/getTransferListLabel';

import SearchField from './SearchField';

const TransferList = ({
  optionData, optionIds, handleSetValue, keyword, idsKey,
  keyWordsOnChange, title, keywordKey
}) => {
  if (optionData === null) return null
  const [selectLeftIds, setSelectLeftIds] = useState([])
  const [selectRightIdx, setSelectRightIdx] = useState([])

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
              <List dense component="div" role="list">
                {optionData.map(value => {
                  return value.display && (
                    <ListItemButton
                      key={`left-${value.id}`}
                      role="listitem"
                      disableRipple
                      onClick={() => handleSelectId(value.id)}
                      sx={{ padding: '2px 16px !important' }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          tabIndex={-1}
                          disableRipple
                          sx={{ ":hover": { background: 'unset !important' } }}
                          checked={selectLeftIds.includes(value.id)}
                          inputProps={{
                            'aria-labelledby': value.id,
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={getLabel(value)}
                        id={value.id}
                        primaryTypographyProps={{
                          style: { fontSize: '16px', color: '#263238' }
                        }} />
                    </ListItemButton>
                  )
                })}
              </List>
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
              <List dense component="div" role="list" sx={{ height: !optionIds.length ? '100%' : 'unset' }}>
                {optionIds.length ? optionIds.map((id, i) => {
                  const findData = optionData.find(d => d.id === id)
                  if (!findData) {
                    console.log('optionIds: ', optionIds, title);
                  }
                  return (
                    <ListItemButton
                      key={`right-${id}-${i}`}
                      role="listitem"
                      disableRipple
                      onClick={() => handleSelectRemoveIdx(i)}
                      sx={{ padding: '2px 16px !important' }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          tabIndex={-1}
                          disableRipple
                          checked={selectRightIdx.includes(i)}
                          sx={{ ":hover": { background: 'unset !important' } }}
                          inputProps={{
                            'aria-labelledby': `left-${id}-${i}`,
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={findData ? getLabel(findData) : ''}
                        id={`left-${id}-${i}`}
                        primaryTypographyProps={{
                          style: { fontSize: '16px', color: '#263238' }
                        }} />
                    </ListItemButton>
                  );
                }) : <div className="h-full text-center text-heading text-text [align-content:center]">選取左方選項加入組合</div>}
              </List>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default TransferList