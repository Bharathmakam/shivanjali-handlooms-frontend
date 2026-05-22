import styles from '@/app/policy.module.css';

export const metadata = {
  title: 'Returns & Exchange | Shivanjali Handlooms',
  description: 'Return and exchange policy for Shivanjali Handlooms products.',
};

export default function ReturnsPage() {
  return (
    <div className={styles.container}>
      <h1>Returns & Exchange</h1>
      <p className={styles.updated}>Last updated: May 2026</p>

      <section>
        <h2>1. Return Window</h2>
        <p>Returns are accepted within 7 days of delivery. Items must be unused, in original packaging, and with all tags attached.</p>
      </section>

      <section>
        <h2>2. Non-Returnable Items</h2>
        <p>The following items cannot be returned:</p>
        <ul>
          <li>Items with Fall & Pico service applied</li>
          <li>Custom orders made to specific requirements</li>
          <li>Items damaged by the customer after delivery</li>
        </ul>
      </section>

      <section>
        <h2>3. Return Process</h2>
        <p>To initiate a return:</p>
        <ol>
          <li>Contact us via email or WhatsApp within 7 days of delivery</li>
          <li>Provide your order ID and reason for return</li>
          <li>Our team will arrange pickup or provide return shipping instructions</li>
          <li>Refund will be processed within 5-7 business days after we receive the item</li>
        </ol>
      </section>

      <section>
        <h2>4. Refunds</h2>
        <p>Refunds will be issued to the original payment method. Shipping charges are non-refundable unless the return is due to our error.</p>
      </section>

      <section>
        <h2>5. Exchanges</h2>
        <p>Exchanges are subject to product availability. If the desired item is not available, a refund will be issued instead.</p>
      </section>

      <section>
        <h2>6. Damaged Items</h2>
        <p>If you receive a damaged or defective item, please contact us immediately with photos. We will arrange a replacement or full refund.</p>
      </section>

      <section>
        <h2>7. Contact</h2>
        <p>For returns and exchanges: <a href="mailto:info@shivanjali.com">info@shivanjali.com</a> or WhatsApp: +91 98765 43210</p>
      </section>
    </div>
  );
}
