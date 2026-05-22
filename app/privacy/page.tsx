import styles from '@/app/policy.module.css';

export const metadata = {
  title: 'Privacy Policy | Shivanjali Handlooms',
  description: 'Learn how Shivanjali Handlooms collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <h1>Privacy Policy</h1>
      <p className={styles.updated}>Last updated: May 2026</p>

      <section>
        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly, including:</p>
        <ul>
          <li>Name, email address, and phone number during registration</li>
          <li>Shipping address for order fulfillment</li>
          <li>Payment information (processed securely through Razorpay)</li>
          <li>Order history and preferences</li>
        </ul>
      </section>

      <section>
        <h2>2. How We Use Your Information</h2>
        <p>Your information is used to:</p>
        <ul>
          <li>Process and fulfill your orders</li>
          <li>Communicate order updates and customer support</li>
          <li>Improve our products and services</li>
          <li>Send promotional communications (with your consent)</li>
        </ul>
      </section>

      <section>
        <h2>3. Data Security</h2>
        <p>We implement appropriate security measures to protect your personal information. Payment processing is handled by Razorpay, a PCI-DSS compliant payment gateway.</p>
      </section>

      <section>
        <h2>4. Data Sharing</h2>
        <p>We do not sell your personal information. We may share data with:</p>
        <ul>
          <li>Payment processors (Razorpay) for transaction processing</li>
          <li>Logistics partners for order delivery</li>
          <li>Legal authorities when required by law</li>
        </ul>
      </section>

      <section>
        <h2>5. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal data. Contact us at <a href="mailto:info@shivanjali.com">info@shivanjali.com</a> for any privacy-related requests.</p>
      </section>

      <section>
        <h2>6. Contact Us</h2>
        <p>For any privacy concerns, please contact:</p>
        <p>Email: <a href="mailto:info@shivanjali.com">info@shivanjali.com</a><br />Phone: +91 98765 43210</p>
      </section>
    </div>
  );
}
