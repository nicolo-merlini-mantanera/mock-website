import { Await, Link, NavLink } from '@remix-run/react';
import { Suspense } from 'react';
import type { HeaderQuery } from 'storefrontapi.generated';
import type { LayoutProps } from './Layout';
import { useRootLoaderData } from '~/root';
import { Image } from '@shopify/hydrogen';
import { Heart, Iconoir, Mail, Search, User } from 'iconoir-react';

type HeaderProps = Pick<LayoutProps, 'header' | 'cart' | 'isLoggedIn'>;

type Viewport = 'desktop' | 'mobile';

export function Header({ header, isLoggedIn, cart }: HeaderProps) {

  const { shop, menu } = header;

  return (
    <header>
      <Banner />
      <div
        className='grid grid-cols-3 p-4'
      >
        <div
          className='flex gap-4 font-light'
        >
          <p className='text-xs'>
            Spedisci in: Italia
          </p>
          <p className='text-xs'>
            Lingua: Ita
          </p>
        </div>
        <NavLink prefetch="intent" to="/" end
          style={{ textDecoration: 'none' }}
          className={'flex justify-center uppercase text-2xl font-light '}
        >
          {shop.name}
        </NavLink>
        <div className='flex gap-4 justify-end'>
          <Search
            className='hover:text-[#e6c6c7] cursor-pointer'
            width={18}
            height={18}
          />
          <User
            className='hover:text-[#e6c6c7] cursor-pointer'
            width={18}
            height={18}
          />
          <Mail
            className='hover:text-[#e6c6c7] cursor-pointer'
            width={18}
            height={18}
          />
          <Heart
            className='hover:text-[#e6c6c7] cursor-pointer'
            width={18}
            height={18}
          />
        </div>

      </div>

      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
      />
      {/* //TODO */}
      {/* <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} /> */}
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
  viewport: Viewport;
}) {
  const { publicStoreDomain } = useRootLoaderData();
  const className = `header-menu-${viewport}`;
  console.log(menu);

  function closeAside(event: React.MouseEvent<HTMLAnchorElement>) {
    if (viewport === 'mobile') {
      event.preventDefault();
      window.location.href = event.currentTarget.href;
    }
  }

  return (
    <nav className='flex p-3 justify-center gap-[60px] text-sm font-bold' role="navigation">
      {viewport === 'mobile' && (
        <NavLink
          end
          onClick={closeAside}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item, i) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
            item.url.includes(publicStoreDomain) ||
            item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <Link
            key={item.id}
            onClick={closeAside}
            prefetch="intent"
            to={url}
            className={`cursor-pointer hover:underline underline-offset-[6px] ${i > 2 ? 'text-[#e3b4ba]' : ''} hover:text-black`}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        {isLoggedIn ? 'Account' : 'Sign in'}
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  return (
    <a className="header-menu-mobile-toggle" href="#mobile-menu-aside">
      <h3>☰</h3>
    </a>
  );
}

function SearchToggle() {
  return <a href="#search-aside">Search</a>;
}

function CartBadge({ count }: { count: number }) {
  return <a href="#cart-aside">Cart {count}</a>;
}

function CartToggle({ cart }: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        {(cart) => {
          if (!cart) return <CartBadge count={0} />;
          return <CartBadge count={cart.totalQuantity || 0} />;
        }}
      </Await>
    </Suspense>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}

const Banner = () => {
  return (
    <div className='bg-[#e6c6c7] w-full text-center p-2'>
      <p
        className='text-xs text-white font-extrabold uppercase'
      >
        APPROFITTA DELLA SPEDIZIONE GRATUITA SU TUTTO IL SITO
      </p>
    </div>
  )
}

