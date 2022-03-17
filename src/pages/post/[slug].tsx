import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/Header';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { RichText } from 'prismic-dom';

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
  const router = useRouter();

  if(router.isFallback) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | Ignews</title>
      </Head>

      <Header />
      <main className={styles.container}>
        <img src={post.data.banner.url} alt="banner" />

        <article className={styles.post}>

          <h1>{post.data.title}</h1>

          <div className={commonStyles.info}>
            <div>
              <FiCalendar className={commonStyles.icon}/>
              <time>{post.first_publication_date}</time>
            </div>
            <div>
              <FiUser className={commonStyles.icon}/>
              <span>{post.data.author}</span>
            </div>
            <div>
              <FiClock className={commonStyles.icon}/>
              <span>4 min</span>
            </div>
          </div>

          <div className={styles.content}>
            {
              post.data.content.map(content => (
                <>
                  <h2>{content.heading}</h2>
                  <div
                    dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body)}}
                  />
                </>
              ))
            }
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query<any>([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: [],
    pageSize: 100
  });

  return {
    paths: posts.results.map(post => ({
      params: { slug: post.uid }
    })),
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;


  const prismic = getPrismicClient();
  const response = await prismic.getByUID<any>('posts', String(slug), {});

  const post = {
    first_publication_date: format(new Date(response.last_publication_date), 'dd MMM yyyy', {
      locale: ptBR,
    }),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content
    }
  }

  return {
    props: {
      post
    }
  }
};
