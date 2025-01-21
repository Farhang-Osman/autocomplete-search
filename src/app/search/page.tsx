import { Search } from '../_components/Search';

export const dynamic = 'force-dynamic';

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
