import React from 'react';
import { render, screen, cleanup } from '@testing-library/react'
import Home from  '../../pages/home/Home'
import { StaticRouter } from 'react-router-dom';

afterEach(() => {
	cleanup();
})

test('Render HomePage', async () => {
	render(
		<StaticRouter initialEntries={[ '/' ]}>
			<Home />
		</StaticRouter>
	);
	const homePage = screen.getAllByTestId('home-page');
});