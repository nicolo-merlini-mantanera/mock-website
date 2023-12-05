import {json, redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {
  Pagination,
  getPaginationVariables,
  Image,
  Money,
} from '@shopify/hydrogen';
import {colorMap, useVariantUrl} from '~/utils';
import {NavArrowRight} from 'iconoir-react';
import HomeLayout from '~/components/HomeLayout';
import {useCallback, useState} from 'react';
import {Product, Image as TImage} from '@shopify/hydrogen/storefront-api-types';
import {ProductItemFragment} from 'storefrontapi.generated';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Hydrogen | ${data?.collection.title ?? ''} Collection`}];
};

export async function loader({request, params, context}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  if (!handle) {
    return redirect('/collections');
  }

  console.log('handle', handle);

  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {handle, ...paginationVariables},
  });

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }
  return json({collection});
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();
  console.log('collezione', collection);

  return (
    <HomeLayout>
      <div className="flex gap-3">
        {/* 
        //todo creare logica per link dinamici
         */}
        <p className="underline hover:text-[#707070] cursor-pointer underline-offset-[5px] uppercase text-xs">
          Home
        </p>
        <NavArrowRight
          width={14}
          height={14}
          className="my-auto text-[#707070]"
        />
        <p className="text-[#707070] text-xs">{collection.title}</p>
      </div>
      <Pagination connection={collection.products}>
        {({nodes, isLoading, PreviousLink, NextLink}) => (
          <>
            <PreviousLink>
              {isLoading ? 'Loading...' : <span>↑ Load previous</span>}
            </PreviousLink>
            <h1 className="text-center text-5xl font-extralight py-4 uppercase">
              {collection.title}
            </h1>
            <ProductsGrid products={nodes} />
            <br />
            <NextLink>
              {isLoading ? 'Loading...' : <span>Load more ↓</span>}
            </NextLink>
          </>
        )}
      </Pagination>
    </HomeLayout>
  );
}

function ProductsGrid({products}: {products: ProductItemFragment[]}) {
  return (
    <div className="grid grid-cols-4 gap-32 mt-8">
      {products.map((product, index) => {
        return (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
          />
        );
      })}
    </div>
  );
}

function ProductItem({
  product,
  loading,
}: {
  product: ProductItemFragment;
  loading?: 'eager' | 'lazy';
}) {
  const [colorVariant, setColorVariant] = useState(product.variants.nodes[0]);
  const URL = useVariantUrl(product.handle, colorVariant.selectedOptions);

  const [image, setImage] = useState<
    | Pick<TImage, 'id' | 'altText' | 'url' | 'width' | 'height'>
    | null
    | undefined
  >(product?.featuredImage);

  const handleChangeColorImage = (colorName: string) => {
    const variant = product.variants.nodes.find(
      (v) => v.selectedOptions[0].value === colorName,
    );

    if (!variant || (image && variant?.image?.url === image.url)) return;
    setImage(variant.image);
    setColorVariant(variant);
  };

  return (
    <div className="grid">
      <Link
        key={product.id}
        prefetch="intent"
        to={URL}
        style={{textDecoration: 'none'}}
      >
        {image && (
          <Image
            alt={image?.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
          />
        )}
        <h4 className="text-center uppercase text-[18px] font-[300] hover:text-[#e6c6c7] px-6 leading-6 mt-4 mb-0">
          {product.title}
        </h4>
        <p className="text-[12px] font-light text-center my-[4px]">
          {product.product_subtitle?.value}
        </p>
      </Link>
      <small>
        <Money
          data={product.priceRange.minVariantPrice}
          className="text-[15px] font-medium text-center mt-[3px]"
          withoutTrailingZeros={true}
        />
      </small>
      <div className="flex justify-center gap-[5px] mt-2">
        {product.variants.nodes.map((variant) => (
          <div key={variant.id}>
            {variant.selectedOptions.map((option) => {
              const color = colorMap.find(
                (color) => color.name === option.value,
              );
              return (
                <div key={color?.name}>
                  {color ? (
                    <CircleColor
                      color={color}
                      handleChangeColorImage={handleChangeColorImage}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function CircleColor({
  color,
  handleChangeColorImage,
}: {
  color: {name: string; cssColor: string};
  handleChangeColorImage: (colorName: string) => void;
}) {
  return (
    <div
      style={{backgroundColor: color.cssColor}}
      onMouseEnter={() => handleChangeColorImage(color.name)}
      className={`w-4 h-4 rounded-full border-[1px] border-gray-100 cursor-pointer`}
    ></div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    images(first:20){
      nodes{
        url
        altText
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    product_subtitle: metafield(key:"subtitle", namespace:"descriptors"){
      value
    }
    variants(first: 10) {
      nodes {
        image {
          id
          altText
          url
          width
          height
        }
        id
        selectedOptions {
          name
          value
        }
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;
