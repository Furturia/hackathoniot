'use client';
import { useEffect, useState } from 'react';
import { environment } from '../env';

type User = {
	id: number;
	firstname: string;
	lastname: string;
};

const InitialUser: User = {
	id: 0,
	firstname: '',
	lastname: '',
};

const MePage = () => {
	const [user, setUser] = useState<User>(InitialUser);
	const handleFetchUserData = async () => {
		const res = await fetch(`${environment.backend_url}/api/profile/me`, {
			method: 'GET',
			credentials: 'include',
		});
		if (res.ok) {
			const { data } = await res.json();
			setUser(data);
			console.log(data);
		}
	};
	useEffect(() => {
		handleFetchUserData();
	}, []);
	return (
		<main className='me flex flex-col items-center justify-center h-screen'>
			<h1 className='font-bold text-3xl'>You Are</h1>
			<h1 className='font-semibold text-4xl'>{user.firstname.toLowerCase()}</h1>
		</main>
	);
};

export default MePage;
