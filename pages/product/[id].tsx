import { GetServerSideProps } from 'next';
import type { NextPage } from 'next';
import { useState } from 'react';
//import { Product } from '$types/product';
import { supabase } from '$lib/supabase';
import { useAppDispatch } from '../../app/hooks';
import { addItemToCart } from '../../store/cartSlice';
//import { Cart, CartDB } from '$types/cart';

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
	const id = params!.id;

	const getProductInfo = async () => {
		const { data } = await supabase.from('products').select('*').eq('id', id);

		return data;
	};

	const productInfo = await getProductInfo();

	return {
		props: {
			product: productInfo ? productInfo[0] : null
		}
	};
};

const ProductPage: NextPage<{ product: any }> = ({ product }) => {
	const [qty, setQty] = useState<number>(1);

	const [error, setError] = useState<string>('');

	const dispatch = useAppDispatch();

	const addToCart = async () => {
		const { data, error: sbError } = await supabase
			.from('cart')
			.insert({ product: product.id, quantity: qty })
			.single();

		if (sbError) {
			setError(sbError.message);
			console.error('the error while adding item to cart', sbError);

			return;
		}

		dispatch(addItemToCart({ id: data.id, product, quantity: qty }));
	};

	return (
		<>
			<h1>{product.name}</h1>
			<h3>${product.price}</h3>

			<label htmlFor="qty">Quantity</label>
			<input
				type="number"
				id="qty"
				onChange={(e) => setQty(+e.target.value)}
				value={qty}
			/>

			<button
				className="btn btn-primary"
				onClick={addToCart}
				disabled={qty < 1}
			>
				add item to cart
			</button>
		</>
	);
};

export default ProductPage;
