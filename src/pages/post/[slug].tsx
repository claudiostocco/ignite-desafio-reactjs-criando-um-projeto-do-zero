import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
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

export default function Post() {
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

// export const getStaticPaths = async () => {
//   const prismic = getPrismicClient();
//   const posts = await prismic.query(TODO);

//   // TODO
// };

// export const getStaticProps = async context => {
//   const prismic = getPrismicClient();
//   const response = await prismic.getByUID(TODO);

//   // TODO
// };
