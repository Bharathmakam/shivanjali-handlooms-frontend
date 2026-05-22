import styles from '@/app/policy.module.css';

export const metadata = {
  title: 'Terms & Conditions | Shivanjali Handlooms',
  description: 'Terms and conditions for using Shivanjali Handlooms services.',
};

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <h1>Terms & Conditions</h1>
      <p className={styles.updated}>Last updated: May 2026</p>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using the Shivanjali Handlooms website, you accept and agree to be bound by these terms and conditions.</p>
      </section>

      <section>
        <h2>2. Products</h2>
        <p>All products are handloom items and may have slight variations in color, pattern, and texture. These variations are characteristic of handcrafted items and are not defects.</p>
      </section>

      <section>
        <h2>3. Pricing</h2>
        <p>All prices are in Indian Rupees (INR) and include applicable taxes. Prices are subject to change without notice.</p>
      </section>

      <section>
        <h2>4. Orders</h2>
        <p>We reserve the right to refuse or cancel any order for any reason. Order confirmation does not constitute acceptance of your order.</p>
      </section>

      <section>
        <h2>5. Payment</h2>
        <p>Payment must be made at the time of order through our secure payment gateway (Razorpay) or via Cash on Delivery where available.</p>
      </section>

      <section>
        <h2>6. Limitation of Liability</h2>
        <p>Shivanjali Handlooms shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.</p>
      </section>

      <section>
        <h2>7. Governing Law</h2>
        <p>These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Telangana.</p>
      </section>
    </div>
  );
}
