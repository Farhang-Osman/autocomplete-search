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

// import './App.css';

// const searchClient = algoliasearch(
//   'latency',
//   '6be0576ff61c053d5f9a3225e2a90f76'
// );

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

function App() {
  return (
    <div>
      <InstantSearch
        searchClient={typesenseInstantsearchAdapter.searchClient}
        indexName='autobooks'
        routing
      >
        <header className='header'>
          <div className='header-wrapper wrapper'>
            <nav className='header-nav'>
              <a href='/'>Home</a>
            </nav>
            <SearchBox placeholder='search books' />
          </div>
        </header>
        <div className='container wrapper'>
          <div>
            <RefinementList attribute='authors' />
          </div>
          <div>
            <Hits hitComponent={Hit} />
            <Pagination />
          </div>
        </div>
      </InstantSearch>
    </div>
  );
}

export default App;
