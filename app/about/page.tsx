import Link from 'next/link';
import styles from './about.module.css';

export const metadata = {
  title: 'Our Story | Shivanjali Handlooms',
  description: 'Discover the heritage and craftsmanship behind Shivanjali Handlooms traditional weaves.',
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1>Our Story</h1>
        <p>Preserving the art of traditional Indian handloom weaving for generations to come.</p>
      </section>

      <section className={styles.section}>
        <div className={styles.content}>
          <h2>Heritage & Craft</h2>
          <p>
            Shivanjali Handlooms was born from a deep reverence for India&apos;s rich textile heritage.
            For generations, our weavers have practiced the ancient art of handloom weaving, creating
            fabrics that tell stories of tradition, culture, and unparalleled craftsmanship.
          </p>
          <p>
            Each saree in our collection is a testament to the skill and dedication of our artisans.
            From the intricate Gadwal silk sarees to the vibrant Pochampally Ikat patterns, every piece
            is woven with love and precision on traditional handlooms.
          </p>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.content}>
          <h2>Our Weavers</h2>
          <p>
            We work directly with skilled weavers across Andhra Pradesh, Telangana, and Tamil Nadu.
            Our partnerships ensure fair wages, sustainable practices, and the preservation of
            centuries-old weaving techniques.
          </p>
          <p>
            Every weaver in our network is a master of their craft, having inherited their skills
            through generations of family tradition. By choosing Shivanjali, you support these
            artisans and help keep this beautiful art form alive.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.content}>
          <h2>Our Promise</h2>
          <ul className={styles.promises}>
            <li>
              <strong>Authenticity:</strong> Every piece is genuinely handloom, certified and verified.
            </li>
            <li>
              <strong>Quality:</strong> We maintain the highest standards in materials and craftsmanship.
            </li>
            <li>
              <strong>Fair Trade:</strong> Our weavers receive fair compensation for their exceptional work.
            </li>
            <li>
              <strong>Sustainability:</strong> We use eco-friendly dyes and sustainable practices.
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.cta}>
        <h2>Experience the Art of Handloom</h2>
        <p>Explore our curated collection of authentic handloom sarees.</p>
        <Link href="/shop" className={styles.shopButton}>
          Shop Collection
        </Link>
      </section>
    </div>
  );
}
