import styles from '@/app/policy.module.css';

export const metadata = {
  title: 'FAQ | Shivanjali Handlooms',
  description: 'Frequently asked questions about Shivanjali Handlooms products and services.',
};

export default function FAQPage() {
  const faqs = [
    {
      question: 'What is Fall & Pico service?',
      answer: 'Fall & Pico is a finishing service where a protective border (fall) is sewn to the saree pallu and edges are finished with pico stitching. This enhances durability and gives a polished look. Items with this service are non-returnable.',
    },
    {
      question: 'Are your products genuine handloom?',
      answer: 'Yes, all our products are authentic handloom items sourced directly from weavers. We work with certified weavers across Andhra Pradesh, Telangana, and Tamil Nadu.',
    },
    {
      question: 'How do I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking number via email and SMS. You can also track your order from the Orders page in your account.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept online payments via Razorpay (credit/debit cards, UPI, net banking) and Cash on Delivery (COD) on eligible orders.',
    },
    {
      question: 'Is Cash on Delivery available everywhere?',
      answer: 'COD is available in most areas but may not be available for certain pin codes or orders below ₹500. You can check COD eligibility during checkout by entering your pin code.',
    },
    {
      question: 'What is your return policy?',
      answer: 'We accept returns within 7 days of delivery for unused items in original packaging. Items with Fall & Pico service and custom orders are non-returnable.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Orders are processed within 2-3 business days and delivered within 5-7 business days after dispatch. Remote areas may take longer.',
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Currently, we only ship within India. We are working on expanding to international shipping in the future.',
    },
    {
      question: 'Can I customize a saree?',
      answer: 'Yes, we accept custom orders for specific colors, patterns, and designs. Please contact us via WhatsApp or email to discuss your requirements.',
    },
    {
      question: 'Why do handloom items have slight variations?',
      answer: 'Handloom items are handcrafted, so slight variations in color, pattern, and texture are natural and add to the uniqueness of each piece. These are not defects.',
    },
  ];

  return (
    <div className={styles.container}>
      <h1>Frequently Asked Questions</h1>
      <p className={styles.updated}>Find answers to common questions about our products and services.</p>

      {faqs.map((faq, index) => (
        <section key={index}>
          <h2>{index + 1}. {faq.question}</h2>
          <p>{faq.answer}</p>
        </section>
      ))}

      <section>
        <h2>Still have questions?</h2>
        <p>Contact us at <a href="mailto:info@shivanjali.com">info@shivanjali.com</a> or WhatsApp: +91 98765 43210</p>
      </section>
    </div>
  );
}
