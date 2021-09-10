import React from 'react';
import fileContent from '../content/about.md';
import ReactMarkdown from 'react-markdown';
import matter from 'gray-matter';
import rehypeRaw from 'rehype-raw';
import { formatDate } from '../functions/util';

const About = () => {
  const { content: markdownBody, data: metadata } = matter(fileContent);
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

export default About;