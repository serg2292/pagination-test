import Head from "next/head";
import { Inter } from "next/font/google";
import Table from "react-bootstrap/Table";
import { Alert, Container, Pagination } from "react-bootstrap";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

type TUserItem = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  updatedAt: string;
};

type TGetServerSideProps = {
  statusCode: number;
  users: TUserItem[];
};

const getPages = (currentPage: number, totalPages: number) => {
  let startPage = currentPage;
  let endPage = totalPages;
  if (totalPages > 10) {
    if (currentPage <= 6) {
      startPage = 1;
      endPage = 10;
    } else if (currentPage + 4 >= totalPages) {
      startPage = totalPages - 9;
      endPage = totalPages;
    } else {
      startPage = currentPage - 5;
      endPage = currentPage + 4;
    }
  }

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  return pages;
};

export const getServerSideProps = (async (ctx: GetServerSidePropsContext): Promise<{ props: TGetServerSideProps }> => {
  try {
    const res = await fetch(`http://localhost:3000/users`, { method: "GET" });
    if (!res.ok) {
      return { props: { statusCode: res.status, users: [] } };
    }

    return {
      props: { statusCode: 200, users: await res.json() },
    };
  } catch (e) {
    return { props: { statusCode: 500, users: [] } };
  }
}) satisfies GetServerSideProps<TGetServerSideProps>;

export default function Home({ statusCode, users }: TGetServerSideProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const totalPages = Math.ceil(users.length / pageSize);
  const paginatedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (statusCode !== 200) {
    return <Alert variant={"danger"}>Ошибка {statusCode} при загрузке данных</Alert>;
  }

  const handlePageChange = (page: number) => {
    if (page !== 0 && page < totalPages + 1) {
      setCurrentPage(page);
    }
  };

  const pagesList = getPages(currentPage, totalPages);
  return (
    <>
      <Head>
        <title>Тестовое задание</title>
        <meta name="description" content="Тестовое задание" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={inter.className}>
        <Container>
          <h1 className={"mb-5"}>Пользователи</h1>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Дата обновления</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstname}</td>
                  <td>{user.lastname}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>{user.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination>
            <Pagination.First onClick={() => handlePageChange(1)} />
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} />
            {pagesList.map((page) => (
              <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                {page}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} />
            <Pagination.Last onClick={() => handlePageChange(totalPages)} />
          </Pagination>
        </Container>
      </main>
    </>
  );
}
