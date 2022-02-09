import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter"/>
        <title>Canon</title>
      </Head>
      <nav className={styles.navbar} >
        <Link href='/posts'><a>Posts</a></Link>
        <Link href='/recipes'><a>Recipes</a></Link>
        <Link href='/about'><a>About</a></Link>
      </nav>
      <div className={styles.layout}>
        <div>
          {children}
        </div>
      </div>
    </>
  );
}

export default Layout;