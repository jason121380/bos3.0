/** @jsxImportSource @emotion/react */
import { TextField } from 'ui/text-field'
import useFetchGetUserBookingRecordList from 'hooks/useFetchGetUserBookingRecordList'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import React, {useEffect} from 'react'
import { css } from '@emotion/react'
import { Autocomplete } from 'ui/combobox'

function BookingRecordListAutoComplete(
  {
    className = {},
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
  },
  ref
) {
  const designerToggle = useToggle()
  const userBookingRecordList = useFetchGetUserBookingRecordList()
  
  useEffect(() => {
    if (setEmployeeAlready !== undefined && !userBookingRecordList.loading) {
      setEmployeeAlready(!userBookingRecordList.loading)
    }
  }, [userBookingRecordList.loading]);
  const [designerKeyword, setDesignerKeyword] = React.useState('')
  // const [inputDisplay, setInputDisplay] = React.useState('')
  // const [keyCode, setKeyCode] = React.useState(null)

  const selectedValue =
    idx(userBookingRecordList, _ => _.data.getUserBookingRecordList.find(d => d.userId === value)) || null

  const handleInputChange = event => {
    idx(event, _ => {
      setDesignerKeyword(_.target.value)
      inputOnChange(_.target.value)
    })
  }
  const options = idx(userBookingRecordList, _ => _.data.getUserBookingRecordList) || []

  useEffect(() => {
    if(options.length > 0) {
      getCustomerData(options)
    }
  }, [options])

  const filterOptions = (options, state) => {
    const keyWord = state.inputValue
    const newOptions = options.sort((a, b) => {
      return a.userNo - b.userNo
    })
    let userNo = []
    let userNickName = []
    let userName = []
    if (keyWord !== '' && keyWord.trim() !== '') {
      userNo = newOptions.filter((data, index) => {
        if (
          data.userNo !== '' &&
          data.userNo !== null &&
          data.userNo.toLowerCase() === keyWord.toLowerCase()
        ) {
          return data.userNo.toLowerCase() === keyWord.toLowerCase()
        }
      })
      userNickName = newOptions.filter((data, index) => {
        if (
          data.userNickName !== '' &&
          data.userNickName !== null &&
          data.userNickName.toLowerCase().includes(keyWord.toLowerCase())
        ) {
          return data.userNickName.toLowerCase().includes(keyWord.toLowerCase())
        }
      })
      userName = newOptions.filter((data, index) => {
        if (
          data.userName !== '' &&
          data.userName !== null &&
          data.userName.toLowerCase().includes(keyWord.toLowerCase())
        ) {
          return data.userName.toLowerCase().includes(keyWord.toLowerCase())
        }
      })

      const filterOptions = [...userNo, ...userNickName, ...userName]
      // 挑出重複的選項
      const filteredArray = filterOptions.filter((data, index) => {
        return filterOptions.indexOf(data) === index
      })
      return filteredArray
    } else {
      return options
    }
  }
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
  return (
    <form style={{ display: 'flex' }} onSubmit={event => event.preventDefault()}>
      <Autocomplete
        freeSolo
        fullWidth
        style={schedule ? { width: '50%' } : {}}
        autoComplete={false}
        // onKeyDown={e => handleKeyDown(e)}
        open={designerToggle.open}
        onOpen={designerToggle.toggle}
        onClose={designerToggle.toggle}
        css={className}
        value={selectedValue}
        options={options}
        filterOptions={filterOptions}
        autoHighlight
        onFocus={onFocus}
        isOptionEqualToValue={(option, value) => option.userName === value.userName}
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
        loading={userBookingRecordList.loading}
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
        renderOption={({key, ...option}, value) => (
          <div style={{ fontSize: '14px' }} {...option} key={value.userId} data-testid={`${inputProps['data-testid']}-${value.userName}`}>
            <span>
              {value.userNickName !== null && value.userNickName !== ''
                ? value.userNickName
                : `${value.userName}`}
            </span>
            {value.userNo !== '' && value.userNo !== null ? `-${value.userNo}` : '(無代號)'}
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
            onKeyDown={onKeyDown}
            onChange={handleInputChange}
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              ...inputProps,
              endAdornment: (
                <React.Fragment>
                  {/* {userBookingRecordList.loading ? <CircularProgress color="inherit" size={20} /> : null} */}
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

export default React.forwardRef(BookingRecordListAutoComplete)
