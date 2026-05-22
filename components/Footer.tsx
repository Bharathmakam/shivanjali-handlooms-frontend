import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.footerTopContent}>
          <div className={styles.footerBrand}>
            <h3>Shivanjali</h3>
            <p>Preserving the art of traditional Indian handloom weaving. Each piece tells a story of heritage, craftsmanship, and authenticity.</p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Instagram">IG</a>
              <a href="#" className={styles.socialLink} aria-label="Facebook">FB</a>
              <a href="#" className={styles.socialLink} aria-label="Pinterest">PT</a>
              <a href="#" className={styles.socialLink} aria-label="YouTube">YT</a>
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/shop">Shop</Link></li>
              <li><Link href="/about">Our Story</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h4>Customer Care</h4>
            <ul>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/shipping">Shipping Policy</Link></li>
              <li><Link href="/returns">Returns & Exchange</Link></li>
              <li><Link href="/orders">Track Order</Link></li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h4>Contact Us</h4>
            <ul>
              <li><a href="mailto:info@shivanjali.com">info@shivanjali.com</a></li>
              <li><a href="tel:+919876543210">+91 98765 43210</a></li>
              <li><a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.footerBottomContent}>
          <p>&copy; {new Date().getFullYear()} Shivanjali Handlooms. All rights reserved.</p>
          <div className={styles.footerBottomLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
