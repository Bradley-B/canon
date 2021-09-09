import React from 'react';
import { fetchPostContent } from '../../functions/posts';
import styles from './index.module.css';
import { formatDate, compareDate } from '../../functions/util';

const PostList = ({ posts }) => {
  return <>
    <h1>Posts</h1>
    <div className={styles.postContainer}>
      <div className={styles.postLink}>
        <a href="/about">About</a>
        <p>{ formatDate(new Date("2021-08-28")) }</p>
      </div>
      { posts
        .sort((postA, postB) => compareDate(postA.metadata.publishDate, postB.metadata.publishDate))
        .map(({ metadata: { title, publishDate }, filename }) =>
          <div key={title} className={styles.postLink}>
            <a href={`/posts/${filename}`}>
              { title }
            </a>
            <p>{ formatDate(publishDate) }</p>
          </div>
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