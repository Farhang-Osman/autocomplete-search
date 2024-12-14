import Typesense from 'typesense';
import fs from 'fs/promises';

export async function importBooks(): Promise<void> {
  const client = new Typesense.Client({
    nodes: [
      {
        host: 'localhost', // For Typesense Cloud use xxx.a1.typesense.net
        port: 8108, // For Typesense Cloud use 443
        protocol: 'http', // For Typesense Cloud use https
      },
    ],
    apiKey: 'dO5e1kLIFhZdzbIoJrsqmpipx0aONY8u88JKid91KfihOwqN',
    connectionTimeoutSeconds: 2,
  });

  interface FieldType {
    name: string;
    type: string;
    facet?: boolean;
    reference?: string;
  }
  interface bookAndAuthorType {
    name: string;
    fields: FieldType[];
    default_sorting_field?: string;
  }

  const autocompletebooksSchema: bookAndAuthorType = {
    name: 'autobooks',
    fields: [
      {
        name: 'title',
        type: 'string',
      },
      {
        name: 'authors',
        type: 'string[]',
        facet: true,
      },
      {
        name: 'publication_year',
        type: 'int32',
        facet: true,
      },
      {
        name: 'id',
        type: 'string',
      },
      {
        name: 'average_rating',
        type: 'float',
        facet: true,
      },
      {
        name: 'image_url',
        type: 'string',
      },
      {
        name: 'ratings_count',
        type: 'int32',
      },
    ],
    default_sorting_field: 'ratings_count',
  };

  await client.collections('autobooks').delete();

  client.collections().create(autocompletebooksSchema);
  // .then(data => {
  //   console.log(data);
  // });

  const dataInJsonl = await fs.readFile('books.jsonl', 'utf-8');
  await client.collections('autobooks').documents().import(dataInJsonl);

  console.dir('-*-*-*-*-*-*-*-*-*-*-*-*');
  console.dir('complete');
  console.dir('-*-*-*-*-*-*-*-*-*-*-*-*');

  const searchParameters = {
    q: 'hello',
    query_by: 'title',
    // sort_by: 'ratings_count:desc',
    per_page: 20,
  };

  client
    .collections('autobooks')
    .documents()
    .search(searchParameters)
    .then(searchResults => {
      console.dir(searchResults, { depth: 5 });
    });
}

importBooks();
