import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';

// Mock the hooks
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@test.com', user_metadata: { full_name: 'Test User' } },
    signOut: vi.fn(),
  }),
}));

vi.mock('../hooks/useAlerts', () => ({
  useAlerts: () => ({
    unreadCount: 5,
  }),
}));

vi.mock('../hooks/useSearch', () => ({
  useSearch: () => ({
    setQuery: vi.fn(),
  }),
}));

describe('Layout Accessibility', () => {
  it('Header should have accessible inputs and buttons', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    const searchInput = screen.getByRole('textbox', { name: /buscar equipos/i });
    expect(searchInput).toBeInTheDocument();

    const notifBtn = screen.getByRole('button', { name: /notificaciones/i });
    expect(notifBtn).toBeInTheDocument();
    expect(notifBtn).toHaveClass('focus-visible:outline-[var(--accent)]');
  });

  it('Sidebar should have accessible buttons and links', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    const openMenuBtn = screen.getByRole('button', { name: /abrir menú/i });
    expect(openMenuBtn).toBeInTheDocument();
    expect(openMenuBtn).toHaveClass('focus-visible:outline-[var(--accent)]');

    const closeMenuBtn = screen.getByRole('button', { name: /cerrar menú/i });
    expect(closeMenuBtn).toBeInTheDocument();
    expect(closeMenuBtn).toHaveClass('focus-visible:outline-[var(--accent)]');

    const logoutBtn = screen.getByRole('button', { name: /cerrar sesion/i });
    expect(logoutBtn).toBeInTheDocument();
    expect(logoutBtn).toHaveClass('focus-visible:outline-[var(--accent)]');

    const navLinks = screen.getAllByRole('link');
    expect(navLinks.length).toBeGreaterThan(0);
    navLinks.forEach(link => {
        expect(link).toHaveClass('focus-visible:outline-[var(--accent)]');
    });
  });
});
