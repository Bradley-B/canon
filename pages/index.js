import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace('/posts', '/');
  });
  return <></>;
}

export default Home;