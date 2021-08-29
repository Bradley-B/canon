import { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import matter from 'gray-matter';
import fileContent from '../content/home.md';

export default class Home extends Component {
  render() {
    const { content: markdownBody, data: metadata } = matter(fileContent);
    const { title, cats } = metadata;
    return (
      <>
        <article>
          <h1>{title}</h1>
          <ReactMarkdown children={markdownBody} />
          <ul>
            {cats.map((cat, k) => (
              <li key={k}>
                <h2>{cat.name}</h2>
                <p>{cat.description}</p>
              </li>
            ))}
          </ul>
        </article>
      </>
    )
  }
}