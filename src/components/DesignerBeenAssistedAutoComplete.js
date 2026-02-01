/** @jsxImportSource @emotion/react */
import { CircularProgress, TextField, Autocomplete } from '@mui/material'
import useFetchUsersOrderableList from 'hooks/useFetchGetUserOrderableList'
import useToggle from 'hooks/useToggle'
import idx from 'idx'
import React from 'react'

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
