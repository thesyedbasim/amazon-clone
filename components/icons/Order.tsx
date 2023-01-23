import Link from 'next/link';

const OrderIcon: React.FC = () => {
	return (
		<Link href="/orders" passHref>
			<div className="relative">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="w-6"
					viewBox="0 0 512 512"
				>
					<title>Orders</title>
					<path
						d="M448 341.37V170.61A32 32 0 00432.11 143l-152-88.46a47.94 47.94 0 00-48.24 0L79.89 143A32 32 0 0064 170.61v170.76A32 32 0 0079.89 369l152 88.46a48 48 0 0048.24 0l152-88.46A32 32 0 00448 341.37z"
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="32"
					/>
					<path
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="32"
						d="M69 153.99l187 110 187-110M256 463.99v-200"
					/>
				</svg>
			</div>
		</Link>
	);
};

export default OrderIcon;
