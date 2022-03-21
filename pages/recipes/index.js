import React from 'react';
import { fetchRecipeContent } from '../../functions/recipes';
import styles from './index.module.css';
import { formatDate, compareDate } from '../../functions/util';

const RecipeList = ({ recipes }) => {
  recipes.sort((recipeA, recipeB) => compareDate(recipeA.metadata.publishDate, recipeB.metadata.publishDate));
  recipes.unshift(recipes.pop());
  return <>
    <h1>Recipes</h1>
    <div className={styles.recipeContainer}>
      {
        recipes.map(({ metadata: { title, publishDate }, filename }) =>
          <div key={title} className={styles.recipeLink}>
            <a href={`/recipes/${filename}`}>
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
  const recipes = await fetchRecipeContent();

  return {
    props: { recipes }
  };
};

export default RecipeList;