// import React from 'react';

// // import algoliasearch from 'algoliasearch/lite';
// import { Hit as AlgoliaHit } from 'instantsearch.js/es/types';
// import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';

import {
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
  SearchBox,
} from 'react-instantsearch';
// import { Autocomplete } from './autocomplete';
// import Typesense from 'typesense';
import { HeaderComponent } from '../_components/header';
import { Search } from '../_components/Search';
// import { typesenseConfig } from '../_tools/typesenseConfig';

// // import './App.css';

// // const searchClient = algoliasearch(
// //   'latency',
// //   '6be0576ff61c053d5f9a3225e2a90f76'
// // );

// const client = new Typesense.Client(typesenseConfig);

// const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
//   server: typesenseConfig,
//   // The following parameters are directly passed to Typesense's search API endpoint.
//   //  So you can pass any parameters supported by the search endpoint below.
//   //  query_by is required.
//   additionalSearchParameters: {
//     query_by: 'title',
//     // highlight_full_fields: 'title',
//     // highlight_start_tag: '<b>',
//     // highlight_end_tag: '</b>',
//   },
// });

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

// export async function sources({ query }): any {
//   const results = await client.collections('autobooks').documents().search({
//     q: query,
//     query_by: 'title',
//     // highlight_full_fields: 'title',
//     // highlight_start_tag: '<b>',
//     // highlight_end_tag: '</b>',
//   });

//   return [
//     {
//       sourceId: 'predictions',
//       getItems() {
//         return results.hits;
//       },
//       getItemInputValue({
//         item: {
//           document: { title },
//         },
//       }) {
//         return `${title}`;
//       },
//       templates: {
//         item({ item, html }) {
//           // html is from the `htm` package. Docs: https://github.com/developit/htm
//           const address =
//             item.highlights.find(h => h.field === 'title')?.value ||
//             item.document['title'];
//           // const postcode =
//           //   item.highlights.find((h) => h.field === 'postcode')?.value ||
//           //   item.document['postcode'];
//           // Get the highlighted HTML fragment from Typesense results
//           const html_fragment = html`${address}`;

//           // Send the html_fragment to `html` tagged template
//           // Reference: https://github.com/developit/htm/issues/226#issuecomment-1205526098
//           return html`<div
//             dangerouslySetInnerHTML=${{ __html: html_fragment }}
//           ></div>`;
//         },
//         noResults() {
//           return 'No results found.';
//         },
//       },
//     },
//   ];
// }

function search() {
  return (
    <>
      <div className='bg-slate-400'>
        <h2>Search Page</h2>
      </div>
      <Search />
    </>
  );
}

export default search;
