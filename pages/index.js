// import PostList, { getStaticProps as postsGetStaticProps } from './posts';
import RecipeList, { getStaticProps as recipesGetStaticProps } from './recipes';

const Home = (props) => {
  return <RecipeList recipes={props.recipes} />
}

export const getStaticProps = recipesGetStaticProps;
export default Home;