import { fetchPostContent } from '../../functions/posts';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import React from 'react';
import { formatDate } from '../../functions/util';

const Post = ({ post: { content, metadata } }) => {
  const { title, publishDate } = metadata;

  return (
    <>
      <p>Posted on { formatDate(JSON.parse(publishDate)) }.</p>
      <article>
        <h1>{title}</h1>
        <ReactMarkdown children={content} rehypePlugins={[rehypeRaw]} />
      </article>
    </>
  );
};

export const getStaticPaths = async () => {
  const postData = await fetchPostContent();

  return {
    paths: postData.map(post => `/posts/${post.filename}`),
    fallback: false
  };
};

export const getStaticProps = async ({ params }) => {
  const postData = await fetchPostContent();
  const foundPost = postData.find(post => params.id === post.filename);

  return {
    props: {
      post: foundPost
    }
  };
};

export default Post;