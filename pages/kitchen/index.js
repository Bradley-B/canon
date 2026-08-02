import React, { useLayoutEffect, useState } from 'react';
import { fetchRecipeContent } from '../../functions/kitchen';
import styles from './index.module.css';
import { formatDate, compareDate } from '../../functions/util';

const calcMargins = r => r.map(() => (Math.random() * 60) - 30);

const RecipeList = ({ recipes }) => {
  recipes.sort((recipeA, recipeB) => compareDate(recipeA.metadata.publishDate, recipeB.metadata.publishDate));

  return <>
    <h1>Test Kitchen</h1>
    Recipes I want to try or have tried, but have not made it to regular rotation.
    <div className={styles.recipeContainer}>
      {
        recipes.map(({ metadata: { title, publishDate }, filename }, i) =>
          <div key={title} className={styles.recipeLink}>
            <a href={`/kitchen/${filename}`}>
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