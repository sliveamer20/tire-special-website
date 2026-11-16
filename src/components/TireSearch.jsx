import React, { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { attributesToProps, domToReact } from 'html-react-parser';
import { searchTires } from '../services/tireSearch.js';

const SearchContext = createContext(null);
const phone = 'tel:+18134433869';
const quantityOptions = [
  { key: 'qty1', label: '1 Tire', count: 1 },
  { key: 'qty2', label: '2 Tires', count: 2 },
  { key: 'qty3Plus', label: '3+ Tires', count: null },
];
const specificationFields = [
  { key: 'mileageWarranty', label: 'Mileage Warranty' }, { key: 'utqg', label: 'UTQG' },
  { key: 'speedIndex', label: 'Speed Rating' }, { key: 'loadIndex', label: 'Load Index' },
  { key: 'origin', label: 'Country of Origin' }, { key: 'dot', label: 'DOT / Mfg Date' },
  { key: 'partCode', label: 'Part #' },
];
const dimensions = [
  { key: 'width', label: 'Tire width', placeholder: 'Width', id: 'fw', values: ['175','185','195','205','215','225','235','245','255','265','275','285','295','305','315','325'] },
  { key: 'ratio', label: 'Aspect ratio', placeholder: 'Ratio', id: 'fr', values: ['35','40','45','50','55','60','65','70','75','80'] },
  { key: 'diameter', label: 'Rim diameter', placeholder: 'Rim', id: 'fd', values: ['14','15','16','17','18','19','20','22','24'] },
];

const money = (value) => `$${Number(value).toFixed(2)}`;
const getField = (result, key) => {
  const value = result?.[key] ?? result?.specifications?.[key];
  return value == null ? '' : String(value).trim();
};
const priceFor = (result, quantity) => typeof result?.retailPrice?.[quantity] === 'number' ? result.retailPrice[quantity] : null;

function PhoneIcon({ size = 17 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
}

function FinderInputs({ variant, sourceProps = {} }) {
  const { values, updateValue, search, status, query } = useContext(SearchContext);
  const isHome = variant === 'home';
  const ctaLabel = status === 'loading' ? 'Searching…' : dimensions.every(({ key }) => values[key]) ? `${query.width}/${query.ratio}R${query.diameter}${isHome ? ' — Get Price' : ''}` : 'Get Price';

  return <div {...sourceProps} className="finder-inputs">
    {dimensions.map(({ key, label, placeholder, id, values: options }) => <div key={key}>
      <input data-finder-width={key === 'width' ? '' : undefined} list={`${id}-${isHome ? 'i' : 't'}`} inputMode="numeric" autoComplete="off" placeholder={placeholder} aria-label={label} value={values[key]} onChange={(event) => updateValue(key, event.target.value.replace(/\D/g, ''))} style={{ background: isHome ? '#fff' : 'var(--surface)', color: isHome ? '#16171b' : 'var(--text)', border: isHome ? '1px solid #d5d6da' : '1px solid rgba(0,0,0,.12)', borderRadius: isHome ? 10 : 9, padding: '12px 14px', fontFamily: 'Barlow, sans-serif', fontSize: 16, width: '100%', boxSizing: 'border-box' }} />
      <datalist id={`${id}-${isHome ? 'i' : 't'}`}>{options.map((value) => <option key={value} value={value} />)}</datalist>
    </div>)}
    <a className="finder-btn" href={phone} aria-disabled={status === 'loading'} onClick={(event) => {
      if (status === 'loading') event.preventDefault();
      else if (dimensions.every(({ key }) => values[key])) { event.preventDefault(); search(); }
    }} style={{ textAlign: 'center', background: isHome ? 'linear-gradient(160deg,#FFD21E,#f4c400)' : '#16171b', color: isHome ? '#16171b' : '#fff', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, fontSize: isHome ? 16 : 17, letterSpacing: '.03em', textTransform: 'uppercase', textDecoration: 'none', padding: '13px 22px', borderRadius: isHome ? 10 : 9, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...(status === 'loading' ? { pointerEvents: 'none', opacity: 0.65 } : {}) }}>
      {!isHome && <PhoneIcon />}{ctaLabel}
    </a>
  </div>;
}

function ResultState({ type, title, children, onRetry }) {
  return <div className={`ts-state${type === 'inline' ? ' ts-state-inline' : ''}`} role={type === 'error' ? 'alert' : 'status'}>
    <div className={`ts-state-ico ts-state-${type}`} aria-hidden="true">{type === 'error' ? '!' : '⌕'}</div>
    <div className="ts-state-title">{title}</div><div className="ts-state-text">{children}</div>
    {onRetry && <button className="ts-cta ts-state-cta" type="button" onClick={onRetry}>Try Again</button>}
    <a className="ts-cta ts-state-cta" href={phone}><PhoneIcon /> Call (813) 443-3869</a>
  </div>;
}

function LoadingCards() {
  return <div className="ts-res-grid" aria-label="Searching tire inventory" aria-busy="true">{Array.from({ length: 6 }, (_, index) => <div className="ts-sk-card" key={index}><div className="ts-sk-line" style={{ width: '62%' }} /><div className="ts-sk-line" style={{ width: '34%' }} /><div className="ts-sk-line" style={{ width: '80%', marginTop: 14 }} /><div className="ts-sk-line" style={{ width: '50%' }} /><div className="ts-sk-price" /><div className="ts-sk-btn" /></div>)}</div>;
}

function FilterSidebar({ results, quantity, filter, setFilter, open, clear }) {
  const availability = [...new Set(results.map((result) => getField(result, 'availability')).filter(Boolean))];
  const speeds = [...new Set(results.map((result) => getField(result, 'speedIndex')).filter(Boolean))];
  const prices = results.map((result) => priceFor(result, quantity)).filter((price) => price != null);
  const min = prices.length ? Math.floor(Math.min(...prices)) : 0;
  const max = prices.length ? Math.ceil(Math.max(...prices)) : 0;
  const toggle = (group, value) => setFilter((current) => ({ ...current, [group]: { ...current[group], [value]: !current[group][value] } }));
  return <>
    <aside className={`ts-sidebar${open ? ' is-open' : ''}`} aria-label="Filters">
      <div className="ts-sidebar-head"><span>Filters</span><button type="button" className="ts-clear" onClick={clear}>Clear all</button></div>
      {availability.length > 0 && <div className="ts-fgroup"><div className="ts-fgroup-t">Availability</div>{availability.map((value) => <label className="ts-check" key={value}><input type="checkbox" checked={!!filter.availability[value]} onChange={() => toggle('availability', value)} /><span>{value}</span></label>)}</div>}
      {speeds.length > 0 && <div className="ts-fgroup"><div className="ts-fgroup-t">Speed Rating</div>{speeds.map((value) => <label className="ts-check" key={value}><input type="checkbox" checked={!!filter.speedIndex[value]} onChange={() => toggle('speedIndex', value)} /><span>{value}</span></label>)}</div>}
      {prices.length > 0 && max > min && <div className="ts-fgroup"><label className="ts-fgroup-t" htmlFor="tsPriceRange">Max Price / Tire</label><input id="tsPriceRange" type="range" className="ts-range" min={min} max={max} step="1" value={filter.priceMax ?? max} onChange={(event) => setFilter((current) => ({ ...current, priceMax: Number(event.target.value) }))} /><div className="ts-range-val">Up to <strong>{money(filter.priceMax ?? max)}</strong></div></div>}
      {!availability.length && !speeds.length && !(prices.length > 0 && max > min) && <div className="ts-fgroup-empty">No filters available for these results.</div>}
    </aside>
  </>;
}

function TireCard({ tire, quantity, size, onDetails }) {
  const brand = getField(tire, 'brand');
  const availability = getField(tire, 'availability');
  const price = priceFor(tire, quantity);
  const quantityCount = quantityOptions.find((option) => option.key === quantity)?.count;
  const fields = specificationFields.filter(({ key }) => key !== 'brand' && getField(tire, key)).slice(0, 4);
  return <article className="ts-card">
    <div className="ts-card-top"><div className="ts-card-heads">{brand && <div className="ts-card-brand">{brand}</div>}<h3 className="ts-card-name">{tire.description || 'Tire'}</h3></div><span className="ts-size-chip">{size}</span></div>
    {availability && <span className="ts-badge"><span className="ts-badge-dot" />{availability}</span>}
    {fields.length > 0 && <dl className="ts-specs">{fields.map(({ key, label }) => <div className="ts-spec" key={key}><dt>{label}</dt><dd>{getField(tire, key)}</dd></div>)}</dl>}
    <div className="ts-price-wrap">{price != null ? <><div className="ts-price-line"><span className="ts-price">{money(price)}</span><span className="ts-price-unit">/ tire</span></div><div className="ts-price-sub">{quantityCount ? `Est. ${money(price * quantityCount)} for ${quantityCount} ${quantityCount === 1 ? 'tire' : 'tires'}` : 'Price shown per tire'}</div></> : <div className="ts-price-call">Call for price</div>}
      <div className="ts-card-actions"><button type="button" className="ts-btn-ghost" onClick={(event) => onDetails(tire, event.currentTarget)}>View Details</button><a className="ts-cta" href={phone}><PhoneIcon /> Call to Order</a></div>
    </div>
  </article>;
}

function TireDetails({ tire, size, quantity, onClose, returnFocus }) {
  const closeRef = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const nodes = [...document.querySelectorAll('.ts-dt-panel a[href], .ts-dt-panel button:not([disabled])')];
        if (nodes.length && event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes.at(-1).focus(); }
        else if (nodes.length && !event.shiftKey && document.activeElement === nodes.at(-1)) { event.preventDefault(); nodes[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', onKeyDown); (returnFocus || previous)?.focus?.(); };
  }, [onClose, returnFocus]);

  const brand = getField(tire, 'brand');
  const availability = getField(tire, 'availability');
  const fields = specificationFields.filter(({ key }) => key !== 'brand' && getField(tire, key));
  return <div className="ts-details">
    <button className="ts-dt-backdrop" type="button" aria-label="Close tire details" onClick={onClose} />
    <section className="ts-dt-panel" role="dialog" aria-modal="true" aria-label="Tire details">
      <button ref={closeRef} className="ts-dt-x" type="button" aria-label="Close" onClick={onClose}><span aria-hidden="true">×</span></button>
      <div className="ts-dt-hero">{brand && <div className="ts-card-brand">{brand}</div>}<h2 className="ts-dt-name">{tire.description || 'Tire'}</h2><div className="ts-dt-meta"><span className="ts-size-chip">{size}</span>{availability && <span className="ts-badge"><span className="ts-badge-dot" />{availability}</span>}</div></div>
      <div className="ts-dt-body"><div className="ts-dt-pricing"><h3 className="ts-dt-h">Pricing</h3><table className="ts-tiers"><thead><tr><th>Quantity</th><th>Per Tire</th><th>Total</th></tr></thead><tbody>{quantityOptions.map((option) => { const price = priceFor(tire, option.key); const total = price != null && option.count ? money(price * option.count) : '—'; return <tr className={option.key === quantity ? 'is-sel' : ''} key={option.key}><th scope="row">{option.label}</th><td>{price != null ? `${money(price)} / tire` : 'Call for price'}</td><td>{total}</td></tr>; })}</tbody></table><p className="ts-dt-note">Prices are live retail. Mount &amp; balance available in-store.</p></div>
        <div className="ts-dt-specs"><h3 className="ts-dt-h">Specifications</h3>{fields.length ? <dl className="ts-specs ts-specs-lg">{fields.map(({ key, label }) => <div className="ts-spec" key={key}><dt>{label}</dt><dd>{getField(tire, key)}</dd></div>)}</dl> : <p className="ts-dt-note">Full specifications are confirmed by phone for this tire.</p>}</div>
      </div>
      <div className="ts-dt-actions"><a className="ts-cta" href={phone}><PhoneIcon /> Call to Order</a><a className="ts-btn-ghost ts-btn-ghost-lg" href="book.html">Book Installation</a></div>
    </section>
  </div>;
}

function SearchResults({ state, retry }) {
  const [quantity, setQuantity] = useState('qty1');
  const [sort, setSort] = useState('recommended');
  const [filter, setFilter] = useState({ availability: {}, speedIndex: {}, priceMax: null });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const closeDetails = useCallback(() => setDetail(null), []);

  useEffect(() => { setQuantity('qty1'); setSort('recommended'); setFilter({ availability: {}, speedIndex: {}, priceMax: null }); setFiltersOpen(false); setDetail(null); }, [state.searchId]);
  const available = state.results.filter((item) => {
    const availability = getField(item, 'availability');
    const speed = getField(item, 'speedIndex');
    const price = priceFor(item, quantity);
    if (Object.keys(filter.availability).length && !filter.availability[availability]) return false;
    if (Object.keys(filter.speedIndex).length && !filter.speedIndex[speed]) return false;
    if (filter.priceMax != null && price != null && price > filter.priceMax) return false;
    return true;
  });
  const sorted = [...available];
  if (sort === 'price-asc' || sort === 'price-desc') sorted.sort((a, b) => {
    const aPrice = priceFor(a, quantity); const bPrice = priceFor(b, quantity);
    if (aPrice == null && bPrice == null) return 0;
    if (aPrice == null) return 1;
    if (bPrice == null) return -1;
    return sort === 'price-asc' ? aPrice - bPrice : bPrice - aPrice;
  });
  if (sort === 'name-asc') sorted.sort((a, b) => String(a.description || '').localeCompare(String(b.description || '')));
  const clearFilters = () => setFilter({ availability: {}, speedIndex: {}, priceMax: null });

  if (state.status === 'idle') return null;
  return <div data-finder-results style={{ maxWidth: 1280, margin: '18px auto 0', padding: '0 24px' }} aria-live="polite">
    {state.status === 'loading' ? <><div className="ts-sk-head" /><LoadingCards /></> : null}
    {state.status === 'error' && <ResultState type="error" title="Search unavailable" onRetry={retry}>We could not reach live pricing just now. Please try again in a moment or call us — we can check your size in seconds.</ResultState>}
    {state.status === 'empty' && <ResultState type="empty" title={state.results.length ? 'No matches for these filters' : 'No tires found'} onRetry={state.results.length ? undefined : retry}>{state.results.length ? 'Try clearing a filter to see more tires.' : "We couldn't find that size in stock right now — call us and we'll source it for you."}</ResultState>}
    {state.status === 'ready' && <>
      <div className="ts-res-head"><h2 className="ts-res-title">{state.results.length}{state.results.length === 1 ? ' Match' : ' Matches'} for {state.size}</h2><span className="ts-res-sub">Live retail pricing · installation available in-store</span></div>
      <div className="ts-toolbar"><button type="button" className="ts-filter-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 4h18l-7 8v7l-4 2v-9z" /></svg> Filters</button>
        <div className="ts-qtybar" role="group" aria-label="Quantity">{quantityOptions.map((option) => <button type="button" key={option.key} className="ts-qtybtn" aria-pressed={quantity === option.key} onClick={() => { setQuantity(option.key); setFilter((current) => ({ ...current, priceMax: null })); }}>{option.label}</button>)}</div>
        <div className="ts-sort"><label className="ts-sort-l" htmlFor="tsSort">Sort</label><select id="tsSort" className="ts-sort-sel" value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">Recommended</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="name-asc">Name: A to Z</option></select></div>
        <span className="ts-showing">Showing {sorted.length} of {state.results.length}</span>
      </div>
      <div className="ts-workspace"><FilterSidebar results={state.results} quantity={quantity} filter={filter} setFilter={setFilter} open={filtersOpen} clear={clearFilters} /><div className="ts-grid-wrap">{sorted.length ? <div className="ts-res-grid">{sorted.map((tire, index) => <TireCard key={`${tire.partCode || tire.description}-${index}`} tire={tire} quantity={quantity} size={state.size} onDetails={(item, trigger) => setDetail({ item, trigger })} />)}</div> : <ResultState type="inline" title="No matches for these filters">Try clearing a filter to see more tires.<button type="button" className="ts-btn-ghost" onClick={clearFilters}>Clear filters</button></ResultState>}</div></div>
    </>}
    {detail && <TireDetails tire={detail.item} size={state.size} quantity={quantity} returnFocus={detail.trigger} onClose={closeDetails} />}
  </div>;
}

export function TireFinder({ node }) {
  const variant = node.name === 'section' ? 'tires' : 'home';
  const [values, setValues] = useState({ width: '', ratio: '', diameter: '' });
  const [state, setState] = useState({ status: 'idle', results: [], size: '' });
  const pending = useRef(null);
  const searchCount = useRef(0);
  const lastQuery = useRef(null);
  const isHome = variant === 'home';
  const query = useMemo(() => ({ width: values.width.replace(/\D/g, ''), ratio: values.ratio.replace(/\D/g, ''), diameter: values.diameter.replace(/\D/g, '') }), [values]);

  useEffect(() => () => pending.current?.abort(), []);
  const updateValue = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const runSearch = async (dimensionsToSearch = query) => {
    if (!dimensionsToSearch.width || !dimensionsToSearch.ratio || !dimensionsToSearch.diameter || pending.current) return;
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    lastQuery.current = dimensionsToSearch;
    const size = `${dimensionsToSearch.width}/${dimensionsToSearch.ratio}R${dimensionsToSearch.diameter}`;
    const searchId = ++searchCount.current;
    setState({ status: 'loading', results: [], size, searchId });
    try {
      const payload = await searchTires(dimensionsToSearch, { signal: controller.signal });
      if (controller.signal.aborted) return;
      setState({ status: payload.results.length ? 'ready' : 'empty', results: payload.results, size: payload.size || size, searchId });
    } catch (error) {
      if (controller.signal.aborted) return;
      setState({ status: 'error', results: [], size, error, searchId });
    } finally {
      if (pending.current === controller) pending.current = null;
    }
  };
  const retry = () => lastQuery.current && runSearch(lastQuery.current);
  const value = { values, updateValue, search: () => runSearch(), status: state.status, query };

  const children = domToReact(node.children, { replace(child) {
    if (child?.attribs?.class?.split(' ').includes('finder-inputs')) return <FinderInputs variant={variant} sourceProps={attributesToProps(child.attribs)} />;
    return undefined;
  } });
  const attributes = attributesToProps(node.attribs);
  delete attributes['data-finder'];
  return <SearchContext.Provider value={value}>
    {createElement(node.name, { ...attributes, 'data-finder': '' }, children)}
    <SearchResults state={state} retry={retry} />
  </SearchContext.Provider>;
}

export function replaceFinderNode(node) {
  return <TireFinder node={node} />;
}
