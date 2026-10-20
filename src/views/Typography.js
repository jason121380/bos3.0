import { Card, CardContent } from 'ui/card'

import Page from 'components/Page'

// 字級展示頁：Typography 依 STYLE §10 映射為原生標籤＋Tailwind 字級；§3 沒有對應級距的 h2／h4／h6／body2
// 以任意值重現原相容層字級（24／18／15／14px），不硬套 token。原 Container maxWidth="lg"、Grid（spacing 3、lg 4 欄）改為 div＋Tailwind
function TypographyView() {
  return (
    <Page className="py-6" title="Typography">
      <div className="mx-auto box-border w-full px-4 min-[600px]:px-6 min-[1200px]:max-w-[1200px]">
        <span className="text-caption font-medium text-text-secondary">Components</span>
        <h3 className="m-0 mb-[0.35em] text-title font-bold text-text">
          Typography
        </h3>
        <hr className="my-6 border-0 border-b border-solid border-border" />
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 min-[1200px]:grid-cols-3">
              <div className="min-w-0">
                <h1 className="m-0 mb-[0.35em] text-display !font-bold text-text">
                  h1. Heading
                </h1>
                <h2 className="m-0 mb-[0.35em] text-[24px] font-bold leading-8 text-text">
                  h2. Heading
                </h2>
                <h3 className="m-0 mb-[0.35em] text-title font-bold text-text">
                  h3. Heading
                </h3>
                <h4 className="m-0 mb-[0.35em] text-[18px] font-bold leading-[26px] text-text">
                  h4. Heading
                </h4>
                <h5 className="m-0 mb-[0.35em] text-heading text-text">
                  h5. Heading
                </h5>
                <h6 className="m-0 text-[15px] font-bold leading-[22px] text-text">h6. Heading</h6>
              </div>
              <div className="min-w-0">
                <p className="m-0 mb-[0.35em] text-body text-text">
                  body1. Nunc arcu est, blandit a malesuada eget, maximus nec metus. Vivamus turpis
                  sapien, dapibus id lectus vitae, finibus ullamcorper augue. Nullam vulputate
                  elementum velit. Sed vel commodo ligula, vitae ullamcorper ipsum. Duis convallis
                  ligula nunc, ac posuere mi mattis id. Duis venenatis mattis dolor blandit sodales.
                </p>
                <p className="m-0 text-[14px] leading-5 text-text-secondary">
                  body2. Nunc arcu est, blandit a malesuada eget, maximus nec metus. Vivamus turpis
                  sapien, dapibus id lectus vitae, finibus ullamcorper augue. Nullam vulputate
                  elementum velit. Sed vel commodo ligula, vitae ullamcorper ipsum. Duis convallis
                  ligula nunc, ac posuere mi mattis id. Duis venenatis mattis dolor blandit sodales.
                </p>
              </div>
              <div className="min-w-0">
                <h6 className="m-0 mb-[0.35em] text-body font-medium text-text">
                  subtitle1. Fusce pellentesque neque sed nisl pretium ultricies.
                </h6>
                <h6 className="m-0 mb-[0.35em] text-label text-text-secondary">
                  subtitle2. Fusce pellentesque neque sed nisl pretium ultricies.
                </h6>
                <p className="m-0 mb-[0.35em] text-caption text-text-secondary">
                  caption. Duis convallis ligula nunc
                </p>
                <p className="m-0 mb-[0.35em] text-caption font-medium text-text-secondary">
                  overline. Sed arcu est
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  )
}

export default TypographyView
