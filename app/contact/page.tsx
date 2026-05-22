'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '@/lib/validations';
import { submitContactForm } from '@/lib/api';
import type { z } from 'zod';
import styles from './contact.module.css';

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '' },
  });

  const onSubmit = async (data: ContactForm) => {
    setSubmitting(true);
    setError('');
    try {
      await submitContactForm(data);
      setSubmitted(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.success}>
          <h2>Message Sent!</h2>
          <p>Thank you for reaching out. We will get back to you within 24 hours.</p>
          <button onClick={() => setSubmitted(false)} className={styles.sendAnother}>
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Contact Us</h1>

      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <h2>Send Us a Message</h2>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.inputGroup}>
            <label>Your Name</label>
            <input {...register('name')} />
            {errors.name && <p className={styles.fieldError}>{errors.name.message}</p>}
          </div>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input type="email" {...register('email')} />
            {errors.email && <p className={styles.fieldError}>{errors.email.message}</p>}
          </div>
          <div className={styles.inputGroup}>
            <label>Phone Number</label>
            <input {...register('phone')} />
          </div>
          <div className={styles.inputGroup}>
            <label>Subject</label>
            <select {...register('subject')}>
              <option value="">Select a subject</option>
              <option value="order">Order Inquiry</option>
              <option value="product">Product Question</option>
              <option value="custom">Custom Order</option>
              <option value="return">Return/Exchange</option>
              <option value="other">Other</option>
            </select>
            {errors.subject && <p className={styles.fieldError}>{errors.subject.message}</p>}
          </div>
          <div className={styles.inputGroup}>
            <label>Your Message</label>
            <textarea {...register('message')} rows={5} />
            {errors.message && <p className={styles.fieldError}>{errors.message.message}</p>}
          </div>
          <button type="submit" className={styles.submitButton} disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <div className={styles.info}>
          <h2>Get in Touch</h2>
          <div className={styles.infoItem}>
            <h3>Address</h3>
            <p>Shivanjali Handlooms<br />13-1-144/3, Borabanda - Allapur Rd,<br />Mothi Nagar, Moti Nagar, Borabanda,<br />Hyderabad, Telangana 500114</p>
          </div>
          <div className={styles.infoItem}>
            <h3>Phone</h3>
            <p><a href="tel:+919030444578">+91 9030444578</a></p>
          </div>
          <div className={styles.infoItem}>
            <h3>Email</h3>
            <p><a href="mailto:shivanjalihandlooms@gmail.com">shivanjalihandlooms@gmail.com</a></p>
          </div>
          <div className={styles.infoItem}>
            <h3>WhatsApp</h3>
            <p><a href="https://wa.me/919030444578" target="_blank" rel="noopener noreferrer">Chat with us on WhatsApp</a></p>
          </div>
          <div className={styles.infoItem}>
            <h3>Business Hours</h3>
            <p>Monday - Saturday: 11:00 AM - 9:00 PM<br />Sunday: 2:00 PM - 9:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
