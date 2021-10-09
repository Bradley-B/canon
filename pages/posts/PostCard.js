import React from 'react';
import styles from './PostCard.module.css';

const PostCard = ({ title, href, date }) => {
  return <div className={styles.cardContainer}>
    <div className={styles.card}>
      <a href={href}>
        <p className={styles.cardTitle}>{title}</p>
        <p className={styles.cardDate}>{date}</p>
      </a>
      <div className={styles.cardBorder}/>
    </div>
  </div>
}

export default PostCard;