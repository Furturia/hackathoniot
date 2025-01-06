'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { environment } from '../env';
import { useEffect } from 'react';

const AuthRedirectPage = () => {
	const navigator = useRouter();
	const code = useSearchParams().get('code');
	const handleCallback = async () => {
		const res = await fetch(`${environment.backend_url}/api/public/login/callback`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ code }),
			credentials: 'include',
		});

		console.log(res);

		if (res.ok) {
			navigator.push('/me');
		}
	};

	useEffect(() => {
		handleCallback();
	}, []);
	return (
		<div>
			<h1>Redirecting. . .</h1>
		</div>
	);
};

export default AuthRedirectPage;
