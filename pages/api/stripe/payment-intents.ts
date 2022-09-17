import { NextApiRequest, NextApiResponse } from 'next';
import { initStripe } from '$lib/stripe';
import { getServiceSupabase } from '$lib/supabase';

const stripe = initStripe();
const supabaseService = getServiceSupabase();

const createPaymentIntent = async ({
	amount,
	customerId,
	userUid,
	products
}: {
	amount: number;
	customerId: string;
	userUid: string;
	products: any[];
}) => {
	const paymentIntent = await stripe.paymentIntents.create({
		amount,
		currency: 'usd',
		automatic_payment_methods: { enabled: true },
		customer: customerId,
		metadata: { userUid, products: JSON.stringify(products) }
	});

	return paymentIntent;
};

const getUserCart = async (userUid: string) => {
	const { data, error } = await supabaseService
		.from('cart')
		.select('*, product (id, name, price)')
		.eq('user', userUid);

	if (error) throw error;

	return data as any[];
};

const getCartTotal = (cart: any[]) => {
	const cartTotal = +cart
		.reduce(
			(total, cartItem) => total + cartItem.quantity * cartItem.product.price,
			0
		)
		.toFixed(2);

	console.log('cart total', cartTotal);

	return cartTotal;
};

const getCartProducts = (cart: any[]) => {
	const cartProducts = cart.map((cartItem) => ({
		id: cartItem.product.id,
		name: cartItem.product.name,
		price: cartItem.product.price,
		quantity: cartItem.quantity
	}));

	return cartProducts;
};

const getUserCustomer = async (id: string) => {
	const { data, error } = await supabaseService
		.from('users')
		.select('stripeCustomer')
		.eq('uid', id)
		.single();

	if (error) throw error;

	return data.stripeCustomer;
};

const PaymentIntents = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== 'POST')
		return res
			.status(406)
			.json({ message: 'This http method is invalid for this endpoint.' });

	const { useruid: userUid, ordermethod: orderMethod } = req.headers;

	if (!userUid)
		return res
			.status(401)
			.json({ message: 'Please authenticate before checkout.' });

	let totalAmount: number;

	if (orderMethod !== 'CART' && orderMethod !== 'BUY')
		return res.status(400).json({ message: 'Invalid order method.' });

	const stripeCustomer = await getUserCustomer(userUid as string);

	if (orderMethod === 'BUY') {
		if (!req.body.product)
			return res.status(400).json({ message: 'Please provide product id' });

		const { data } = await supabaseService
			.from('products')
			.select('*')
			.eq('id', req.body.product)
			.single();

		if (!data)
			return res
				.status(404)
				.json({ message: 'There is no product with the specified id' });

		const paymentIntent = await createPaymentIntent({
			amount: +(data.price * 100).toFixed(2),
			customerId: stripeCustomer,
			userUid: userUid as string,
			products: [
				{
					id: data.id,
					name: data.name,
					price: data.price,
					qty: req.body.qty || 1
				}
			]
		});

		return res.status(201).json({ clientSecret: paymentIntent.client_secret });
	}

	const userCart = await getUserCart(userUid as string);

	if (userCart.length === 0)
		return res.status(400).json({ message: 'User cart is empty.' });

	totalAmount = getCartTotal(userCart);

	const cartProducts = getCartProducts(userCart);

	const paymentIntent = await createPaymentIntent({
		amount: +(totalAmount * 100).toFixed(2),
		customerId: stripeCustomer,
		userUid: userUid as string,
		products: cartProducts
	});

	return res.status(201).json({ clientSecret: paymentIntent.client_secret });
};

export default PaymentIntents;
