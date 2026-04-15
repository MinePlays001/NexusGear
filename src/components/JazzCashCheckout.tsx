import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { createOrder, JAZZCASH_NUMBER, JAZZCASH_NAME } from '../lib/orders'
import { getCurrentUser, isUserAuthenticated } from '../lib/userAuth'
import type { Product } from '../lib/types'

interface JazzCashCheckoutProps {
  product: Product
  onClose: () => void
}

export default function JazzCashCheckout({ product, onClose }: JazzCashCheckoutProps) {
  const navigate = useNavigate()
  const [transactionId, setTransactionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'instructions' | 'confirm'>('instructions')

  const user = getCurrentUser()

  const handleConfirmPayment = async () => {
    if (!transactionId.trim()) {
      setError('Please enter your JazzCash Transaction ID')
      return
    }

    if (!isUserAuthenticated() || !user) {
      navigate({ to: '/login' })
      return
    }

    setLoading(true)
    setError('')

    try {
      await createOrder(
        product.id,
        product.name,
        product.price,
        user.email,
        user.name,
        transactionId
      )

      // Show success message
      alert(`🎉 Order placed successfully!\n\nYou will receive your ${product.name} details at ${user.email} within 24 hours.\n\nOrder confirmation has been sent to admin.`)
      
      onClose()
      navigate({ to: '/' })
    } catch (err) {
      setError('Failed to process order. Please try again.')
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">JazzCash Payment</h2>
            <p className="text-gray-400 text-sm mt-1">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {step === 'instructions' && (
          <div className="space-y-4">
            <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-2">📱 Payment Instructions</h3>
              <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                <li>Open your JazzCash app</li>
                <li>Send <span className="font-bold text-white">Rs. {product.price}</span> to:</li>
              </ol>
              
              <div className="mt-3 bg-black/40 rounded p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Number:</span>
                  <span className="text-white font-mono font-bold">{JAZZCASH_NUMBER}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Name:</span>
                  <span className="text-white font-semibold">{JAZZCASH_NAME}</span>
                </div>
              </div>

              <ol start={3} className="text-gray-300 text-sm space-y-2 list-decimal list-inside mt-3">
                <li>Copy the Transaction ID from JazzCash</li>
                <li>Come back and enter it below</li>
              </ol>
            </div>

            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3">
              <p className="text-yellow-200 text-sm">
                ⚠️ Make sure to send the <strong>exact amount</strong> and save your Transaction ID!
              </p>
            </div>

            <button
              onClick={() => setStep('confirm')}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg transition-all duration-200"
            >
              I've Sent the Payment →
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Product:</span>
                <span className="text-white font-semibold">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount Paid:</span>
                <span className="text-green-400 font-bold">Rs. {product.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Your Email:</span>
                <span className="text-white text-sm">{user?.email}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                JazzCash Transaction ID *
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g., JC1234567890"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-400 text-xs mt-1">
                Find this in your JazzCash app transaction history
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('instructions')}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>

            <p className="text-gray-400 text-xs text-center">
              Account details will be sent to your email within 24 hours
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
