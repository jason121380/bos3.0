import { Checkbox } from 'ui/checkbox'
import { List, ListItemButton, ListItemText, ListItemIcon } from '@mui/material'
import { Button } from 'ui/button'
import Grid from '@mui/material/Unstable_Grid2';
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
      <Grid container direction='column' spacing={1} >
        <Grid sx={{ pt: '0px !important', mb: 1 }} >
          <SearchField value={keyword} onChange={value => keyWordsOnChange(value, keywordKey)} />
        </Grid>
        <Grid
          container
          spacing={2}
          rowGap
          sx={{ mt: '0px !important' }}
        >
          <Grid sm={12} md sx={{ pt: '0px !important' }} >
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
          </Grid>
          <Grid
            sm={12}
            md={1}
            container
            justifyContent='center'
            alignItems='center'
            sx={{
              gap: 2,
              pt: '0px !important',
              flexDirection: {
                md: 'column',
                sm: 'row',
              },
            }}
          >
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

          </Grid>
          <Grid sm={12} md width='100%' sx={{ pt: '0px !important' }} >
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
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default TransferList