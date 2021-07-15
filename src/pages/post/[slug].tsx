import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

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

export default function Post({ post }: PostProps) {
  return (<>
      <Header />
      <main className={styles.container}>
        <div className={styles.imageContainer}>
          <img src="" alt="" />
        </div>
        <article className={styles.postContainer}>
          <header>
            <h1>post.data.title</h1>
            <div className={styles.info}>
              <FiCalendar />
              <time>{format(new Date(), "dd MMM yyyy", { locale: ptBR })}</time>
              <FiUser />
              <span>post.data.author</span>
              <FiClock />
              <span>4 min</span>
            </div>
          </header>
          <section className={styles.postContent}>

          </section>

        </article>
      </main>
    </>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ],{
    fetch: [],
    pageSize: 100
  });

  return {
    paths: posts.results.map(post => ({params: {slug: post.uid}})),
    fallback: true
  }
};

export const getStaticProps = async context => {
  const {slug} = context.params;
  console.log(slug);

  const prismic = getPrismicClient(context.req);
  const response = await prismic.getByUID('posts',String(slug),{});

  console.log(response.data.content[0].body)

  const postContent = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner
      },
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: RichText.asHtml(content.heading),
        body: content.body.map(body => ({
          text: RichText.asHtml(body.text)
        }))
      }))
    }
  };

  console.log(postContent)

  return {
    props: {

    },
    revalidate: 30 * 60 // Minutes
  }
};
