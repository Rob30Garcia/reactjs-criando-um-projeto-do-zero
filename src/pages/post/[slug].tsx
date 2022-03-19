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
import { useEffect, useState } from 'react';
import Comment from '../../components/Comment';
import Link from 'next/link';

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
  preview: boolean;
}

export default function Post({
  post,
  preview
}: PostProps) {
  const [ minutes, setMinutes ] = useState(4);
  const router = useRouter();

  if(router.isFallback) {
    return <div>Carregando...</div>
  }

  useEffect(() => {
    const wordForMinute = 200;
    const text = post.data.content.reduce((acc, elem) => {
      acc = acc + elem.heading.toString().split(' ').length;
      acc = acc + RichText.asText(elem.body).split(' ').length;

      return acc;
    }, 0);

    const read = Math.ceil(text/wordForMinute);
    setMinutes(read);
  }, []);

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
              <time>{
                format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })
              }</time>
            </div>
            <div>
              <FiUser className={commonStyles.icon}/>
              <span>{post.data.author}</span>
            </div>
            <div>
              <FiClock className={commonStyles.icon}/>
              <span>{minutes} min</span>
            </div>
          </div>

          <div className={styles.content}>
            {
              post.data.content.map((content, index) => (
                <div key={index}>
                  <h2>{content.heading}</h2>
                  <div
                    className={styles.postContent}
                    dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body)}}
                  />
                </div>
              ))
            }
          </div>
        </article>
      </main>

      <footer className={styles.footer}>
        <Comment />
        {
          preview && (
            <aside>
              <Link href="/api/exit-preview">
                <a className={commonStyles.preview}>Sair do modo Preview</a>
              </Link>
            </aside>
          )
        }
      </footer>
    </>
  );
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  if(!response) {
    return {
      redirect:{
        destination: '/',
        permanent: false
      }
    }
  }

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content
    }
  }

  return {
    props: {
      post,
      preview,
    },
    revalidate: 60 * 5,
  }
};
