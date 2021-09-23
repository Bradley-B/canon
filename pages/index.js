import PostList, { getStaticProps as postsGetStaticProps } from './posts';

const Home = ({ posts }) => {
  return <PostList posts={posts} />
}

export const getStaticProps = postsGetStaticProps;
export default Home;