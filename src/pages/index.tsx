import { GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi'

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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

export default function Home() {
  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          <img src="/Logo.svg" alt="logo"/>

          <a href="#">
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida</p>
            <div className={styles.info}>
              <div>
                <FiCalendar className={styles.icon}/>
                <time>15 Mar 2022</time>
              </div>
              <div>
                <FiUser className={styles.icon}/>
                <span>Joseph Oliveira</span>
              </div>
            </div>
          </a>

          <a href="#">
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
          </a>

          <a href="#">
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida</p>
            <div className={styles.info}>
              <div>
                <FiCalendar className={styles.icon}/>
                <time>15 Mar 2022</time>
              </div>
              <div>
                <FiUser className={styles.icon}/>
                <span>Joseph Oliveira</span>
              </div>
            </div>
          </a>

          <a href="#">
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
          </a>

        </div>
      </main>
    </>
  )
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
