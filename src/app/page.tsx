'use client';

import React from 'react';

// import algoliasearch from 'algoliasearch/lite';
import { Hit as AlgoliaHit } from 'instantsearch.js/es/types';
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';

import {
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
  SearchBox,
} from 'react-instantsearch';
import { Autocomplete } from './autocomplete';
import Typesense from 'typesense';

// import './App.css';

// const searchClient = algoliasearch(
//   'latency',
//   '6be0576ff61c053d5f9a3225e2a90f76'
// );

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

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: 'dO5e1kLIFhZdzbIoJrsqmpipx0aONY8u88JKid91KfihOwqN', // Be sure to use the search-only-api-key
    nodes: [
      {
        host: 'localhost',
        port: 8108,
        protocol: 'http',
      },
    ],
  },
  // The following parameters are directly passed to Typesense's search API endpoint.
  //  So you can pass any parameters supported by the search endpoint below.
  //  query_by is required.
  additionalSearchParameters: {
    query_by: 'title',
    // highlight_full_fields: 'title',
    // highlight_start_tag: '<b>',
    // highlight_end_tag: '</b>',
  },
});

type HitProps = {
  hit: AlgoliaHit<{
    name: string;
    image: string;
    brand: string;
    categories: string[];
  }>;
};

function Hit({ hit }: any) {
  return (
    <article className='hit'>
      <div className='hit-image'>
        <img src={hit.image_url} alt='image' />
      </div>
      <div>
        <h1>
          <Highlight hit={hit} attribute='title' />
        </h1>
        {/* <div>
          By <strong>{hit.brand}</strong> in{' '}
          <strong>{hit.categories[0]}</strong>
        </div> */}
      </div>
    </article>
  );
}

export async function sources({ query }): any {
  const results = await client.collections('autobooks').documents().search({
    q: query,
    query_by: 'title',
    // highlight_full_fields: 'title',
    // highlight_start_tag: '<b>',
    // highlight_end_tag: '</b>',
  });

  return [
    {
      sourceId: 'predictions',
      getItems() {
        return results.hits;
      },
      getItemInputValue({
        item: {
          document: { title },
        },
      }) {
        return `${title}`;
      },
      templates: {
        item({ item, html }) {
          // html is from the `htm` package. Docs: https://github.com/developit/htm
          const address =
            item.highlights.find(h => h.field === 'title')?.value ||
            item.document['title'];
          // const postcode =
          //   item.highlights.find((h) => h.field === 'postcode')?.value ||
          //   item.document['postcode'];
          // Get the highlighted HTML fragment from Typesense results
          const html_fragment = html`${address}`;

          // Send the html_fragment to `html` tagged template
          // Reference: https://github.com/developit/htm/issues/226#issuecomment-1205526098
          return html`<div
            dangerouslySetInnerHTML=${{ __html: html_fragment }}
          ></div>`;
        },
        noResults() {
          return 'No results found.';
        },
      },
    },
  ];
}

const App = () => {
  return (
    <div>Home</div>

    // <div>
    //   <InstantSearch
    //     searchClient={typesenseInstantsearchAdapter.searchClient}
    //     indexName='autobooks'
    //     routing
    //   >
    //     <header className='header'>
    //       <div className='header-wrapper wrapper'>
    //         <nav className='header-nav'>
    //           <a href='/'>Home</a>
    //         </nav>
    //         {/* <SearchBox placeholder='search books' /> */}
    //         <Autocomplete
    //           placeholder='Search products'
    //           detachedMediaQuery='none'
    //           openOnFocus
    //           getSources={sources}
    //         />
    //       </div>
    //     </header>
    //     <div className='container wrapper'>
    //       <div>
    //         <RefinementList attribute='authors' />
    //       </div>
    //       <div>
    //         <Hits hitComponent={Hit} />
    //         <Pagination />
    //       </div>
    //     </div>
    //   </InstantSearch>
    // </div>
  );
};

export default App;
