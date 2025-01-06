import React, { useEffect, useState } from 'react';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';

import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';

import {
  Hits,
  Highlight,
  Pagination,
  RefinementList,
  getServerState,
  SearchBox,
} from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs';
import { Autocomplete } from '../autocomplete';
import Typesense from 'typesense';
import { typesenseConfig } from '../_tools/typesenseConfig';
import { simple } from 'instantsearch.js/es/lib/stateMappings';
import { usePathname } from 'next/navigation';
import singletonRouter from 'next/router';
import { renderToString } from 'react-dom/server';

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

function getCategorySlug(name) {
  return name.split(' ').map(encodeURIComponent).join('+');
}
function getCategoryName(slug) {
  return slug.split('+').map(decodeURIComponent).join(' ');
}

// const routing = {
//   router: history({
//     windowTitle({ category, query }) {
//       const queryTitle = query ? `Results for "${query}"` : 'Search';

//       if (category) {
//         return `${category} – ${queryTitle}`;
//       }

//       return queryTitle;
//     },

//     createURL({ qsModule, routeState, location }) {
//       const urlParts = location.href.match(/^(.*?)\/search/);
//       const baseUrl = `${urlParts ? urlParts[1] : ''}/`;

//       const categoryPath = routeState.category
//         ? `${getCategorySlug(routeState.category)}/`
//         : '';
//       const queryParameters = {};

//       if (routeState.query) {
//         queryParameters.query = encodeURIComponent(routeState.query);
//       }
//       if (routeState.page !== 1) {
//         queryParameters.page = routeState.page;
//       }
//       if (routeState.brands) {
//         queryParameters.brands = routeState.brands.map(encodeURIComponent);
//       }

//       const queryString = qsModule.stringify(queryParameters, {
//         addQueryPrefix: true,
//         arrayFormat: 'repeat',
//       });

//       return `${baseUrl}search/${categoryPath}${queryString}`;
//     },

//     parseURL({ qsModule, location }) {
//       const pathnameMatches = location.pathname.match(/search\/(.*?)\/?$/);
//       const category = getCategoryName(pathnameMatches?.[1] || '');
//       const {
//         query = '',
//         page,
//         brands = [],
//       } = qsModule.parse(location.search.slice(1));
//       // `qs` does not return an array when there's a single value.
//       const allBrands = Array.isArray(brands)
//         ? brands
//         : [brands].filter(Boolean);

//       return {
//         query: decodeURIComponent(query),
//         page,
//         brands: allBrands.map(decodeURIComponent),
//         category,
//       };
//     },
//   }),

//   stateMapping: {
//     stateToRoute(uiState) {
//       const indexUiState = uiState['instant_search'] || {};

//       return {
//         query: indexUiState.query,
//         page: indexUiState.page,
//         brands: indexUiState.refinementList?.brand,
//         category: indexUiState.menu?.categories,
//       };
//     },

//     routeToState(routeState) {
//       return {
//         instant_search: {
//           query: routeState.query,
//           page: routeState.page,
//           menu: {
//             categories: routeState.category,
//           },
//           refinementList: {
//             brand: routeState.brands,
//           },
//         },
//       };
//     },
//   },
// };

export function HeaderComponent({ serverUrl }) {
  // const pathname = usePathname();
  // const isSearch = pathname === '/search' ? true : false;

  // const [firstName, setFirstName] = useState('');
  // const getCurrentUrl: string = `http://localhost:3000${pathname}`;
  return (
    <InstantSearchNext
      searchClient={typesenseInstantsearchAdapter.searchClient}
      indexName='autobooks'
      // routing
      // future={{ preserveSharedStateOnUnmount: true }}
      routing={{
        router: createInstantSearchRouterNext({
          singletonRouter,
          serverUrl,
          routerOptions: {
            windowTitle({ category, query }) {
              const queryTitle = query ? `${query}` : 'Search';

              // if (category) {
              //   return `${category} – ${queryTitle}`;
              // }
              return queryTitle;
            },

            createURL() {
              // const urlParts = location.href.match(/^(.*?)\/search/);
              // const baseUrl = `${urlParts ? urlParts[1] : ''}/`;

              // const queryParameters = {};

              // if (routeState.query) {
              //   queryParameters.query = encodeURIComponent(routeState.query);
              // }
              // if (routeState.page !== 1) {
              //   queryParameters.page = routeState.page;
              // }
              // // if (routeState.brands) {
              // //   queryParameters.brands =
              // //     routeState.brands.map(encodeURIComponent);
              // // }

              // console.log('queryParameters: ', queryParameters);

              // const queryString = qsModule.stringify(queryParameters, {
              //   addQueryPrefix: true,
              //   arrayFormat: 'repeat',
              // });

              // return `${baseUrl}search/${queryString}`;
              return `http://localhost:3000/search`;
            },

            // parseURL({ qsModule, location }) {
            //   const pathnameMatches =
            //     location.pathname.match(/search\/(.*?)\/?$/);
            //   // const category = getCategoryName(pathnameMatches?.[1] || '');
            //   const {
            //     query = '',
            //     page,
            //     // brands = [],
            //   } = qsModule.parse(location.search.slice(1));
            //   // `qs` does not return an array when there's a single value.
            //   // const allBrands = Array.isArray(brands)
            //   //   ? brands
            //   //   : [brands].filter(Boolean);

            //   return {
            //     query: decodeURIComponent(query),
            //     page,
            //     // brands: allBrands.map(decodeURIComponent),
            //     // category,
            //   };
            // },
          },
        }),
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
      }}
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

  //   return (
  //     <InstantSearchNext
  //       searchClient={typesenseInstantsearchAdapter.searchClient}
  //       indexName='autobooks'
  //       routing={{
  //         router: createInstantSearchRouterNext({
  //           singletonRouter,
  //           serverUrl: 'http://localhost:8108',
  //           routerOptions: {
  //             cleanUrlOnDispose: false,
  //             createURL({ qsModule, routeState, location }) {
  //               // const urlParts = location.href.match(/^(.*?)\/search/);
  //               // const baseUrl = `${urlParts ? urlParts[1] : ''}/`;

  //               // const queryParameters = {};

  //               // if (routeState.query) {
  //               //   queryParameters.query = encodeURIComponent(routeState.query);
  //               // }
  //               // if (routeState.page !== 1) {
  //               //   queryParameters.page = routeState.page;
  //               // }
  //               // if (routeState.brands) {
  //               //   queryParameters.brands =
  //               //     routeState.brands.map(encodeURIComponent);
  //               // }

  //               // const queryString = qsModule.stringify(queryParameters, {
  //               //   addQueryPrefix: true,
  //               //   arrayFormat: 'repeat',
  //               // });

  //               return `http://localhost:3000/search`;
  //             },
  //           },
  //         }),
  //       }}
  //     >
  //       <header className='header'>
  //         <div className='header-wrapper wrapper'>
  //           <nav className='header-nav'>
  //             <a href='/'>Home</a>
  //           </nav>
  //           {/* <SearchBox placeholder='search books' /> */}
  //           <Autocomplete
  //             placeholder='Search products'
  //             detachedMediaQuery='none'
  //             openOnFocus
  //             getSources={sources}
  //             onSubmit={pushUrl}
  //           />
  //         </div>
  //       </header>
  //       <div>
  //         <div className='container wrapper'>
  //           <div>
  //             <RefinementList attribute='authors' />
  //           </div>
  //           <div>
  //             <Hits hitComponent={Hit} />
  //             <Pagination />
  //           </div>
  //         </div>
  //       </div>
  //       {children}
  //     </InstantSearchNext>
  //   );
  // } else {
  //   return (
  //     <>
  //       <InstantSearchNext
  //         searchClient={typesenseInstantsearchAdapter.searchClient}
  //         indexName='autobooks'
  //         routing={{
  //           router: createInstantSearchRouterNext({
  //             singletonRouter,
  //             serverUrl: 'http://localhost:3000/?autobooks%5Bquery%5D=jo',
  //             routerOptions: {
  //               cleanUrlOnDispose: false,
  //               createURL({ qsModule, routeState, location }) {
  //                 // const urlParts = location.href.match(/^(.*?)\/search/);
  //                 // const baseUrl = `${urlParts ? urlParts[1] : ''}/`;

  //                 // const queryParameters = {};

  //                 // if (routeState.query) {
  //                 //   queryParameters.query = encodeURIComponent(routeState.query);
  //                 // }
  //                 // if (routeState.page !== 1) {
  //                 //   queryParameters.page = routeState.page;
  //                 // }
  //                 // if (routeState.brands) {
  //                 //   queryParameters.brands =
  //                 //     routeState.brands.map(encodeURIComponent);
  //                 // }

  //                 // const queryString = qsModule.stringify(queryParameters, {
  //                 //   addQueryPrefix: true,
  //                 //   arrayFormat: 'repeat',
  //                 // });

  //                 return `http://localhost:3000/search`;
  //               },
  //             },
  //           }),
  //         }}
  //       >
  //         <header className='header'>
  //           <div className='header-wrapper wrapper'>
  //             <nav className='header-nav'>
  //               <a href='/'>Home</a>
  //             </nav>
  //             {/* <SearchBox placeholder='search books' /> */}
  //             <button
  //               // onSubmit={
  //               //   // e => console.log(e.target.value)
  //               //   // handleSubmit
  //               //   // window.open(
  //               //   //   'http://localhost:3000/search?autobooks%5Bquery%5D=The%20Hunger%20Games'
  //               //   // )
  //               // }
  //               // onInput={}
  //               value={firstName} // ...force the input's value to match the state variable...
  //               onSubmit={e => {
  //                 const ann = e.target as HTMLButtonElement;
  //                 setFirstName(ann.value);
  //                 console.dir(firstName);
  //                 window.open(`http://localhost:3000/search${firstName}`);
  //               }}
  //             >
  //               <Autocomplete
  //                 placeholder='Search products'
  //                 detachedMediaQuery='none'
  //                 openOnFocus
  //                 getSources={sources}
  //               />
  //             </button>
  //           </div>
  //         </header>
  //       </InstantSearchNext>
  //     </>
  //   );
  // }
}
export async function getServerSideProps({ req }) {
  const protocol = req.headers.referer?.split('://')[0] || 'https';
  const serverUrl = `${protocol}://${req.headers.host}${req.url}`;

  return {
    props: {
      serverState: serverUrl,
    },
  };
}
// const handleSubmit = event => {
//   event.preventDefault();
//   const formData = new FormData(event.target);
//   const formObject = {};
//   for (const [key, value] of Array.from(formData.entries())) {
//     formObject[key] = value;
//   }
//   console.log(formObject);
// };
