import Head from 'next/head';
import Image from 'next/image';
import styles from './layout.module.css';
import utilStyles from '../styles/utils.module.css';
import Link from 'next/link';

const name = 'Language Dope';
const name1 = 'Language';
const name2 = 'Dope';
export const siteTitle = 'Language Dope';

export default function Layout({ children, home }) {
  return (
    <div className={styles.container}>
      <Head>
        <meta charset="UTF-8"/>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Learn new languages with lightspeed!"
        />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle,
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <header className={styles.header}>
        {home ? (
          <>
            <Image
              priority
              src="/images/lsign.png"
              height={144}
              width={144}
              alt=""
            />
            <div className={styles.subheader}>
                <h1 className={utilStyles.heading2Xl}>{name1}</h1>
                <h1 className={utilStyles.heading2Xl}>{name2}</h1>
            </div>
          </>
        ) : (
          <>
            <Link href="/">
              <Image
                priority
                src="/images/lsign.png"
                height={75}
                width={75}
                alt=""
              />
            </Link>
            <h2 className={utilStyles.headingMd}>
              <Link href="/" className={utilStyles.colorInherit}>
                {name}
              </Link>
            </h2>
          </>
        )}
      </header>
      <main>{children}</main>
      {!home && (
        <div className={styles.backToHome}>
          <Link href="/">← Back to home</Link>
        </div>
      )}
    </div>
  );
}