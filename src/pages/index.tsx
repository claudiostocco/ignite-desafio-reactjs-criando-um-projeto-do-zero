import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client'
import { Link, RichText } from 'prismic-dom';
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { FaCalendar, FaClock, FaUser } from 'react-icons/fa'

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

export default function Home({ postsPagination }: HomeProps) {
  const { results } = postsPagination;
  return (
    <main>
      {results.map(post => (
        <Link key={post.uid} href={`/post/${post.uid}`}>
          <a>
            <article>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div>
                <FaCalendar/>
                <time>{post.first_publication_date}</time>
                <FaUser/>
                <span>{post.data.author}</span>
              </div>
            </article>
          </a>
        </Link>
      ))}
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
