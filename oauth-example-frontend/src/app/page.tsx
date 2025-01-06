'use client';
import { useState, useEffect } from 'react';
import { environment } from './env';
const Home = () => {
	const [showButton, setShowButton] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setShowButton(true);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	const handleRedirect = async () => {
		location.href = `${environment.backend_url}/api/public/login/redirect`;
	};

	return (
		<main className='flex flex-col items-center justify-center h-screen gap-10 transition-all duration-500'>
			<h1
				className={`font-bold text-5xl transition-transform duration-500 ${
					showButton ? 'translate-y-0' : 'translate-y-10'
				}`}
			>
				OAuth Example App
			</h1>
			<div
				className={`transition-opacity duration-500 ${
					showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
				}`}
			>
				<button
					className='bg-slate-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition-colors duration-300'
					onClick={handleRedirect}
				>
					Sign in With KMUTT Account
				</button>
			</div>
		</main>
	);
};

export default Home;
