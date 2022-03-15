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

          {/* <a href="#">
            <strong>Criando um app CRA do zero</strong>
            <p>Tudo sobre como criar a sua primeira aplicação utilizando Create React App</p>
            <div className={styles.info}>
              <div>
                <FiCalendar className={styles.icon}/>
                <time>19 Abr 2022</time>
              </div>
              <div>
                <FiUser className={styles.icon}/>
                <span>Danilo Vieira</span>
              </div>
            </div>
          </a> */}

          <a className={styles.loading} href="#">
            Carregar mais posts
          </a>

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
    pageSize: 20
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
    }
  }
};
