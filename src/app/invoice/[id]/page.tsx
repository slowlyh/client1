'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { QrCode, Clock, FileText, Download, RefreshCw, CheckCircle, XCircle, AlertTriangle, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert } from '@/components/Alert'
import AppFooter from '@/components/AppFooter'
import { toast } from 'sonner'

interface InvoiceItem {
  name: string
  price: number
  quantity: number
  productId: string
  file?: { type: 'local' | 'cloud'; data: string }
}

interface AdditionalInfo {
  name: string
  value: string
}

interface InvoiceData {
  id: string
  email: string
  amount: number
  items: InvoiceItem[]
  qr: string
  status: 'Pending' | 'Paid' | 'Expired' | 'Failed'
  created_at: string
  paid_at?: string
  payment_method: string
  additional_information?: AdditionalInfo[]
  paidAt?: string
  createdAt?: string
  expiresAt?: string
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const invoiceId = params.id as string

  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdownText, setCountdownText] = useState('')
  const [isDownloadExpired, setIsDownloadExpired] = useState(false)

  let countdownInterval: NodeJS.Timeout | null = null
  let paymentCheckInterval: NodeJS.Timeout | null = null
  let expirationCheckInterval: NodeJS.Timeout | null = null

  // Load invoice data
  useEffect(() => {
    if (invoiceId) {
      loadInvoice()
    }

    return () => {
      stopAllIntervals()
    }
  }, [invoiceId])

  const loadInvoice = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      const result = await response.json()

      if (result.status && result.data) {
        const data = result.data as InvoiceData

        // Calculate expiresAt (10 minutes from created_at)
        const createdAt = new Date(data.created_at)
        const expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000).toISOString()

        const invoiceData: InvoiceData = {
          ...data,
          createdAt: data.created_at || createdAt.toISOString(),
          paidAt: data.paid_at || data.paidAt,
          expiresAt
        }

        setInvoice(invoiceData)

        // Start countdown for pending payments
        if (data.status === 'Pending') {
          updateCountdown(expiresAt)
          countdownInterval = setInterval(() => updateCountdown(expiresAt), 1000)
          paymentCheckInterval = setInterval(() => checkPaymentStatus(false), 5000)
        } else if (data.status === 'Paid' && data.paid_at) {
          // Check download expiration
          const expirationHours = 1
          const paidTimestamp = new Date(data.paid_at).getTime()
          const expirationTimestamp = paidTimestamp + (expirationHours * 60 * 60 * 1000)

          if (Date.now() > expirationTimestamp) {
            setIsDownloadExpired(true)
          } else {
            expirationCheckInterval = setInterval(() => {
              const now = Date.now()
              if (now > expirationTimestamp) {
                setIsDownloadExpired(true)
                if (expirationCheckInterval) clearInterval(expirationCheckInterval)
              }
            }, 60000)
          }
        }
      } else {
        throw new Error('Invoice tidak ditemukan')
      }
    } catch (err: any) {
      console.error('Error loading invoice:', err)
      setError(err.message || 'Gagal memuat detail invoice')
      toast.error('Gagal Memuat Invoice', {
        description: err.message || 'Terjadi kesalahan saat memuat invoice'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const stopAllIntervals = () => {
    if (countdownInterval) clearInterval(countdownInterval)
    if (paymentCheckInterval) clearInterval(paymentCheckInterval)
    if (expirationCheckInterval) clearInterval(expirationCheckInterval)
    countdownInterval = null
    paymentCheckInterval = null
    expirationCheckInterval = null
  }

  const updateCountdown = (expiresAtStr: string) => {
    const now = Date.now()
    const expirationTime = new Date(expiresAtStr).getTime()
    const timeDifference = expirationTime - now

    if (timeDifference <= 0) {
      setCountdownText('Waktu Habis')
      if (invoice) {
        setInvoice({ ...invoice, status: 'Expired' })
      }
      stopAllIntervals()
      return
    }

    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000)
    setCountdownText(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
  }

  const checkPaymentStatus = async (isManual: boolean = false) => {
    if (!invoice || invoice.status !== 'Pending') return

    if (isManual) {
      toast.loading('Mengecek status pembayaran...', { id: 'check-payment' })
    }

    try {
      // Call payment status API
      const response = await fetch(`/api/payment/${invoice.id}/status`, {
        method: 'POST'
      })
      const data = await response.json()

      if (data.status && data.data?.status === 'Paid') {
        await loadInvoice()
        toast.success('Pembayaran Berhasil!', {
          description: 'Terima kasih telah melakukan pembayaran.',
          id: 'check-payment'
        })
      } else if (isManual) {
        toast.info('Masih Pending', {
          description: 'Pembayaran untuk invoice ini belum terdeteksi. Silakan tunggu atau pindai QR code.',
          id: 'check-payment'
        })
      }
    } catch (err: any) {
      console.error('Error checking payment:', err)
      if (isManual) {
        toast.error('Gagal Mengecek Status', {
          description: err.message || 'Terjadi kesalahan',
          id: 'check-payment'
        })
      }
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value || 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      Paid: { label: 'Lunas', variant: 'success' as const, bg: ' ' },
      Paid_Lunas: { label: 'Lunas', variant: 'success' as const, bg: ' ' },
      Pending: { label: 'Menunggu Pembayaran', variant: 'warning' as const, bg: ' ' },
      Expired: { label: 'Kadaluwarsa', variant: 'destructive' as const, bg: ' ' },
      Failed: { label: 'Gagal', variant: 'destructive' as const, bg: ' ' }
    }

    return variants[status as keyof typeof variants] || variants.Pending
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      Paid: <CheckCircle className="w-5 h-5" />,
      Paid_Lunas: <CheckCircle className="w-5 h-5" />,
      Pending: <Clock className="w-5 h-5" />,
      Expired: <XCircle className="w-5 h-5" />,
      Failed: <XCircle className="w-5 h-5" />
    }

    return icons[status as keyof typeof icons] || <AlertTriangle className="w-5 h-5" />
  }

  const downloadableItems = invoice?.items.filter(item => item.file) || []

  const calculateFee = () => {
    const itemsTotal = invoice?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
    const total = invoice?.amount || 0
    return total - itemsTotal
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br ">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4  border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg ">Memuat invoice...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br  p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16  rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 " />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold ">Gagal Memuat Invoice</h3>
              <p className="">{error}</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Coba Lagi
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
              >
                <Home className="w-4 h-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invoice) {
    return null
  }

  const statusBadge = getStatusBadge(invoice.status)
  const fee = calculateFee()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br ">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 /95 backdrop-blur-md border-b border-border/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-xl font-bold foreground hover: transition-colors"
              >
                Yilzi Digitalz
              </a>
              <Badge className="bg-gradient-to-r  foreground">
                Invoice
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="foreground hover:"
                onClick={() => window.location.href = '/dashboard'}
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/dashboard'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <div>
              <h1 className="text-3xl font-bold ">Detail Invoice</h1>
              <p className="">Invoice #{invoiceId}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* QR Payment Section */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 " />
                    Pindai untuk Membayar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {invoice.status === 'Pending' ? (
                    <>
                      {/* QR Code */}
                      {invoice.qr && (
                        <div className="bg-background p-4 rounded-lg border ">
                          <img
                            src={invoice.qr}
                            alt="QRIS Payment Code"
                            className="w-full h-auto rounded-md"
                          />
                        </div>
                      )}

                      {/* Timer */}
                      {countdownText && (
                        <Alert
                          variant="warning"
                          message={`Bayar sebelum: ${countdownText}`}
                          className="! !border-yellow-200 !"
                        >
                          <Clock className="w-5 h-5" />
                        </Alert>
                      )}

                      {/* Check Button */}
                      <Button
                        onClick={() => checkPaymentStatus(true)}
                        disabled={isCheckingPayment || invoice.status !== 'Pending'}
                        className="w-full bg-gradient-to-r  foreground"
                      >
                        {isCheckingPayment ? (
                          <>
                            <div className="w-4 h-4 border-2 border-border border-t-transparent rounded-full animate-spin mr-2"></div>
                            Mengecek...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Cek Status Pembayaran
                          </>
                        )}
                      </Button>

                      {/* Instructions */}
                      <div className="space-y-2 text-sm ">
                        <p className="font-semibold">Cara Pembayaran:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Scan QR code dengan aplikasi e-wallet atau M-Banking</li>
                          <li>Masukkan nominal yang sesuai</li>
                          <li>Konfirmasi pembayaran</li>
                          <li>Klik tombol "Cek Status Pembayaran"</li>
                        </ol>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-4 py-8">
                      <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${statusBadge.bg}`}>
                        {getStatusIcon(invoice.status)}
                      </div>
                      <div>
                        <Badge className={statusBadge.bg}>{statusBadge.label}</Badge>
                      </div>
                      {invoice.status === 'Expired' && (
                        <p className="text-sm ">
                          Waktu pembayaran telah habis. Silakan buat pesanan baru.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Invoice Details Section */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 " />
                      Detail Transaksi
                    </div>
                    <Badge className={`${statusBadge.bg} flex items-center gap-2`}>
                      {getStatusIcon(invoice.status)}
                      {statusBadge.label}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Transaction Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm ">ID Transaksi</p>
                      <p className="font-semibold ">{invoice.id}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm ">Email</p>
                      <p className="font-semibold ">{invoice.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm ">Tanggal</p>
                      <p className="font-semibold ">{formatDate(invoice.createdAt || invoice.created_at)}</p>
                    </div>
                    {invoice.paidAt && (
                      <div className="space-y-1">
                        <p className="text-sm ">Dibayar Pada</p>
                        <p className="font-semibold ">{formatDate(invoice.paidAt)}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm ">Metode Pembayaran</p>
                      <p className="font-semibold ">{invoice.payment_method?.toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Additional Information */}
                  {invoice.additional_information && invoice.additional_information.length > 0 && (
                    <>
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold  flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Informasi Pesanan
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {invoice.additional_information.map((info, index) => (
                            <div key={index} className="space-y-1">
                              <p className="text-sm ">{info.name}</p>
                              <p className="font-semibold ">{info.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="border-t " />
                    </>
                  )}

                  {/* Order Summary */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold  flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Ringkasan Pesanan
                    </h3>

                    <div className="space-y-3">
                      {invoice.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex-grow">
                            <p className="font-medium ">
                              {item.name}
                              <span className=" text-sm ml-2">
                                (x{item.quantity})
                              </span>
                            </p>
                          </div>
                          <p className="font-semibold ">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Fee */}
                  {fee > 0 && (
                    <div className="flex justify-between">
                      <p className="">Biaya Penanganan</p>
                      <p className="">{formatCurrency(fee)}</p>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex justify-between items-center py-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg px-4">
                    <p className="text-lg font-bold ">Total Pembayaran</p>
                    <p className="text-2xl font-bold ">
                      {formatCurrency(invoice.amount)}
                    </p>
                  </div>

                  {/* Download Section */}
                  {(invoice.status === 'Paid' || invoice.status === 'Paid_Lunas') ? (
                    <>
                      <div className="border-t " />
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold  flex items-center gap-2">
                          <Download className="w-5 h-5" />
                          File Download
                        </h3>

                        {isDownloadExpired ? (
                          <Alert
                            variant="danger"
                            message="Sesi unduhan telah berakhir. Silakan hubungi admin jika Anda mengalami kendala."
                            className="! ! !"
                          >
                            <AlertTriangle className="w-5 h-5" />
                          </Alert>
                        ) : downloadableItems.length > 0 ? (
                          <div className="space-y-3">
                            {downloadableItems.map((item, index) => (
                              <a
                                key={index}
                                href={item.file?.data}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 foreground">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download {item.name}
                                </Button>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className=" text-sm">
                            Tidak ada file yang tersedia untuk diunduh.
                          </p>
                        )}

                        {/* Download Expiration Warning */}
                        {!isDownloadExpired && invoice.paidAt && (
                          <p className="text-xs ">
                            Link download akan kedaluwarsa dalam 1 jam setelah pembayaran.
                          </p>
                        )}
                      </div>
                    </>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  )
}
