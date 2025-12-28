export default function OwnedProducts() {
  return (
    <div className="bg-card/40 border border-white/10 dark:border-white/5 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 dark:border-white/5">
        <h2 className="text-lg font-bold">Produk</h2>
      </div>

      {/* Content */}
      <div className="p-12 text-center">
        <p className="text-muted-foreground">Anda belum membeli produk apapun.</p>
      </div>
    </div>
  )
}
