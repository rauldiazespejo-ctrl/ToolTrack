import { QRCodeSVG } from 'qrcode.react'

type Props = { value: string; size?: number }

export function QRGenerator({ value, size = 200 }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-lg bg-white p-4">
        <QRCodeSVG value={value} size={size} />
      </div>
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{value}</span>
    </div>
  )
}
