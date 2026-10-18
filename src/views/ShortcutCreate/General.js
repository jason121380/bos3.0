/** @jsxImportSource @emotion/react */
import { TextField } from '@mui/material'
import { Button } from 'ui/button'
import { Card, CardContent } from 'ui/card'
import { css } from '@emotion/react'
import { theme } from '../../theme'
import TransferList from '../../components/TransferList.js';

const styles = {
  root: css({
    marginTop: theme.spacing(3),
    '& .MuiCardHeader-action': {
      alignItems: ''
    }
  }),
  content: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    paddingTop: 16
  })
}

function General({
  servicesData, submitData, handleSetValue, servicesKeyword,
  keyWordsOnChange, productData, productKeyword, ticketData,
  ticketKeyword, memberCardsData, memberCardsKeyword, isClick,
  handleSubmit
}) {
  return (
    <>
      <Card className="mt-6">
        <CardContent css={styles.content}>
          <TextField
            label='代號'
            placeholder='請輸入代號'
            variant='outlined'
            value={submitData.no}
            onChange={e => handleSetValue(e.target.value, 'no')}
          />
          <TextField
            label='名稱*'
            placeholder='請輸入名稱'
            variant='outlined'
            value={submitData.name}
            onChange={e => handleSetValue(e.target.value, 'name')}
          />
          <div className="my-4 h-px bg-border" />
          <TransferList
            idsKey='serviceIds'
            title='服務項目'
            keywordKey='SERVICE'
            optionData={servicesData}
            optionIds={submitData.serviceIds}
            handleSetValue={handleSetValue}
            keyword={servicesKeyword}
            keyWordsOnChange={keyWordsOnChange}
          />
          <div className="my-4 h-px bg-border" />
          <TransferList
            idsKey='productIds'
            title='店販銷售'
            keywordKey='PRODUCT'
            optionData={productData}
            optionIds={submitData.productIds}
            handleSetValue={handleSetValue}
            keyword={productKeyword}
            keyWordsOnChange={keyWordsOnChange}
          />
          <div className="my-4 h-px bg-border" />
          <TransferList
            idsKey='ticketIds'
            title='預收卡'
            keywordKey='TICKET'
            optionData={ticketData}
            optionIds={submitData.ticketIds}
            handleSetValue={handleSetValue}
            keyword={ticketKeyword}
            keyWordsOnChange={keyWordsOnChange}
          />
          <div className="my-4 h-px bg-border" />
          <TransferList
            idsKey='membershipIds'
            title='會員卡'
            keywordKey='MEMBERCARD'
            optionData={memberCardsData}
            optionIds={submitData.membershipIds}
            handleSetValue={handleSetValue}
            keyword={memberCardsKeyword}
            keyWordsOnChange={keyWordsOnChange}
          />
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-end">
        <Button disabled={isClick} onClick={handleSubmit} variant="primary">
          新增
        </Button>
      </div>
    </>
  )
}
export default General