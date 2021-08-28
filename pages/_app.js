import React from 'react';
import Layout from '../components/Layout';
import './styles.css';

const MyApp = ({ Component, pageProps }) => {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp;