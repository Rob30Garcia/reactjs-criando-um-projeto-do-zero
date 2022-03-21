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
  uid?: string;
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

interface PostProps {
  post: Post;
  navigation: {
    prevPost: Post;
    nextPost: Post;
  };
  preview: boolean;
}

export default function Post({
  post,
  navigation,
  preview
}: PostProps) {
  const [ minutes, setMinutes ] = useState(4);
  const [ isEdited, setIsEdited ] = useState(false);
  const [ timeEdited, setTimeEdited ] = useState('');
  const router = useRouter();

  if(router.isFallback) {
    return <div>Carregando...</div>
  }

  useEffect(() => {
    const isEdited = post.first_publication_date === post.last_publication_date;
    if(!isEdited) {
      const dateEdited = format(
        new Date(post.last_publication_date),
        "'* editado em' dd MMM yyyy', às' HH':'mm",
        {
          locale: ptBR,
        }
      );
      setIsEdited(true);
      setTimeEdited(dateEdited);
    }

    const wordForMinute = 200;
    const text = post.data.content.reduce((acc, elem) => {
      acc = acc + elem.heading.toString().split(' ').length;
      acc = acc + RichText.asText(elem.body).split(' ').length;

      return acc;
    }, 0);

    const read = Math.ceil(text/wordForMinute);
    setMinutes(read);
  }, [post]);

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

          {isEdited && (
            <span>{timeEdited}</span>
          )}

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
        <section>
          {
            navigation.prevPost && (
              <div className={styles.navigation}>
                <p>{navigation.prevPost.data.title}</p>
                <Link href={`/post/${navigation.prevPost.uid}`}>
                  <a>
                    Post anterior
                  </a>
                </Link>
              </div>
            )
          }
          {
            navigation.nextPost && (
              <div className={styles.navigation}>
                <p>{navigation.nextPost.data.title}</p>
                <Link href={`/post/${navigation.nextPost.uid}`}>
                  <a>
                    Próximo post
                  </a>
                </Link>
              </div>
            )
          }
        </section>
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

export const getStaticPaths: GetStaticPaths = async () => {
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

  const nextPost = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    pageSize: 1,
    after: response.id,
    orderings: '[document.first_publication_date]'
  });

  const prevPost = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    pageSize: 1,
    after: response.id,
    orderings: '[document.last_publication_date desc]'
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
      navigation:  {
        prevPost: prevPost?.results[0] ?? null,
        nextPost: nextPost?.results[0] ?? null,
      },
      preview,
    },
    revalidate: 60 * 5,
  }
};
