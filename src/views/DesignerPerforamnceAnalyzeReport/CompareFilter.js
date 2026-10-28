import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogBody, DialogFooter } from 'ui/dialog'
import { Checkbox } from 'ui/checkbox'
import { TextField } from 'ui/text-field'
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
    <Dialog open={open}>
      {/* 保留原比較條件視窗 900px 寬度。 */}
      <DialogContent size="lg" className="max-w-[900px]" hideClose aria-describedby={undefined}>
        <DialogHeader><DialogTitle>比較條件</DialogTitle></DialogHeader>
        <div className="h-px bg-border" />
        <DialogBody className="ui-root" style={{ display: 'flex', flexDirection: 'column' }}>
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
                <Button variant="ghost" size="icon" aria-label="刪除條件" title="刪除條件" className="text-text-secondary hover:text-danger" onClick={() => handleRemoveRow(i)}>
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
        </DialogBody>
        <div className="h-px bg-border" />
        <DialogFooter className="ui-root">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CompareFilter
