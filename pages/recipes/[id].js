import { fetchRecipeContent} from '../../functions/recipes';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import React from 'react';
import { formatDate } from '../../functions/util';

const Recipe = ({ recipe: { content, metadata } }) => {
  const { title, publishDate, lastModifiedDate } = metadata;

  const formattedPublishDate = formatDate(publishDate);
  const formattedLastModifiedDate = formatDate(lastModifiedDate);

  let dateLine = `Posted on ${formattedPublishDate}.`;
  if (formattedPublishDate !== formattedLastModifiedDate) {
    dateLine += ` Revised ${formattedLastModifiedDate}.`;
  }

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
  const recipeData = await fetchRecipeContent();

  return {
    paths: recipeData.map(recipe => `/recipes/${recipe.filename}`),
    fallback: false
  };
};

export const getStaticProps = async ({ params }) => {
  const recipeData = await fetchRecipeContent();
  const foundRecipe = recipeData.find(recipe => params.id === recipe.filename);

  return {
    props: {
      recipe: foundRecipe
    }
  };
};

export default Recipe;