import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import { serializeDateValues } from './util';

const recipeDirectory = path.join(process.cwd(), 'content/recipes');

let recipeCache;

const fetchRecipeContent = async () => {
  if (recipeCache) {
    return recipeCache;
  }

  const recipeFileNames = fs.readdirSync(recipeDirectory);
  const allContent = await Promise.all(recipeFileNames.map(filename => import(`../content/recipes/${filename}`)));

  const cleanedContent = allContent.map((module, index) => {
    let { content, data: metadata } = matter(module.default);

    // next.js refuses to serialize Date types, so do it manually
    serializeDateValues(metadata)

    const filename = recipeFileNames[index].substr(0, recipeFileNames[index].length - 3);
    return { filename, content, metadata };
  }).filter(recipe => recipe.metadata.isPublished);

  recipeCache = cleanedContent;
  return cleanedContent;
};

export { fetchRecipeContent };