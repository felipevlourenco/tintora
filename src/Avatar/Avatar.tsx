import clsx from 'clsx';
import type { HTMLAttributes } from 'react';
import './Avatar.css';
import { getCapitalFirstLetters } from './utils';

type AvatarSize = 'small' | 'medium' | 'large';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
    /** Full name. Used for the initials fallback and as the accessible name. */
    name: string;
    /** Image URL. When missing or failing to load, the initials are shown. */
    src?: string;
    /** @default 'medium' */
    size?: AvatarSize;
}

export function Avatar({ name, src, size = 'medium', ...props }: AvatarProps) {
    return (
        <span
            {...props}
            role="img"
            aria-label={name}
            className={clsx('tintora-avatar', `tintora-avatar--${size}`)}
        >
            {src ? <img src={src} alt="" /> : getCapitalFirstLetters(name)}
        </span>
    );
}
