import { TextField } from 'ui/text-field'
import useFetchUsersOrderableList from 'hooks/useFetchGetUserOrderableList'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import React, { useEffect } from 'react'
import { Autocomplete } from 'ui/combobox'
import compareNo from 'utils/compareNo'

// 篩選不依賴元件內任何值：放在模組層，函式身分固定，ui/combobox 才能沿用篩選結果（效能修正 B，內容不變）
const filterOptions = (options, state) => {
  const keyWord = state.inputValue
  // 編號自然排序（英數編號也有效）、空編號排最後（原本 a.userNo - b.userNo 對英數編號得 NaN、空編號當 0 排最前；Jason 2026/10/22 fix all）
  const newOptions = [...options].sort((a, b) => compareNo(a.userNo, b.userNo))
  let userNo = []
  let userNickName = []
  let userName = []
  if (keyWord !== '' && keyWord.trim() !== '') {
    userNo = newOptions.filter((data, index) => {
      if (data.userNo !== '' && data.userNo !== null && data.userNo.toLowerCase() === keyWord.toLowerCase()) {
        return data.userNo.toLowerCase() === keyWord.toLowerCase()
      }
      return false
    })
    userNickName = newOptions.filter((data, index) => {
      if (data.userNickName !== '' && data.userNickName !== null && data.userNickName.toLowerCase().includes(keyWord.toLowerCase())) {
        return data.userNickName.toLowerCase().includes(keyWord.toLowerCase())
      }
      return false
    })
    userName = newOptions.filter((data, index) => {
      if (data.userName !== '' && data.userName !== null && data.userName.toLowerCase().includes(keyWord.toLowerCase())) {
        return data.userName.toLowerCase().includes(keyWord.toLowerCase())
      }
      return false
    })

    const filterOptions = [...userNo, ...userNickName, ...userName]
    // 挑出重複的選項
    const filteredArray = filterOptions.filter((data, index) => {
      return filterOptions.indexOf(data) === index
    })
    return filteredArray
  } else {
    return newOptions
  }
}

function EmployeeAutoComplete(
  {
    // 跨組契約：className／assistField 為 Tailwind 字串，直通到 ui/combobox 根節點（其內以 cn 合併預設 class）
    className = '',
    assistField = '',
    isAssist = false,
    onChange = () => {},
    inputOnChange = () => {},
    getCustomerData = () => {},
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
    setEmployeeAlready,
    placeholder,
    // 欄位尺寸：預設小尺寸（34px）；帳單項目列的服務人員傳 'medium'，與同列輸入框同高（36px、手機 40px）
    size = 'small',
  },
  ref
) {
  const designerToggle = useToggle()
  const userOrderableList = useFetchUsersOrderableList()

  useEffect(() => {
    if (setEmployeeAlready !== undefined && !userOrderableList.loading) {
      setEmployeeAlready(!userOrderableList.loading)
    }
  }, [userOrderableList.loading, setEmployeeAlready])
  const [designerKeyword, setDesignerKeyword] = React.useState('')
  // const [inputDisplay, setInputDisplay] = React.useState('')
  // const [keyCode, setKeyCode] = React.useState(null)

  const selectedValue = idx(userOrderableList, _ => _.data.getUserOrderableList.find(d => d.userId === value)) || null

  const handleInputChange = event => {
    idx(event, _ => {
      setDesignerKeyword(_.target.value)
      inputOnChange(_.target.value)
    })
  }
  const options = idx(userOrderableList, _ => _.data.getUserOrderableList) || []

  useEffect(() => {
    if (options.length > 0) {
      getCustomerData(options)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 缺的是每次 render 都會重建的函式（getCustomerData）；只在 [options] 變動時呼叫，補上會每次 render 重跑
  }, [options])

  /*   const filteredOption = options
    .sort((a, b) => {
      return a.userNo - b.userNo
    })
    .filter(
      d =>
        d.userNo !== '' &&
        d.userNo !== null &&
        d.userNo.toLowerCase() === designerKeyword.toLowerCase()
    ) */

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
  // 只隨搜尋字與已選人員改變（內容不變），下拉沒變時不必重跑篩選（效能修正 B）
  const getOptionLabel = React.useCallback(
    option =>
      (option.userNo !== null && option.userNo !== '' && option.userNo.toLowerCase().includes(designerKeyword.toLowerCase())) ||
      selectedValue !== null
        ? `${
            option.userNickName !== null && option.userNickName !== '' ? option.userNickName : option.userName
          }${option.userNo !== '' && option.userNo !== null ? `-${option.userNo}` : '(無代號)'}`
        : option.userName,
    [designerKeyword, selectedValue]
  )
  return (
    <form style={{ display: 'flex' }} onSubmit={event => event.preventDefault()}>
      <Autocomplete
        freeSolo
        fullWidth
        style={schedule ? { width: '50%' } : {}}
        autoComplete={false}
        clearOnBlur={true}
        // onKeyDown={e => handleKeyDown(e)}
        open={designerToggle.open}
        onOpen={designerToggle.toggle}
        onClose={designerToggle.toggle}
        className={isAssist ? assistField : className}
        value={selectedValue}
        options={options}
        filterOptions={filterOptions}
        autoHighlight
        onFocus={onFocus}
        getOptionLabel={getOptionLabel}
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
              {option.userNickName !== null && option.userNickName !== '' ? option.userNickName : `${option.userName}`}
              {option.userNo !== '' && option.userNo !== null ? `-${option.userNo}` : '(無代號)'}
            </span>
          </div>
        )}
        renderInput={params => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            {...fieldProps}
            fullWidth
            name={name}
            inputRef={ref}
            onKeyDown={onKeyDown}
            onChange={handleInputChange}
            variant="outlined"
            // 帳單服務列的協助人員（isAssist）與同列的價格、服務項目同高（一般尺寸，手機 40px）；其餘用法依 size（預設小尺寸）
            size={isAssist ? undefined : size}
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
    </form>
  )
}

// memo：打帳單整頁重畫時，props 沒變的人員下拉不重畫（呼叫端以固定身分的 handler 傳入；效能修正 B）
export default React.memo(React.forwardRef(EmployeeAutoComplete))
