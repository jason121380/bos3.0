import React from 'react'
import styled from '@emotion/styled'
import {
  Armchair as LucideArmchair,
  ArrowDown as LucideArrowDown,
  ArrowUp as LucideArrowUp,
  Ban as LucideBan,
  CalendarDays as LucideCalendarDays,
  CalendarX as LucideCalendarX,
  Check as LucideCheck,
  ChevronDown as LucideChevronDown,
  ChevronRight as LucideChevronRight,
  ChevronUp as LucideChevronUp,
  ChevronsDown as LucideChevronsDown,
  ChevronsUp as LucideChevronsUp,
  CircleAlert as LucideCircleAlert,
  CircleCheck as LucideCircleCheck,
  CircleDollarSign as LucideCircleDollarSign,
  CircleX as LucideCircleX,
  ClipboardCheck as LucideClipboardCheck,
  Copy as LucideCopy,
  CreditCard as LucideCreditCard,
  Delete as LucideDelete,
  Download as LucideDownload,
  EllipsisVertical as LucideEllipsisVertical,
  Eye as LucideEye,
  EyeOff as LucideEyeOff,
  FileText as LucideFileText,
  GripHorizontal as LucideGripHorizontal,
  ImagePlus as LucideImagePlus,
  Info as LucideInfo,
  KeyRound as LucideKeyRound,
  LayoutDashboard as LucideLayoutDashboard,
  ListFilter as LucideListFilter,
  Lock as LucideLock,
  LockOpen as LucideLockOpen,
  Mail as LucideMail,
  MapPin as LucideMapPin,
  MessageSquare as LucideMessageSquare,
  Minus as LucideMinus,
  Monitor as LucideMonitor,
  Package as LucidePackage,
  Paperclip as LucidePaperclip,
  Pencil as LucidePencil,
  Plus as LucidePlus,
  Printer as LucidePrinter,
  QrCode as LucideQrCode,
  Redo2 as LucideRedo2,
  Search as LucideSearch,
  Send as LucideSend,
  ShoppingCart as LucideShoppingCart,
  SlidersHorizontal as LucideSlidersHorizontal,
  Smartphone as LucideSmartphone,
  Square as LucideSquare,
  SquareCheck as LucideSquareCheck,
  SquareX as LucideSquareX,
  Store as LucideStore,
  Tag as LucideTag,
  Ticket as LucideTicket,
  Timer as LucideTimer,
  Trash2 as LucideTrash2,
  TriangleAlert as LucideTriangleAlert,
  Undo2 as LucideUndo2,
  User as LucideUser,
  UserCog as LucideUserCog,
  UserPlus as LucideUserPlus,
  Users as LucideUsers,
  X as LucideX,
} from 'lucide-react'
import { cn } from './utils'

// MUI 圖示轉接層（STYLE.md §8：圖示統一用 lucide）
// 沿用 @mui/icons-material 的元件名稱與 props（fontSize、color、htmlColor、sx、className、style、onClick…），
// 讓尚未改版的頁面只改 import 就換成 lucide 線條圖示，JSX 不必改動。
// 保留 MuiSvgIcon-root 等 class，讓舊頁面針對 .MuiSvgIcon-root 的樣式仍然有效。
const FONT_SIZE = { small: '1.25rem', medium: '1.5rem', large: '2.1875rem', inherit: 'inherit' }
const COLOR = {
  primary: 'rgb(var(--accent))',
  secondary: 'rgb(var(--text-secondary))',
  action: 'rgb(var(--text-secondary))',
  disabled: 'rgb(var(--text-tertiary))',
  error: 'rgb(var(--danger))',
  warning: 'rgb(var(--warning))',
  success: 'rgb(var(--success))',
  info: 'rgb(var(--accent))',
}
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

function adapt(Lucide, name) {
  // 以 emotion styled 產生 class（取代 MUI Box 的 sx）：元件自身樣式在前、頁面 className（css prop）在後，頁面樣式可覆蓋預設尺寸，與 MUI SvgIcon 相同
  const Svg = styled(Lucide, { shouldForwardProp: prop => prop !== 'iconStyles' })(({ iconStyles }) => iconStyles)
  const Icon = React.forwardRef(({ fontSize = 'medium', color, htmlColor, className, style, sx, titleAccess, ...rest }, ref) => (
    <Svg
      ref={ref}
      strokeWidth={1.75}
      aria-hidden={titleAccess ? undefined : true}
      aria-label={titleAccess}
      className={cn('MuiSvgIcon-root', `MuiSvgIcon-fontSize${capitalize(String(fontSize))}`, className)}
      iconStyles={[
        { width: '1em', height: '1em', display: 'inline-block', flexShrink: 0, fontSize: FONT_SIZE[fontSize] || fontSize },
        (htmlColor || COLOR[color]) && { color: htmlColor || COLOR[color] },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      style={style}
      {...rest}
    />
  ))
  Icon.displayName = name
  Icon.muiName = 'SvgIcon'
  return Icon
}

export const Add = adapt(LucidePlus, 'Add')
export const AddPhotoAlternate = adapt(LucideImagePlus, 'AddPhotoAlternate')
export const ArrowDownward = adapt(LucideArrowDown, 'ArrowDownward')
export const ArrowUpward = adapt(LucideArrowUp, 'ArrowUpward')
export const ArticleOutlined = adapt(LucideFileText, 'ArticleOutlined')
export const AssignmentTurnedIn = adapt(LucideClipboardCheck, 'AssignmentTurnedIn')
export const AssignmentTurnedInRounded = adapt(LucideClipboardCheck, 'AssignmentTurnedInRounded')
export const AttachFile = adapt(LucidePaperclip, 'AttachFile')
export const BackspaceOutlined = adapt(LucideDelete, 'BackspaceOutlined')
export const Cancel = adapt(LucideCircleX, 'Cancel')
export const Check = adapt(LucideCheck, 'Check')
export const CheckBox = adapt(LucideSquareCheck, 'CheckBox')
export const CheckBoxOutlineBlank = adapt(LucideSquare, 'CheckBoxOutlineBlank')
export const CheckCircle = adapt(LucideCircleCheck, 'CheckCircle')
export const CheckCircleOutlineRounded = adapt(LucideCircleCheck, 'CheckCircleOutlineRounded')
export const CheckRounded = adapt(LucideCheck, 'CheckRounded')
export const ChevronRight = adapt(LucideChevronRight, 'ChevronRight')
export const ClearRounded = adapt(LucideX, 'ClearRounded')
export const Close = adapt(LucideX, 'Close')
export const CloseRounded = adapt(LucideX, 'CloseRounded')
export const ConfirmationNumber = adapt(LucideTicket, 'ConfirmationNumber')
export const ContentCopy = adapt(LucideCopy, 'ContentCopy')
export const CreditCardTwoTone = adapt(LucideCreditCard, 'CreditCardTwoTone')
export const DashboardOutlined = adapt(LucideLayoutDashboard, 'DashboardOutlined')
export const Delete = adapt(LucideTrash2, 'Delete')
export const DeleteForever = adapt(LucideTrash2, 'DeleteForever')
export const DeleteOutline = adapt(LucideTrash2, 'DeleteOutline')
export const DeleteOutlined = adapt(LucideTrash2, 'DeleteOutlined')
export const DescriptionOutlined = adapt(LucideFileText, 'DescriptionOutlined')
export const DesktopWindowsRounded = adapt(LucideMonitor, 'DesktopWindowsRounded')
export const DisabledByDefaultRounded = adapt(LucideSquareX, 'DisabledByDefaultRounded')
export const DragHandleRounded = adapt(LucideGripHorizontal, 'DragHandleRounded')
export const Edit = adapt(LucidePencil, 'Edit')
export const EditOutlined = adapt(LucidePencil, 'EditOutlined')
export const EditRounded = adapt(LucidePencil, 'EditRounded')
export const Error = adapt(LucideCircleAlert, 'Error')
export const ErrorOutlineRounded = adapt(LucideCircleAlert, 'ErrorOutlineRounded')
export const EventBusy = adapt(LucideCalendarX, 'EventBusy')
export const EventSeat = adapt(LucideArmchair, 'EventSeat')
export const ExpandMore = adapt(LucideChevronDown, 'ExpandMore')
export const FactCheck = adapt(LucideClipboardCheck, 'FactCheck')
export const FilterList = adapt(LucideListFilter, 'FilterList')
export const FilterNone = adapt(LucideCopy, 'FilterNone')
export const GetApp = adapt(LucideDownload, 'GetApp')
export const GroupsRounded = adapt(LucideUsers, 'GroupsRounded')
export const HighlightOffRounded = adapt(LucideCircleX, 'HighlightOffRounded')
export const Info = adapt(LucideInfo, 'Info')
export const InsertInvitation = adapt(LucideCalendarDays, 'InsertInvitation')
export const Inventory2Outlined = adapt(LucidePackage, 'Inventory2Outlined')
export const KeyboardArrowDown = adapt(LucideChevronDown, 'KeyboardArrowDown')
export const KeyboardArrowRightRounded = adapt(LucideChevronRight, 'KeyboardArrowRightRounded')
export const KeyboardArrowUp = adapt(LucideChevronUp, 'KeyboardArrowUp')
export const KeyboardDoubleArrowDown = adapt(LucideChevronsDown, 'KeyboardDoubleArrowDown')
export const KeyboardDoubleArrowDownRounded = adapt(LucideChevronsDown, 'KeyboardDoubleArrowDownRounded')
export const KeyboardDoubleArrowUp = adapt(LucideChevronsUp, 'KeyboardDoubleArrowUp')
export const LocationOn = adapt(LucideMapPin, 'LocationOn')
export const Lock = adapt(LucideLock, 'Lock')
export const LockOpen = adapt(LucideLockOpen, 'LockOpen')
export const LockOpenOutlined = adapt(LucideLockOpen, 'LockOpenOutlined')
export const MailOutline = adapt(LucideMail, 'MailOutline')
export const ManageAccountsRounded = adapt(LucideUserCog, 'ManageAccountsRounded')
export const Message = adapt(LucideMessageSquare, 'Message')
export const ModeEditOutlineRounded = adapt(LucidePencil, 'ModeEditOutlineRounded')
export const MoreVert = adapt(LucideEllipsisVertical, 'MoreVert')
export const NotInterested = adapt(LucideBan, 'NotInterested')
export const Paid = adapt(LucideCircleDollarSign, 'Paid')
export const Person = adapt(LucideUser, 'Person')
export const PersonAddAltRounded = adapt(LucideUserPlus, 'PersonAddAltRounded')
export const PersonAddOutlined = adapt(LucideUserPlus, 'PersonAddOutlined')
export const PersonAddRounded = adapt(LucideUserPlus, 'PersonAddRounded')
export const PhoneIphone = adapt(LucideSmartphone, 'PhoneIphone')
export const Print = adapt(LucidePrinter, 'Print')
export const QrCode = adapt(LucideQrCode, 'QrCode')
export const Redo = adapt(LucideRedo2, 'Redo')
export const RemoveRounded = adapt(LucideMinus, 'RemoveRounded')
export const Search = adapt(LucideSearch, 'Search')
export const SearchRounded = adapt(LucideSearch, 'SearchRounded')
export const Send = adapt(LucideSend, 'Send')
export const ShoppingCart = adapt(LucideShoppingCart, 'ShoppingCart')
export const Storefront = adapt(LucideStore, 'Storefront')
export const Style = adapt(LucideTag, 'Style')
export const TimerOutlined = adapt(LucideTimer, 'TimerOutlined')
export const Tune = adapt(LucideSlidersHorizontal, 'Tune')
export const Undo = adapt(LucideUndo2, 'Undo')
export const Visibility = adapt(LucideEye, 'Visibility')
export const VisibilityOff = adapt(LucideEyeOff, 'VisibilityOff')
export const VpnKey = adapt(LucideKeyRound, 'VpnKey')
export const Warning = adapt(LucideTriangleAlert, 'Warning')
export const WarningAmberRounded = adapt(LucideTriangleAlert, 'WarningAmberRounded')
