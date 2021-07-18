import React from 'react';
import { render, screen, cleanup } from '@testing-library/react'
import Business from  '../../pages/business/Business'
import { MemoryRouter, Route} from 'react-router-dom';

afterEach(() => {
	cleanup();
})

test('Render Create Business', async () => {
	const { queryByTestId } = render(
		<MemoryRouter>
			<Route location={{ pathname: '/business/:id' }}>
				<Business />
			</Route>
			
		</MemoryRouter>,
		{
			route: '/business/8277'
		}
	);
	expect(queryByTestId("business-page")).toBeTruthy()
});