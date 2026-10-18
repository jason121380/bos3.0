/** @jsxImportSource @emotion/react */
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  IconButton,
  FormControlLabel,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'
import { Add as AddIcon, DeleteForever as DeleteForeverIcon } from 'ui/icons'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { css } from '@emotion/react'

const styles = {
  marginTop: css({
    marginTop: '30px'
  }),
  marginTop2: css({
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '20px'
  }),
  marginBottom: css({
    marginBottom: '12px'
  }),
  marginRight: css({
    marginRight: '20px'
  }),
  inputWidth: css({
    width: '200px'
  }),
  inputWrap: css({
    display: 'flex',
    gap: '10px 20px',
    flexWrap: 'wrap',
  }),
  iconWrap: css({
    display: 'flex',
    width: '100px',
  }),
}

const statusEnum = [
  { label: '固定金額', value: 'FIXED' },
  { label: '全段', value: 'NONSEGMENTED' },
  { label: '分段', value: 'SEGMENTED' },
]

function Results({ className, status, submitData, setSubmitData, ...rest }) {
  const handleAddRow = () => {
    const newSubmitData = _.cloneDeep(submitData)
    newSubmitData[status].push({ threshold: 0, price: 0 })
    setSubmitData(newSubmitData)
  }
  const handleDeleteRow = index => {
    const newSubmitData = _.cloneDeep(submitData)
    newSubmitData[status].splice(index, 1)
    setSubmitData(newSubmitData)
  }
  const handleEditRow = (index, value, key) => {
    const newSubmitData = _.cloneDeep(submitData)
    newSubmitData[status][index][key] = value
    setSubmitData(newSubmitData)
  }
  return (
    <Card {...rest} css={css([styles.root, className])}>
      <CardHeader title="互助點數設定" style={{ paddingBottom: 0 }} />
      <CardContent>
        <TextField
          value={submitData.name}
          variant='outlined'
          label='互助點數設定名稱'
          onFocus={e => e.target.select()}
          onChange={e => setSubmitData({ ...submitData, name: e.target.value })}
          fullWidth
        />
        <div css={styles.marginTop}>
          <div css={styles.marginBottom} style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center'}}>點數使用成本設定</div>
            <FormControlLabel
              checked={submitData.isAccordingToHelper}
              onChange={(e, v) => setSubmitData({ ...submitData, isAccordingToHelper: v })}
              control={<Checkbox color="primary" />}
              label="依互助人固定金額"
            />
          </div>
          <TextField
            value={submitData.paidFixed}
            fullWidth
            type='number'
            variant='outlined'
            label='換算金額'
            onFocus={e => e.target.select()}
            onChange={e => setSubmitData({ ...submitData, paidFixed: parseInt(Math.abs(e.target.value)) })}
            inputProps={{
              min: 0,
            }}
            onWheel={() => document.activeElement.blur()}
          />
        </div>
        <div css={styles.marginTop}>
          <div css={styles.marginBottom}>點數獲得設定</div>
          <ToggleButtonGroup
            size="small"
            value={submitData.retrievePointWay}
            onChange={(e, value) => value && setSubmitData({ ...submitData, retrievePointWay: value })}
            exclusive
          >
            {statusEnum.map((data, idx) => (
              <ToggleButton key={`${data.label}-${idx}`} value={data.value} name={data.label}>
                {data.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          <div css={styles.marginTop2}>
            {status === 'FIXED' ?
              (<TextField
                fullWidth
                type='number'
                css={styles.inputWidth}
                variant='outlined'
                label='換算金額'
                value={submitData.retrieveFixed}
                onFocus={e => e.target.select()}
                onChange={e => setSubmitData({ ...submitData, retrieveFixed: parseInt(Math.abs(e.target.value)) })}
                onWheel={() => document.activeElement.blur()}
              />) :
              submitData[status].map((d, index) => (
                <div css={styles.inputWrap} key={index}>
                  <TextField
                    fullWidth
                    type='number'
                    css={styles.inputWidth}
                    variant='outlined'
                    label='點數門檻'
                    value={d.threshold}
                    onChange={e => handleEditRow(index, parseInt(Math.abs(e.target.value)), 'threshold')}
                    onFocus={e => e.target.select()}
                    onWheel={() => document.activeElement.blur()}
                  />
                  <TextField
                    fullWidth
                    type='number'
                    css={styles.inputWidth}
                    variant='outlined'
                    label='換算金額'
                    value={d.price}
                    onChange={e => handleEditRow(index, parseInt(Math.abs(e.target.value)), 'price')}
                    onFocus={e => e.target.select()}
                    onWheel={() => document.activeElement.blur()}
                  />
                  <div>
                    {index > 0 &&
                      <IconButton onClick={() => handleDeleteRow(index)}>
                        <DeleteForeverIcon />
                      </IconButton>}
                    {index === submitData[status].length - 1 &&
                      <IconButton onClick={() => handleAddRow(index)}>
                        <AddIcon />
                      </IconButton>}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

Results.propTypes = {
  className: PropTypes.object,
}

export default Results
