'use client';

import React from 'react';
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';
import { InstantSearchNext } from 'react-instantsearch-nextjs';
import Typesense from 'typesense';
import {
  Hits,
  Highlight,
  Pagination,
  RefinementList,
} from 'react-instantsearch';

import { Autocomplete } from '../autocomplete';
import { typesenseConfig } from '../_tools/typesenseConfig';

// import './App.css';

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

const client = new Typesense.Client(typesenseConfig);

const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: typesenseConfig,
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

const routerAndstateMapping = {
  router: {
    cleanUrlOnDispose: true,
    windowTitle({ category, query }) {
      const queryTitle = query ? `${query}` : 'Search';

      // if (category) {
      //   return `${category} – ${queryTitle}`;
      // }
      return queryTitle;
    },
    createURL({ qsModule, routeState, location }) {
      const urlParts = location.href.match(/^(.*?)\/search/);
      const baseUrl = `${urlParts ? urlParts[1] : ''}/`;

      const queryParameters = {};

      if (routeState.query) {
        queryParameters.query = encodeURIComponent(routeState.query);
      }
      if (routeState.page !== 1) {
        queryParameters.page = routeState.page;
      }
      // if (routeState.brands) {
      //   queryParameters.brands =
      //     routeState.brands.map(encodeURIComponent);
      // }

      //   console.log('queryParameters: ', queryParameters);

      const queryString = qsModule.stringify(queryParameters, {
        addQueryPrefix: true,
        arrayFormat: 'repeat',
      });

      return `${baseUrl}search/${queryString}`;
      //   return `http://localhost:3000/search`;
    },
    parseURL({ qsModule, location }) {
      // const pathnameMatches =
      //   location.pathname.match(/search\/(.*?)\/?$/);
      // const category = getCategoryName(pathnameMatches?.[1] || '');
      const {
        query = '',
        page,
        // brands = [],
      } = qsModule.parse(location.search.slice(1));
      // `qs` does not return an array when there's a single value.
      // const allBrands = Array.isArray(brands)
      //   ? brands
      //   : [brands].filter(Boolean);

      return {
        query: decodeURIComponent(query),
        page,
        // brands: allBrands.map(decodeURIComponent),
        // category,
      };
    },
  },
  stateMapping: {
    stateToRoute(uiState) {
      const indexUiState = uiState['autobooks'] || {};

      return {
        query: indexUiState.query,
        page: indexUiState.page,
        // brands: indexUiState.refinementList?.brand,
        // category: indexUiState.menu?.categories,
      };
    },
    routeToState(routeState) {
      return {
        autobooks: {
          query: routeState.query,
          page: routeState.page,
          // menu: {
          //   categories: routeState.category,
          // },
          // refinementList: {
          //   brand: routeState.brands,
          // },
        },
      };
    },
  },
};

export function Search() {
  return (
    <InstantSearchNext
      searchClient={typesenseInstantsearchAdapter.searchClient}
      indexName='autobooks'
      future={{ preserveSharedStateOnUnmount: true }}
      routing={routerAndstateMapping}
    >
      <header className='header'>
        <div className='header-wrapper wrapper'>
          <nav className='header-nav'>
            <a href='/'>Home</a>
          </nav>
          {/* <SearchBox placeholder='search books' /> */}
          <Autocomplete
            placeholder='Search products'
            detachedMediaQuery='none'
            openOnFocus
            getSources={sources}
          />
        </div>
      </header>
      <div>
        <div className='container wrapper'>
          <div>
            <RefinementList attribute='authors' />
          </div>
          <div>
            <Hits hitComponent={Hit} />
            <Pagination />
          </div>
        </div>
      </div>
    </InstantSearchNext>
  );
}
