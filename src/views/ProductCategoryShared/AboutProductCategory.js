import PropTypes from 'prop-types'
import useStore from 'hooks/useStore'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'

// 新增商品類別／編輯商品類別共用（2026/10/30 自兩頁合併）。idPrefix 讓兩頁的欄位 id 維持原值
// （product-category-create-*／product-category-edit-*）；register 規則與錯誤文字逐字保留。
function AboutProductCategory({ className, idPrefix = 'product-category-edit', productCategory, onChange, ...rest }) {
  const { errors, register } = useStore()

  return (
    <Card {...rest} className={className}>
      <CardHeader>
        <CardTitle>一般資訊</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Field label="代號" htmlFor={`${idPrefix}-no`} error={errors.no && errors.no.message}>
          <Input
            id={`${idPrefix}-no`}
            name="no"
            invalid={!!errors.no}
            aria-describedby={errors.no ? `${idPrefix}-no-helper-text` : undefined}
            data-testid="no"
            ref={register({
              required: '代號 為必填',
            })}
          />
        </Field>
        <Field label="名稱" htmlFor={`${idPrefix}-name`} error={errors.name && errors.name.message}>
          <Input
            id={`${idPrefix}-name`}
            name="name"
            invalid={!!errors.name}
            aria-describedby={errors.name ? `${idPrefix}-name-helper-text` : undefined}
            data-testid="name"
            ref={register({
              required: '名稱 為必填',
            })}
          />
        </Field>
      </CardContent>
    </Card>
  )
}

AboutProductCategory.propTypes = {
  className: PropTypes.object,
  idPrefix: PropTypes.string,
}

export default AboutProductCategory
