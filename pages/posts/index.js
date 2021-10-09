import React from 'react';
import { fetchPostContent } from '../../functions/posts';
import styles from './index.module.css';
import { formatDate, compareDate } from '../../functions/util';
import PostCard from './PostCard';

const PostList = ({ posts }) => {
  return <>
    <h1>Posts</h1>
    <div className={styles.postContainer}>
      <PostCard title={'About'} date={formatDate(new Date('2021-08-28'))} href={'/about'}/>
      { posts
        .sort((postA, postB) => compareDate(postA.metadata.publishDate, postB.metadata.publishDate))
        .map(({ metadata: { title, publishDate }, filename }) =>
          <PostCard key={title} title={title} date={formatDate(publishDate)} href={`/posts/${filename}`}/>
        )
      }
    </div>
  </>;
};

export const getStaticProps = async () => {
  const posts = await fetchPostContent();

  return {
    props: { posts }
  };
};

export default PostList;