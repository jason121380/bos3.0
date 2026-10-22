import { TextField } from 'ui/text-field'
import useFetchUsersOrderableList from 'hooks/useFetchGetUserOrderableList'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import React from 'react'
import { Autocomplete } from 'ui/combobox'

function DesignerBeenAssistedAutoComplete(
  {
    className,
    assistField,
    isAssist = false,
    onChange = () => {},
    inputOnChange = () => {},
    label = '',
    value,
    fieldProps,
    schedule,
    onKeyDown = () => {},
    onFocus,
    inputProps = {
      'data-testid': 'employee',
    },
    name,
  },
  ref
) {
  // 這個component只有用在互助明細表中篩選被互助的設計師

  const designerToggle = useToggle()
  const userOrderableList = useFetchUsersOrderableList()

  const [designerKeyword, setDesignerKeyword] = React.useState('')
  // const [inputDisplay, setInputDisplay] = React.useState('')
  // const [keyCode, setKeyCode] = React.useState(null)

  const selectedValue =
    idx(userOrderableList, _ => _.data.getUserOrderableList.find(d => d.userId === value)) || null

  const handleInputChange = event => {
    idx(event, _ => {
      setDesignerKeyword(_.target.value)
      inputOnChange(_.target.value)
    })
  }
  const options = idx(userOrderableList, _ => _.data.getUserOrderableList) || []
  const filteredOption = options.filter(
    d =>
      d.userNo !== '' &&
      d.userNo !== null &&
      d.userNo.toLowerCase() === designerKeyword.toLowerCase()
  )
  // 篩選比照 EmployeeAutoComplete：代號完全相同優先，再列暱稱、姓名包含的（不分大小寫、不重複），只打空白列出全部；
  // 最後補上代號包含關鍵字的（原本預設篩選打部分代號找得到，保留）。
  // 原本用預設篩選比對選項標籤，代號不含關鍵字時標籤是姓名，選單上顯示的暱稱打了找不到（Jason 2026/10/22 fix all）
  const filterOptions = (list, state) => {
    const keyWord = state.inputValue
    if (keyWord.trim() === '') return list
    const key = keyWord.toLowerCase()
    const text = value => (value || '').toLowerCase()
    const matched = [
      ...list.filter(d => text(d.userNo) !== '' && text(d.userNo) === key),
      ...list.filter(d => text(d.userNickName).includes(key)),
      ...list.filter(d => text(d.userName).includes(key)),
      ...list.filter(d => text(d.userNo).includes(key)),
    ]
    return matched.filter((d, index) => matched.indexOf(d) === index)
  }

  // const handleKeyDown = e => {
  //   if (e.keyCode === 13) {
  //     selectedValue = designers.find(d => d.designerNo === designerKeyword)
  // setKeyCode(e.keyCode)
  //   } else {
  //     setKeyCode(null)
  //   }
  // }

  // React.useEffect(() => {
  //   if (selectedValue === null) {
  //     setInputDisplay('')
  //     return
  //   } else {
  //     setInputDisplay(
  //       selectedValue.nickName !== null && selectedValue.nickName !== ''
  //         ? selectedValue.nickName
  //         : `${selectedValue.lastName}${selectedValue.firstName}`
  //     )
  //     onChange(selectedValue)
  //   }
  // }, [selectedValue])

  return (
    <Autocomplete
      freeSolo
      // onKeyDown={e => handleKeyDown(e)}
      open={designerToggle.open}
      onOpen={designerToggle.toggle}
      onClose={designerToggle.toggle}
      style={{ width: '180px' }}
      value={selectedValue}
      options={!userOrderableList.loading && filteredOption.length > 0 ? filteredOption : options}
      autoHighlight
      filterOptions={filterOptions}
      getOptionLabel={option =>
        (option.userNo !== null &&
          option.userNo !== '' &&
          option.userNo.toLowerCase().includes(designerKeyword.toLowerCase())) ||
        selectedValue !== null
          ? `${
              option.userNickName !== null && option.userNickName !== ''
                ? option.userNickName
                : option.userName
            }${option.userNo !== '' && option.userNo !== null ? `-${option.userNo}` : '(無代號)'}`
          : option.userName
      }
      loading={userOrderableList.loading}
      onChange={(_event, value) =>
        onChange(
          idx(
            value,
            _ =>
              value || {
                id: '',
              }
          )
        )
      }
      renderOption={(props, option) => (
        <div {...props} data-testid={`${inputProps['data-testid']}-${option.userName}`}>
          <span>
            {option.userNickName !== null && option.userNickName !== ''
              ? option.userNickName
              : `${option.userName}`}
          </span>
          {option.userNo !== '' && option.userNo !== null ? `-${option.userNo}` : '(無代號)'}
        </div>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          {...fieldProps}
          fullWidth
          name={name}
          inputRef={ref}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          onChange={handleInputChange}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            ...inputProps,
            endAdornment: (
              <React.Fragment>
                {/* {userOrderableList.loading ? <CircularProgress color="inherit" size={20} /> : null} */}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  )
}

export default React.forwardRef(DesignerBeenAssistedAutoComplete)
