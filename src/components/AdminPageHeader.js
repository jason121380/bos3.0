import { ListFilter } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import PageTitle from './PageTitle'
import PropTypes from 'prop-types'
import { Button } from 'ui/button'

// 舊頁面共用的頁首，props 介面不變，外觀改為 STYLE.md §4 的 PageHeader：
// 左側標題；右側依序為 children、次要動作、篩選開關、主要動作（實心黑，每頁最多一個）。
// 外框已由 MUI Box 改為原生 div；呼叫端既有 sx 僅用 backgroundColor 與 mb（MUI spacing，1 單位=8px）兩鍵，
// 在下方逐鍵轉成 inline style 以維持原畫面，其餘 sx 鍵不再支援；遷移完成的頁面請改用 ui/page-header。
const AdminPageHeader = ({
    title,
    subTitle,
    showFilter,
    onFilterClick,
    primaryAction,
    secondaryActions,
    children,
    sx,
    ...rest
}) => {
    return (
        <div
            className="ui-root noprint flex flex-wrap items-center justify-between gap-4 pb-6"
            style={{
                ...(sx?.backgroundColor ? { backgroundColor: sx.backgroundColor } : {}),
                ...(sx?.mb != null ? { marginBottom: typeof sx.mb === 'number' ? sx.mb * 8 : sx.mb } : {}),
            }}
            {...rest}
        >
            <PageTitle title={title} subTitle={subTitle} />
            <div className="flex flex-wrap items-center gap-2">
                {children}
                {secondaryActions && secondaryActions.map((action, index) => (
                    <Button
                        key={index}
                        variant="secondary"
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={action.className}
                    >
                        {action.label}
                    </Button>
                ))}
                {onFilterClick && (
                    <Button
                        variant="secondary"
                        aria-pressed={!!showFilter}
                        onClick={onFilterClick}
                        className={showFilter ? 'border-accent bg-accent/8 text-accent hover:bg-accent/8' : undefined}
                    >
                        <ListFilter strokeWidth={1.75} />
                        篩選
                    </Button>
                )}
                {primaryAction && (
                    primaryAction.to ? (
                        <Button asChild variant="primary">
                            <RouterLink to={primaryAction.to}>{primaryAction.label}</RouterLink>
                        </Button>
                    ) : (
                        <Button variant="primary" onClick={primaryAction.onClick}>
                            {primaryAction.label}
                        </Button>
                    )
                )}
            </div>
        </div>
    )
}

AdminPageHeader.propTypes = {
    title: PropTypes.string.isRequired,
    showFilter: PropTypes.bool,
    onFilterClick: PropTypes.func,
    primaryAction: PropTypes.shape({
        label: PropTypes.string.isRequired,
        to: PropTypes.string,
        onClick: PropTypes.func,
    }),
    secondaryActions: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
        className: PropTypes.string,
    })),
    children: PropTypes.node,
}

export default AdminPageHeader
