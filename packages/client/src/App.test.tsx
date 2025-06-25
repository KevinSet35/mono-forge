
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the HomePage component since we're only testing App structure
jest.mock('./pages/HomePage', () => {
    return function MockedHomePage() {
        return <div data-testid="home-page">Home Page Content</div>;
    };
});

describe('App Component', () => {
    test('renders App with main element', () => {
        render(<App />);

        // Test that main element exists
        const mainElement = screen.getByRole('main');
        expect(mainElement).toBeInTheDocument();
    });

    test('renders HomePage component', () => {
        render(<App />);

        // Test that HomePage is rendered
        const homePageElement = screen.getByTestId('home-page');
        expect(homePageElement).toBeInTheDocument();
    });

    test('has correct App class structure', () => {
        const { container } = render(<App />);

        // Test that App div exists
        const appDiv = container.querySelector('.App');
        expect(appDiv).toBeInTheDocument();
    });
});