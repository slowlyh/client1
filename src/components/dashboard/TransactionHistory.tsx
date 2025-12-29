import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function TransactionHistory() {
  return (
    <div className="bg-card/40 border border-white/10 dark:border-white/5 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 dark:border-white/5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold">Riwayat Transaksi</h2>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari transaksi..."
              className="pl-9 h-10 bg-background/50 border-white/10 dark:border-white/5 text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-12 text-center">
        <p className="text-muted-foreground">Tidak ada transaksi ditemukan.</p>
      </div>
    </div>
  )
}
