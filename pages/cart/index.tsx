import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
	getCartItemsFetchStatus,
	getNumOfItemsInCart,
	setCartItems,
	setCartItemsFetchStatus
} from '../../store/cartSlice';
import { supabase } from '$lib/supabase';
import { Cart } from '$lib/types/cart';
import Loader from 'components/misc/Loading';
import CartItemsSection from 'components/cart/CartItemsSection';

const Cart: NextPage = () => {
	const dispatch = useAppDispatch();

	const numOfItemsInCart = useAppSelector(getNumOfItemsInCart);
	const cartItemsFetchStatus = useAppSelector(getCartItemsFetchStatus);

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	let user = supabase.auth.user();

	const fetchAndSetCartItems = async () => {
		console.log('fetching from db');

		if (!user) return;

		setIsLoading(true);

		const { data, error: sbError } = await supabase
			.from('cart')
			.select('*, product (id, name, price)')
			.eq('user', user.id);

		setIsLoading(false);

		if (sbError) {
			console.error('error while reading cart', sbError);
			setError('There was some error fetching cart items.');

			return;
		}

		dispatch(setCartItems(data as Cart[]));
		dispatch(setCartItemsFetchStatus('FETCHED'));
	};

	useEffect(() => {
		if (cartItemsFetchStatus === 'FETCHED') return;

		fetchAndSetCartItems();
	}, []);

	supabase.auth.onAuthStateChange((event) => {
		if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
			dispatch(setCartItems([]));

			return;
		}

		fetchAndSetCartItems();
	});

	if (error) {
		return <h1>Oops! There was an error fetching your cart.</h1>;
	}

	if (isLoading) {
		return <Loader />;
	}

	if (!numOfItemsInCart) return <h3>There are no items in your cart.</h3>;

	return (
		<>
			<CartItemsSection setIsLoading={setIsLoading} setError={setError} />
		</>
	);
};

export default Cart;
