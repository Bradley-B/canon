import { fetchPostContent } from '../../functions/posts';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import React, { useEffect } from 'react';
import { formatDate } from '../../functions/util';

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);
// register more languages here

const Post = ({ post: { content, metadata } }) => {
  const { title, publishDate, lastModifiedDate } = metadata;

  const formattedPublishDate = formatDate(publishDate);
  const formattedLastModifiedDate = formatDate(lastModifiedDate);

  let dateLine = `Posted on ${formattedPublishDate}.`;
  if (formattedPublishDate !== formattedLastModifiedDate) {
    dateLine += ` Revised ${formattedLastModifiedDate}.`;
  }

  useEffect(() => {
    hljs.initHighlighting();
  }, []);

  return (
    <>
      <p>{dateLine}</p>
      <article>
        <h1>{title}</h1>
        <ReactMarkdown children={content} rehypePlugins={[rehypeRaw]} />
        <p style={{ marginBottom: 100 }}/>
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