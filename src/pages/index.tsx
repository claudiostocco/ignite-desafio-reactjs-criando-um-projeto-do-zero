import Link from 'next/link'
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client'
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { FiCalendar, FiUser } from 'react-icons/fi'

import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [postsPage,setPostsPage] = useState(postsPagination)
  //const { results, next_page } = postsPage;

  const chargeMorePosts = async () => {
    if (postsPage.next_page) {
      const response = await fetch(postsPage.next_page)
      if (response.status === 200) {
        const postsResponse = await response.json()
        const posts = postsResponse.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author
            }
          }
        })
      
        const newPagination = {
          next_page: postsResponse.next_page,
          results: [...postsPage.results,...posts]
        }
      
        console.log(newPagination)
        setPostsPage(newPagination)
      }
    }
  }
  
  return (
    <main className={styles.container}>
      <div className={styles.logo}>
        <img src="/images/logo.svg" alt="logo" />
      </div>
      <div className={styles.postContent}>
        {postsPage.results.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a>
              <article>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div className={styles.info}>
                  <FiCalendar/>
                  <time>{format(new Date(post.first_publication_date),"dd MMM yyyy",{locale: ptBR})}</time>
                  <FiUser/>
                  <span>{post.data.author}</span>
                </div>
              </article>
            </a>
          </Link>
        ))}
        {postsPage.next_page && (
          <button className={styles.botaoCarregar} href="#" onClick={chargeMorePosts}>
            Carregar mais posts
          </button>
        )}
      </div>
    </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ],{
    fetch: ['posts.title','posts.subtitle','posts.author'],
    pageSize: 1
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })

  // title: RichText.asText(post.data.title),
  // subtitle: RichText.asText(post.data.subtitle),
  // author: RichText.asText(post.data.author)

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts
  }

  console.log(postsPagination)

  return {
    props: {
      postsPagination
    },
    revalidate: 30 * 60 // 30 minutes
  }
};
