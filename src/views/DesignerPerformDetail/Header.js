import { PageHeader } from 'ui/page-header'

function Header({ ...rest }) {
  return (
    <div {...rest}>
      <PageHeader title="設計師細項分析" />
    </div>
  )
}
export default Header
