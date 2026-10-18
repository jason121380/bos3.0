/** @jsxImportSource @emotion/react */
import {
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material'
import { Card, CardHeader, CardTitle, CardContent } from 'ui/card'
import { memo } from 'react'
import styles from './styles/AboutMerchantRakePerformanceRefer'
import produce from 'immer'

const options = {
  des: [
    { value: 'VALUE', label: '總金額'},
    { value: 'FAKE', label: '總虛業績'},
    { value: 'TRUTH', label: '總實業績'},
    { value: 'DESIGNATETRUTH', label: '指定實業績'}
  ],
  nonDes: [
    { value: 'VALUE', label: '總金額'},
    { value: 'FAKE', label: '總虛業績'},
    { value: 'TRUTH', label: '總實業績'},
    { value: 'NONDESIGNATETRUTH', label: '不指定實業績'}
  ]
}

function AboutMerchantRakePerformanceRefer({
  className, merchantRakeReferemce, setMerchantRakeReferemce, inputEnable,
}) {
  const handleValueChange = (e, key) => {
    setMerchantRakeReferemce(
      produce(draft => {
        draft[key] = e.target.value
      })
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>抽成門檻依據設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div css={styles.serviceInputGroup}>
          <div className="flex flex-wrap items-center gap-2 p-2">
            <FormControl disabled={!inputEnable} variant="outlined" css={styles.field}>
              <InputLabel>指定</InputLabel>
              <Select
                label='指定'
                value={merchantRakeReferemce.designate}
                onChange={e => handleValueChange(e, 'designate')}
              >
                {options.des.map((data, idx) => (
                  <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                    {data.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl disabled={!inputEnable} variant="outlined" css={styles.field}>
              <InputLabel>不指定</InputLabel>
              <Select
                label='不指定'
                value={merchantRakeReferemce.nonDesignate}
                onChange={e => handleValueChange(e, 'nonDesignate')}
              >
                {options.nonDes.map((data, idx) => (
                  <MenuItem value={data.value} key={`${data.label}-${idx}`}>
                    {data.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(AboutMerchantRakePerformanceRefer)
