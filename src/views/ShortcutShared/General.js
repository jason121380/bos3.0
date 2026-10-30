import { Field, Input } from 'ui/input'
import { Button } from 'ui/button'
import { Card, CardContent } from 'ui/card'
import TransferList from 'components/TransferList'

// 新增快捷鍵／編輯快捷鍵共用（2026/10/30 自兩頁合併）。兩頁只差送出鈕文字：新增頁傳 submitLabel="新增"，編輯頁用預設「儲存」。

function General({
  servicesData, submitData, handleSetValue, servicesKeyword,
  keyWordsOnChange, productData, productKeyword, ticketData,
  ticketKeyword, memberCardsData, memberCardsKeyword, isClick,
  handleSubmit, submitLabel = '儲存'
}) {
  return (
    <>
      <Card className="mt-6">
        <CardContent className="flex flex-col gap-[20px] pt-[16px]">
          <Field label="代號">
            <Input
              placeholder="請輸入代號"
              value={submitData.no}
              onChange={e => handleSetValue(e.target.value, 'no')}
            />
          </Field>
          <Field label="名稱" required>
            <Input
              placeholder="請輸入名稱"
              value={submitData.name}
              onChange={e => handleSetValue(e.target.value, 'name')}
            />
          </Field>
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
          {submitLabel}
        </Button>
      </div>
    </>
  )
}
export default General