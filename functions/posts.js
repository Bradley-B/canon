import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/posts');

let postCache;

const fetchPostContent = async () => {
  if (postCache) {
    return postCache;
  }

  const postFileNames = fs.readdirSync(postsDirectory);
  const allContent = await Promise.all(postFileNames.map(filename => import(`../content/posts/${filename}`)));

  const cleanedContent = allContent.map((module, index) => {
    let { content, data: metadata } = matter(module.default);

    // next.js refuses to serialize Date types, so do it manually
    for (const [key, value] of Object.entries(metadata)) {
      if (value instanceof Date ) {
        metadata[key] = JSON.stringify(value);
      }
    }

    const filename = postFileNames[index].substr(0, postFileNames[index].length - 3);
    return { filename, content, metadata };
  });

  postCache = cleanedContent;
  return cleanedContent;
};

export { fetchPostContent };