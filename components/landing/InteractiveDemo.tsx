'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface SampleRole {
  id: string;
  name: string;
  company: string;
  title: string;
  location: string;
  salary: string;
  seniority: string;
  tags: string[];
  summary: string;
}

const SAMPLE_ROLES: SampleRole[] = [
  {
    id: 'google',
    name: 'Google Security Role',
    company: 'Google',
    title: 'Senior Security Engineer',
    location: 'Mountain View, CA (Hybrid)',
    salary: '$165,000 - $235,000 / year',
    seniority: 'Senior Level',
    tags: ['Kubernetes', 'Zero-Trust', 'Go / Python', 'Cloud Architecture'],
    summary:
      'Focuses on infrastructure hardening, container security, and automated vulnerability triage. Requires 5+ years in cloud defense.',
  },
  {
    id: 'stripe',
    name: 'Stripe Payments Role',
    company: 'Stripe',
    title: 'Staff Backend Engineer',
    location: 'Remote (US/Canada)',
    salary: '$190,000 - $260,000 / year',
    seniority: 'Staff Level',
    tags: ['Distributed Systems', 'Java / Ruby', 'High-Throughput', 'PostgreSQL'],
    summary:
      'Designing global financial ledger pipelines processing billions daily. Strong emphasis on concurrency, reliability, and low latency.',
  },
  {
    id: 'anthropic',
    name: 'Anthropic AI Role',
    company: 'Anthropic',
    title: 'Fullstack Research Engineer',
    location: 'San Francisco, CA',
    salary: '$200,000 - $280,000 / year',
    seniority: 'Senior / Lead',
    tags: ['Next.js', 'TypeScript', 'LLM Evaluations', 'Python APIs'],
    summary:
      'Building human-in-the-loop evaluation tools and safety interfaces for frontier Claude models. Fast-moving team environment.',
  },
];

export function InteractiveDemo() {
  const [selectedRole, setSelectedRole] = useState<SampleRole>(SAMPLE_ROLES[0]);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSelect = (role: SampleRole) => {
    if (role.id === selectedRole.id) return;
    setIsSimulating(true);
    setTimeout(() => {
      setSelectedRole(role);
      setIsSimulating(false);
    }, 450);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '960px',
        margin: '0 auto',
        backgroundColor: 'var(--md-sys-color-surface-container-lowest)',
        border: '1px solid var(--md-sys-color-outline-variant)',
        borderRadius: '28px',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Demo Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--md-sys-color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              marginBottom: '0.25rem',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              bolt
            </span>
            Interactive Live Demo
          </span>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--md-sys-color-on-surface)',
            }}
          >
            See how AI extracts data instantly
          </h3>
        </div>

        {/* Sample Selection Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {SAMPLE_ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => handleSelect(role)}
              style={{
                padding: '0.4rem 0.875rem',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border:
                  selectedRole.id === role.id
                    ? '1px solid var(--md-sys-color-primary)'
                    : '1px solid var(--md-sys-color-outline-variant)',
                backgroundColor:
                  selectedRole.id === role.id
                    ? 'var(--md-sys-color-primary-container)'
                    : 'var(--md-sys-color-surface-container-low)',
                color:
                  selectedRole.id === role.id
                    ? 'var(--md-sys-color-on-primary-container)'
                    : 'var(--md-sys-color-on-surface-variant)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {role.company}
            </button>
          ))}
        </div>
      </div>

      {/* Extracted Data Grid Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          opacity: isSimulating ? 0.35 : 1,
          transform: isSimulating ? 'scale(0.99)' : 'scale(1)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Role & Company Tile */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid var(--md-sys-color-outline-variant)',
            gridColumn: 'span 2',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--md-sys-color-secondary)',
                textTransform: 'uppercase',
              }}
            >
              Extracted Role & Company
            </span>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '16px', color: 'var(--md-sys-color-primary)' }}
            >
              auto_awesome
            </span>
          </div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--md-sys-color-on-surface)',
              marginBottom: '0.25rem',
            }}
          >
            {selectedRole.title}
          </div>
          <div
            style={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: 'var(--md-sys-color-primary)',
            }}
          >
            {selectedRole.company}
          </div>
        </div>

        {/* Salary Range */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid var(--md-sys-color-outline-variant)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--md-sys-color-secondary)',
                textTransform: 'uppercase',
              }}
            >
              Target Salary
            </span>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '16px', color: 'var(--md-sys-color-primary)' }}
            >
              payments
            </span>
          </div>
          <div
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--status-offer-text)',
            }}
          >
            {selectedRole.salary}
          </div>
        </div>

        {/* Location */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid var(--md-sys-color-outline-variant)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--md-sys-color-secondary)',
                textTransform: 'uppercase',
              }}
            >
              Location
            </span>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '16px', color: 'var(--md-sys-color-primary)' }}
            >
              location_on
            </span>
          </div>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--md-sys-color-on-surface)',
            }}
          >
            {selectedRole.location}
          </div>
        </div>

        {/* Seniority */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid var(--md-sys-color-outline-variant)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--md-sys-color-secondary)',
                textTransform: 'uppercase',
              }}
            >
              Seniority
            </span>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '16px', color: 'var(--md-sys-color-primary)' }}
            >
              stairs
            </span>
          </div>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--md-sys-color-on-surface)',
            }}
          >
            {selectedRole.seniority}
          </div>
        </div>

        {/* Extracted Tech Stack & Summary */}
        <div
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-low)',
            borderRadius: '16px',
            padding: '1.25rem',
            border: '1px solid var(--md-sys-color-outline-variant)',
            gridColumn: '1 / -1',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--md-sys-color-secondary)',
                textTransform: 'uppercase',
              }}
            >
              Key Requirements & Highlights
            </span>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {selectedRole.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: 'var(--md-sys-color-secondary-container)',
                    color: 'var(--md-sys-color-on-secondary-container)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <p
            style={{
              fontSize: '0.9375rem',
              lineHeight: 1.6,
              color: 'var(--md-sys-color-on-surface-variant)',
            }}
          >
            {selectedRole.summary}
          </p>
        </div>
      </div>

      {/* Demo Footer Action */}
      <div
        style={{
          marginTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--md-sys-color-outline-variant)',
        }}
      >
        <span
          style={{
            fontSize: '0.875rem',
            color: 'var(--md-sys-color-on-surface-variant)',
          }}
        >
          ⚡ Extracted in <strong>1.2 seconds</strong> with Anthropic Claude AI
        </span>

        <Link href="/signup" className="btn-pill-primary" style={{ padding: '0.65rem 1.5rem', fontSize: '0.875rem' }}>
          <span>Try with Your Own Link</span>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            arrow_forward
          </span>
        </Link>
      </div>
    </div>
  );
}
