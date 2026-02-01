/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Chip,
  Autocomplete
} from '@mui/material'
import idx from 'idx'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { useRef, useState } from 'react'
import { css } from '@emotion/react'
import { theme } from '../../theme'

const styles = {
  formGroup: css({
    marginBottom: theme.spacing(3),
    '&:last-child': {
      marginBottom: 0,
    },
  }),
}

const deductions = [
  {
    label: '點數',
    value: 'point',
  },
  {
    label: '金額',
    value: 'cash',
  },
  {
    label: '百分比',
    value: 'percent',
  },
]

function AboutAssistant({ className, helperDeductionSetting, onChange, assistant, ...rest }) {
  const inputLabel = useRef()
  const [deductionWay, setDeductionWay] = useState('')
  const handleOnChange = ({ event, completed, key }) => {
    let _helperDeductionSetting = _.cloneDeep(helperDeductionSetting)
    switch (key) {
      case 'assistantName':
        _helperDeductionSetting = _helperDeductionSetting.map(data => {
          if (data.type === assistant.type) {
            data.nameList = completed
            data.peopleCount = completed.length
          }
          return data
        })
        onChange({
          event: {
            target: {
              value: _helperDeductionSetting,
            },
          },
          key: 'helperDeductionSetting',
        })
        break
      case 'deductionWay':
        setDeductionWay(idx(event, _ => _.target.value))
        break
      case 'deductionNumber':
        _helperDeductionSetting = _helperDeductionSetting.map(data => {
          if (data.type === assistant.type) data[deductionWay] = parseInt(event.target.value)
          return data
        })
        onChange({
          event: {
            target: {
              value: _helperDeductionSetting,
            },
          },
          key: 'helperDeductionSetting',
        })
        break
      default:
        throw new Error('選擇抽成方式錯誤')
    }
  }
  return (
    <Card {...rest} css={className}>
      <CardHeader title={`協助人員-${assistant.type}`} />
      <CardContent>
        <Autocomplete
          multiple
          options={assistant.nameList}
          freeSolo
          css={styles.formGroup}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip variant="outlined" label={option} {...getTagProps({ index })} />
            ))
          }
          onChange={(event, completed) =>
            handleOnChange({ event, completed, key: 'assistantName' })
          }
          renderInput={params => (
            <TextField
              {...params}
              variant="outlined"
              label="協助人員名稱"
              placeholder="輸入協助人員名稱"
              fullWidth
            />
          )}
        />
        <FormControl variant="outlined" css={styles.formGroup} fullWidth>
          <InputLabel ref={inputLabel}>抽成方式</InputLabel>
          <Select
            label='抽成方式'
            value={deductionWay}
            onChange={event => handleOnChange({ event, key: 'deductionWay' })}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {deductions.map((data, idx) => (
              <MenuItem value={data.value} key={`deduction-${idx}`}>
                {data.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {deductionWay ? (
          <TextField
            variant="outlined"
            type="number"
            onChange={event => handleOnChange({ event, key: 'deductionNumber' })}
            label={deductions.find(d => d.value === deductionWay).label}
            placeholder={`輸入${deductions.find(d => d.value === deductionWay).label}`}
            css={styles.formGroup}
            fullWidth
            onWheel={() => document.activeElement.blur()}
          />
        ) : (
          ''
        )}
      </CardContent>
    </Card>
  )
}

AboutAssistant.propTypes = {
  className: PropTypes.object,
}

export default AboutAssistant
