import { Component } from 'react';
import { attributes, react as HomeContent } from '../content/home.md';

export default class Home extends Component {
  render() {
    let { title, cats } = attributes;
    return (
      <>
        <article>
          <h1>{title}</h1>
          <HomeContent />
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