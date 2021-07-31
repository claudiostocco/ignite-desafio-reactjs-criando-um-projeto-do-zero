import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Link from 'next/link';

import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

export type SiblingPost = {
  title: string;
  slug: string;
};

interface PostProps {
  priorPost?: SiblingPost;
  nextPost?: SiblingPost;
  post: Post;
}

export default function Post({
  priorPost = null,
  nextPost = null,
  post,
}: PostProps): JSX.Element {
  const router = useRouter();
  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const script = document.createElement('script');
    const anchor = document.getElementById('inject-comments-for-uterances');
    script.setAttribute('src', 'https://utteranc.es/client.js');
    script.setAttribute('crossorigin', 'anonymous');
    script.setAttribute('async', '');
    script.setAttribute('repo', 'claudiostocco/ignite-utterances');
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('theme', 'github-light');
    anchor.appendChild(script);
  }, []);

  function readingTime(): number {
    const qtd = post.data.content.reduce((acc, contentValue) => {
      const qtdHeading = contentValue.heading.split(/\s/g).length;

      const qtdBody = contentValue.body.reduce((accBody, valueBody) => {
        const bodyWords = valueBody.text.split(/\s/g).length;
        return accBody + bodyWords;
      }, 0);

      return qtdHeading + qtdBody;
    }, 0);
    return Math.ceil(qtd / 200) + 1;
  }

  return (
    <>
      <Header />
      <main className={styles.container}>
        <div className={styles.imageContainer}>
          <img src={post.data.banner.url} alt="" />
        </div>
        <section className={styles.postContainer}>
          <header>
            <h1>{post.data.title}</h1>
            <div className={styles.info}>
              <div>
                <FiCalendar />
                <time>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
                <FiUser />
                <span>{post.data.author}</span>
                <FiClock />
                <span>{readingTime()} min</span>

                <div>
                  <span>
                    * editado em
                    {format(
                      new Date(post.last_publication_date),
                      ' dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {post.data.content.map(content => (
            <article key={content.heading} className={styles.postContent}>
              <h2>{content.heading}</h2>
              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </article>
          ))}
        </section>

        <section className={styles.postContainer}>
          <hr />
          <div className={styles.navegacao}>
            <span>
              {priorPost && (
                <>
                  <p>{priorPost.title}</p>
                  <Link href={priorPost.slug}>
                    <a>Post anterior</a>
                  </Link>
                </>
              )}
            </span>
            <span>
              {nextPost && (
                <>
                  <p>{nextPost.title}</p>
                  <Link href={nextPost.slug}>
                    <a>Próximo post</a>
                  </Link>
                </>
              )}
            </span>
          </div>
        </section>
        <section>
          <div id="inject-comments-for-uterances" />
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: [],
      pageSize: 100,
    }
  );

  return {
    paths: posts.results.map(post => ({ params: { slug: post.uid } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: [],
      pageSize: 100,
    }
  );
  // const allPosts = posts.results.map(post => ({title: post.data.title, slug: post.uid }));
  // console.log(allPosts);

  let priorPost: SiblingPost = null;
  let nextPost: SiblingPost = null;
  posts.results.forEach((post, i, allPosts) => {
    if (post.uid === slug) {
      if (i > 0) {
        priorPost = {
          title: allPosts[i - 1].data.title,
          slug: allPosts[i - 1].uid,
        };
      }
      if (i < allPosts.length - 1) {
        nextPost = {
          title: allPosts[i + 1].data.title,
          slug: allPosts[i + 1].uid,
        };
      }
    }
  });

  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response,
      priorPost,
      nextPost,
    },
    revalidate: 30 * 60, // Minutes
  };
};
