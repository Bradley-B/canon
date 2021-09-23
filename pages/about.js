import React from 'react';
import ReactMarkdown from 'react-markdown';
import matter from 'gray-matter';
import rehypeRaw from 'rehype-raw';
import { formatDate, serializeDateValues } from '../functions/util';

const About = ({ post }) => {
  const { content: markdownBody, data: metadata } = post;
  const { title, publishDate, lastModifiedDate } = metadata;

  return (
    <>
      <p>Posted on { formatDate(publishDate) }. Last modified on { formatDate(lastModifiedDate) }.</p>
      <article>
        <h1>{title}</h1>
        <ReactMarkdown children={markdownBody} rehypePlugins={[rehypeRaw]} />
      </article>
    </>
  );
};

export const getStaticProps = async () => {
  const module = await import('../content/about.md');
  let { content, data: metadata } = matter(module.default);
  serializeDateValues(metadata);

  return {
    props: {
      post: { content, data: metadata }
    }
  };
};

export default About;