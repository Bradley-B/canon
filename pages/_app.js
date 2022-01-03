import React from 'react';
import Layout from '../components/Layout';
import './styles.css';
import 'highlight.js/styles/a11y-dark.css';

const MyApp = ({ Component, pageProps }) => {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp;