'use client';

import { clsx } from '../utils/clsx';
import { useState, type HTMLAttributes } from 'react';
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

export function Avatar({
    name,
    src,
    size = 'medium',
    className,
    ...props
}: AvatarProps) {
    // Remember which URL failed, so a new `src` gets a fresh attempt.
    const [failedSrc, setFailedSrc] = useState<string>();
    const showImage = Boolean(src) && src !== failedSrc;

    return (
        <span
            role="img"
            aria-label={name}
            {...props}
            className={clsx(
                'tintora-avatar',
                `tintora-avatar--${size}`,
                className,
            )}
        >
            {showImage ? (
                <img src={src} alt="" onError={() => setFailedSrc(src)} />
            ) : (
                getCapitalFirstLetters(name)
            )}
        </span>
    );
}
