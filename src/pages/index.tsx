import Link from 'next/link'
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi'

import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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

function temBotao(next_page) {
  console.log(next_page)
  return (
    next_page ?
      <div>
        <a href="#">Carregar mais posts</a>
      </div>
    : ''
  )
}

export default function Home({ postsPagination }: HomeProps) {
  const { results, next_page } = postsPagination;
  console.log('1',next_page)
  console.log('2',postsPagination.next_page)

  return (
    <main className={styles.container}>
      <div className={styles.logo}>
        <img src="/images/logo.svg" alt="Logo" />
      </div>
      <div className={styles.postContent}>
        {results.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a>
              <article>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div>
                  <FiCalendar/>
                  <time>{post.first_publication_date}</time>
                  <FiUser/>
                  <span>{post.data.author}</span>
                </div>
              </article>
            </a>
          </Link>
        ))}
        {temBotao(next_page)}
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
    pageSize: 2
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(new Date(post.first_publication_date),"'Hoje é' eeee",{locale: ptBR}),
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
