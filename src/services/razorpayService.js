import { config } from '../config';

/**
 * Razorpay Payment Gateway Service
 * Handles client-side Razorpay standard checkout for bills, expenses, and instant settlement.
 */
export const razorpayService = {
  /**
   * Check if Razorpay SDK script is loaded
   */
  isLoaded() {
    return typeof window !== 'undefined' && typeof window.Razorpay === 'function';
  },

  /**
   * Dynamically loads Razorpay checkout script if not present
   */
  loadScript() {
    return new Promise((resolve) => {
      if (this.isLoaded()) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  /**
   * Opens Razorpay payment checkout modal
   * @param {Object} params
   * @param {number} params.amount - Amount in Rupees (converted to paise automatically)
   * @param {string} params.title - Transaction or bill title
   * @param {string} params.description - Notes or bill details
   * @param {string} params.customerName - Name of customer
   * @param {string} params.customerEmail - Customer email
   * @param {Function} params.onSuccess - Callback receiving { razorpay_payment_id }
   * @param {Function} params.onFailure - Callback on error or dismissal
   */
  async openCheckout({
    amount,
    title = 'Expense Settlement',
    description = 'SpendWise Payment',
    customerName = 'Aarav Sharma',
    customerEmail = 'aarav@spendwise.dev',
    onSuccess,
    onFailure,
  }) {
    const loaded = await this.loadScript();
    if (!loaded) {
      if (onFailure) onFailure(new Error('Failed to load Razorpay SDK. Please check your internet connection.'));
      return;
    }

    const key = config.razorpayKeyId;
    if (!key) {
      if (onFailure) onFailure(new Error('Razorpay Key ID is not configured.'));
      return;
    }

    // Convert INR rupees to paise (e.g. ₹500 -> 50000 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    const options = {
      key: key,
      amount: amountInPaise,
      currency: 'INR',
      name: 'SpendWise',
      description: `${title} - ${description || 'Smart Expense Tracker'}`,
      image: 'https://images.unsplash.com/photo-1554415707-9e49017a1430?w=120&h=120&fit=crop',
      handler: function (response) {
        if (onSuccess) {
          onSuccess({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
          });
        }
      },
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: '9999999999',
      },
      theme: {
        color: '#6366f1',
      },
      modal: {
        ondismiss: function () {
          if (onFailure) {
            onFailure(new Error('Payment modal closed by user'));
          }
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        if (onFailure) {
          onFailure(new Error(response.error.description || 'Payment failed'));
        }
      });
      rzp.open();
    } catch (err) {
      if (onFailure) onFailure(err);
    }
  },
};

export default razorpayService;
