import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

// Test
export function Button({
    className = '',
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button className={`tintora-button ${className}`} {...props} />;
}
