import styles from '@/app/policy.module.css';

export const metadata = {
  title: 'Shipping Policy | Shivanjali Handlooms',
  description: 'Shipping information and delivery details for Shivanjali Handlooms orders.',
};

export default function ShippingPage() {
  return (
    <div className={styles.container}>
      <h1>Shipping Policy</h1>
      <p className={styles.updated}>Last updated: May 2026</p>

      <section>
        <h2>1. Shipping Areas</h2>
        <p>We ship across India. International shipping is currently not available.</p>
      </section>

      <section>
        <h2>2. Processing Time</h2>
        <p>Orders are processed within 2-3 business days. Custom orders or items with Fall & Pico service may take additional time.</p>
      </section>

      <section>
        <h2>3. Delivery Time</h2>
        <p>Standard delivery takes 5-7 business days after dispatch. Remote areas may take longer.</p>
      </section>

      <section>
        <h2>4. Shipping Charges</h2>
        <p>Free shipping on orders above ₹5,000. Orders below ₹5,000 incur a flat shipping charge of ₹150.</p>
      </section>

      <section>
        <h2>5. Order Tracking</h2>
        <p>Once your order is shipped, you will receive a tracking number via email and SMS. You can also track your order from your account dashboard.</p>
      </section>

      <section>
        <h2>6. Delivery Issues</h2>
        <p>If your order is delayed or you have not received it within the expected timeframe, please contact our customer support.</p>
      </section>

      <section>
        <h2>7. Contact</h2>
        <p>For shipping inquiries: <a href="mailto:info@shivanjali.com">info@shivanjali.com</a> or WhatsApp: +91 98765 43210</p>
      </section>
    </div>
  );
}
