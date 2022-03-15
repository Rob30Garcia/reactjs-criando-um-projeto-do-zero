import { GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

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
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [next_page, setNextPage] = useState<string>(postsPagination.next_page);

  function handleMorePosts() {
    fetch(next_page)
      .then(response => {
        response.json().then(res => {
          const { results, next_page } = res;

          const morePosts = results.map((post: any) => {
            return {
              uid: post.uid,
              first_publication_date: format(new Date(post.last_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              }),
              data: {
                title: post.data.title,
                subtitle: post.data.subtitle,
                author: post.data.author
              }
            }
          })

          setPosts([...posts, ...morePosts]);
          setNextPage(next_page);
        })

      })
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          <img src="/Logo.svg" alt="logo"/>

          {
            posts.map(post => (
              <a key={post.uid} href="#">
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.info}>
                  <div>
                    <FiCalendar className={styles.icon}/>
                    <time>{post.first_publication_date}</time>
                  </div>
                  <div>
                    <FiUser className={styles.icon}/>
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            ))
          }

          {
            next_page &&
            <button
              type="button"
              className={styles.loading}
              onClick={handleMorePosts}
            >
              Carregar mais posts
            </button>
          }

        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query<any>([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 1

  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(new Date(post.last_publication_date), 'dd MMM yyyy', {
        locale: ptBR,
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts
      }
    },
    revalidate: 60*10,
  }
};
