/** @jsxImportSource @emotion/react */
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  Button, IconButton, Autocomplete, TextField, Checkbox
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import DateSelector from 'components/DateSelector'
import ReferToggleButton from 'components/ReferToggleButton'
import { Fragment } from 'react'

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />
const checkedIcon = <CheckBoxIcon fontSize="small" />


const CompareFilter = ({
  open, setOpenModal, compareInputData, handleAddRow, handleRemoveRow,
  userList, filterOptions, handleSetData, handleGetCompareData
}) => {
  return (
    <Dialog maxWidth='md' fullWidth open={open}>
      <DialogTitle>比較條件</DialogTitle>
      <Divider />
      <DialogContent style={{ display: 'flex', flexDirection: 'column' }}>
        {compareInputData.map(({ dateRange, designerIds, displayReference }, i) => (
          <Fragment key={`filterRow-${i}`} >
          { i !== 0 && <Divider sx={{ my: 4 }} />}
            <h3 style={{ marginBottom: 6 }}>{i + 1}.</h3>
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
                    <p style={{ fontSize: 14 }} >業績依據：</p>
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
                        style={{ color: '#202D50', marginRight: 8 }}
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
              <IconButton onClick={handleRemoveRow}>
                <DeleteForeverIcon />
              </IconButton>
            </div>
          </Fragment>
        ))}

        {compareInputData.length <= 2 && (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: compareInputData.length ? 16 : 0}}>
            新增條件
            <IconButton onClick={handleAddRow}>
              <AddIcon />
            </IconButton>
          </div>
        )}
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button
          color='primary'
          variant='contained'
          onClick={() => setOpenModal(false)}
        >
          取消
        </Button>
        <Button
          color='primary'
          variant='contained'
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