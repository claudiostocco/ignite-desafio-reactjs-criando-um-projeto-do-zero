import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
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

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();
  if (router.isFallback) {
    return <div>Carregando...</div>;
  }
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
              <FiCalendar />
              <time>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
              <FiUser />
              <span>{post.data.author}</span>
              <FiClock />
              <span>{readingTime()} min</span>
            </div>
          </header>
          {post.data.content.map(content => (
            <article className={styles.postContent}>
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
  const response = await prismic.getByUID('posts', String(slug), {});

  // const postContent = {
  //   first_publication_date: response.first_publication_date,
  //   data: {
  //     title: response.data.title,
  //     banner: {
  //       url: response.data.banner,
  //     },
  //     author: response.data.author,
  //     content: response.data.content.map(content => ({
  //       heading: content.heading,
  //       body: content.body.map(body => ({
  //         text: body,
  //       })),
  //     })),
  //   },
  // };

  // console.log(postContent);

  return {
    props: {
      post: response,
    },
    revalidate: 30 * 60, // Minutes
  };
};
