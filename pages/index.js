import Head from 'next/head';
import Loader from '../components/loader';

export default function Home() {
  return (
    <>
      <Head>
        <title>Nintendo Switch Payload Loader</title>
        <meta name="description" content="Nintendo Switch Payload Loader" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Loader />
    </>
  );
}
