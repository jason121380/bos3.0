import PropTypes from 'prop-types'
import useStore from 'hooks/useStore'
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card'
import { Field, Input } from 'ui/input'

function AboutProductCategory({ className, productCategory, onChange, ...rest }) {
  const { errors, register } = useStore()

  return (
    <Card {...rest} className={className}>
      <CardHeader>
        <CardTitle>一般資訊</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Field label="代號" htmlFor="product-category-edit-no" error={errors.no && errors.no.message}>
          <Input
            id="product-category-edit-no"
            name="no"
            invalid={!!errors.no}
            aria-describedby={errors.no ? 'product-category-edit-no-helper-text' : undefined}
            data-testid="no"
            ref={register({
              required: '代號 為必填',
            })}
          />
        </Field>
        <Field label="名稱" htmlFor="product-category-edit-name" error={errors.name && errors.name.message}>
          <Input
            id="product-category-edit-name"
            name="name"
            invalid={!!errors.name}
            aria-describedby={errors.name ? 'product-category-edit-name-helper-text' : undefined}
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
}

export default AboutProductCategory
