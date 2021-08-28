import React from 'react';
import { attributes, react as AboutContent } from '../content/about.md';
import Comment from '../components/Comment';

const Home = () => {
  const { title, publishDate } = attributes;
  const dateDisplayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  const formatDate = () => new Date(publishDate).toLocaleDateString("en-US", dateDisplayOptions);

  return (
    <>
      <p>Posted on { formatDate(publishDate) }.</p>
      <article>
        <h1>{title}</h1>
        <AboutContent Comment={Comment}/>
      </article>
    </>
  );
};

export default Home;