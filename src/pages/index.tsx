import Link from 'next/link';
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';

import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { SiblingPost } from './post/[slug]';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
  priorPost?: SiblingPost;
  nextPost?: SiblingPost;
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview?: boolean;
}

export default function Home({ postsPagination, preview = false }: HomeProps): JSX.Element {
  const [postsPage, setPostsPage] = useState(postsPagination);

  const chargeMorePosts = async () => {
    if (postsPage.next_page) {
      const response = await fetch(postsPage.next_page);
      // if (response.status === 200) {
      const postsResponse = await response.json();
      const posts = postsResponse.results.map(post => {
        return {
          uid: post.uid,
          first_publication_date: post.first_publication_date,
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          }
        }
      });
      setPostsPage(oldPagination => ({
        next_page: postsResponse.next_page,
        results: [...oldPagination.results, ...posts]
      }));
      // }
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
                  <FiCalendar />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      { locale: ptBR }
                    )}
                  </time>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>
              </article>
            </a>
          </Link>
        ))}

        {postsPage.next_page && (
          <button
            type="button"
            className={styles.botaoCarregar}
            onClick={chargeMorePosts}
          >
            Carregar mais posts
          </button>
        )}

        {preview && (
          <aside>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </div>
    </main>
  )
}

export const getStaticProps: GetStaticProps = async ({ preview = false, previewData, }) => {
  console.log('preview', preview);
  console.log('previewData', previewData);

  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
      ref: previewData?.ref ?? null,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return {
    props: {
      postsPagination,
      preview,
    },
    revalidate: 30 * 60, // 30 minutes
  };
};
