// Dialog 內含 MUI Autocomplete，依指南保留 MUI Dialog；內容區加 ui-root 以套用 ui 元件的基礎樣式
import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from 'ui/button'
import { CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon, CheckBox as CheckBoxIcon } from 'ui/icons'
import DateSelector from 'components/DateSelector'
import ReferToggleButton from 'components/ReferToggleButton'
import { Fragment } from 'react'
import { Autocomplete } from 'ui/combobox'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />


const CompareFilter = ({
  open, setOpenModal, compareInputData, handleAddRow, handleRemoveRow,
  userList, filterOptions, handleSetData, handleGetCompareData
}) => {
  return (
    <Dialog maxWidth='md' fullWidth open={open}>
      <DialogTitle>比較條件</DialogTitle>
      <div className="h-px bg-border" />
      <DialogContent className="ui-root" style={{ display: 'flex', flexDirection: 'column' }}>
        {compareInputData.map(({ dateRange, designerIds, displayReference }, i) => (
          <Fragment key={`filterRow-${i}`} >
          { i !== 0 && <div className="my-8 h-px bg-border" />}
            <h3 className="mb-1.5 text-heading text-text">{i + 1}.</h3>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center'  }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flexGrow: 1 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <DateSelector
                    getQueryData={false}
                    date={dateRange}
                    dateChange={value => handleSetData('dateRange', i ,value)}
                    attributes={['thismonth', 'lastmonth', 'dbyesterday', 'yesterday', 'today', 'startDate', 'endDate']}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <p className="text-body text-text-secondary">業績依據：</p>
                    <ReferToggleButton
                      value={displayReference}
                      onChange={value => value && handleSetData('displayReference', i ,value)}
                    />
                  </div>
                </div>
                <Autocomplete
                  multiple
                  autoHighlight
                  fullWidth
                  options={userList}
                  disableCloseOnSelect
                  value={userList.filter(({ userId }) => designerIds.includes(userId))}
                  isOptionEqualToValue={(option, value) => option.userId === value.userId}
                  onChange={(e, value) => {
                    const ids = value.map(d => d.userId)
                    handleSetData('designerIds', i ,ids)
                  }}
                  getOptionLabel={option => {
                    return option.userNickName !== null && option.userNickName.trim() ? option.userNickName : option.userName
                  }}
                  filterOptions={filterOptions}
                  renderOption={({ key, ...props }, option, {selected}) => (
                    <li key={option.userId} {...props}>
                      <Checkbox
                        style={{ color: 'rgb(var(--text))', marginRight: 8 }}
                        icon={icon}
                        checkedIcon={checkedIcon}
                        checked={selected}
                      />
                      {option.userNickName !== null && option.userNickName.trim() ? option.userNickName : option.userName}
                      {option.userNo !== null && option.userNo.trim() ? ` - ${option.userNo}` : ''}
                    </li>
                  )}
                  renderInput={params => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="設計師篩選"
                      placeholder="選擇設計師"
                    />
                  )}
                />
              </div>
              <Button variant="ghost" size="icon" aria-label="刪除條件" className="text-text-secondary hover:text-danger" onClick={handleRemoveRow}>
                <Trash2 strokeWidth={1.75} />
              </Button>
            </div>
          </Fragment>
        ))}

        {compareInputData.length <= 2 && (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: compareInputData.length ? 16 : 0}}>
            <Button variant="ghost" onClick={handleAddRow}>
              <Plus strokeWidth={1.75} />
              新增條件
            </Button>
          </div>
        )}
      </DialogContent>
      <div className="h-px bg-border" />
      <DialogActions className="ui-root">
        <Button
          variant='secondary'
          onClick={() => setOpenModal(false)}
        >
          取消
        </Button>
        <Button
          variant='primary'
          onClick={() => {
            setOpenModal(false)
            handleGetCompareData()
          }}
        >
          確定
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CompareFilter