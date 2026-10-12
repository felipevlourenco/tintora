import type { CSSProperties, ReactNode } from 'react';
import {
    constants,
    lightThemed,
    shortName,
    themed,
    withPrefix,
    type Token,
} from './tokens';

type Theme = 'dark' | 'light';

/** Docs pages are light; the story canvas styling would otherwise make text white. */
const docsText: CSSProperties = { colorScheme: 'light', color: 'CanvasText' };

const mono: CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12,
};

/** A themed canvas, so tokens resolve (and translucent ones read) correctly. */
function ThemeScope({
    theme,
    title,
    children,
}: {
    theme: Theme;
    title?: string;
    children: ReactNode;
}) {
    return (
        <div
            data-theme={theme}
            style={{
                background: 'var(--tintora-bg)',
                color: 'var(--tintora-text)',
                fontFamily: 'var(--tintora-font-family)',
                border: '1px solid var(--tintora-border-glass)',
                borderRadius: 'var(--tintora-radius-26)',
                padding: 24,
                margin: '16px 0',
            }}
        >
            {title && (
                <div
                    style={{
                        font: 'var(--tintora-font-label)',
                        color: 'var(--tintora-text-muted)',
                        marginBottom: 16,
                    }}
                >
                    {title}
                </div>
            )}
            {children}
        </div>
    );
}

const ellipsis: CSSProperties = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
};

const grid = (min: number): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`,
    gap: 16,
});

/** Constant brand/status colours, with the text colour to use on top. */
export function Palette() {
    const colors = withPrefix(constants, 'color-').filter(
        (t) => !t.name.includes('-on-'),
    );
    return (
        <ThemeScope theme="dark">
            <div style={grid(130)}>
                {colors.map((t) => {
                    const id = shortName(t.name).replace('color-', '');
                    const hasOn = constants.some(
                        (c) => c.name === `--tintora-color-on-${id}`,
                    );
                    return (
                        <div key={t.name}>
                            <div
                                style={{
                                    height: 64,
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    padding: '8px 10px',
                                    boxSizing: 'border-box',
                                    borderRadius: 'var(--tintora-radius-18)',
                                    border: '1px solid var(--tintora-line)',
                                    background: `var(${t.name})`,
                                    color: hasOn
                                        ? `var(--tintora-color-on-${id})`
                                        : '#ffffff',
                                    font: 'var(--tintora-font-caption)',
                                    fontWeight: 700,
                                }}
                            >
                                {t.value.toUpperCase()}
                            </div>
                            <div
                                style={{
                                    font: 'var(--tintora-font-label)',
                                    marginTop: 8,
                                }}
                            >
                                {id}
                            </div>
                            <code
                                style={{
                                    ...mono,
                                    color: 'var(--tintora-text-muted)',
                                }}
                            >
                                {t.name}
                            </code>
                        </div>
                    );
                })}
            </div>
        </ThemeScope>
    );
}

const groupLabel: Record<string, string> = {
    surface: 'Surfaces',
    text: 'Text',
    border: 'Borders',
    line: 'Lines',
    fill: 'Interactive fills',
    tag: 'Tag',
    focus: 'Focus',
    ring: 'Selection ring',
    bg: 'Canvas',
};

function Cell({
    theme,
    name,
    value,
}: {
    theme: Theme;
    name: string;
    value: string;
}) {
    return (
        <div
            data-theme={theme}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 8,
                minWidth: 0,
                borderRadius: 'var(--tintora-radius-12)',
                background: 'var(--tintora-bg)',
                color: 'var(--tintora-text)',
            }}
        >
            <span
                style={{
                    flex: '0 0 28px',
                    height: 28,
                    borderRadius: 'var(--tintora-radius-8)',
                    border: '1px solid var(--tintora-line)',
                    background: `var(${name})`,
                }}
            />
            <code style={{ ...mono, ...ellipsis }} title={value}>
                {value}
            </code>
        </div>
    );
}

/** Every theme-dependent colour, dark next to light. */
export function ThemeColors() {
    const groups = new Map<string, Token[]>();
    for (const t of themed) {
        const group = shortName(t.name).split('-')[0];
        if (group === 'shadow') continue; // see Elevation
        groups.set(group, [...(groups.get(group) ?? []), t]);
    }
    return (
        <div style={docsText}>
            {[...groups].map(([group, tokens]) => (
                <section key={group} style={{ margin: '24px 0' }}>
                    <h3>{groupLabel[group] ?? group}</h3>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(180px, 1fr) 1fr 1fr',
                            gap: 8,
                            alignItems: 'center',
                        }}
                    >
                        {tokens.map((t) => (
                            <div key={t.name} style={{ display: 'contents' }}>
                                <code style={mono}>{t.name}</code>
                                <Cell
                                    theme="dark"
                                    name={t.name}
                                    value={t.value}
                                />
                                <Cell
                                    theme="light"
                                    name={t.name}
                                    value={
                                        lightThemed.find(
                                            (l) => l.name === t.name,
                                        )?.value ?? ''
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}

const SAMPLES: Record<string, string> = {
    display: 'Good Morning, Alex',
    title: 'Activity Tracking',
    heading: 'Running with resistance band',
    label: 'Calories',
    body: 'Strengthens your muscles',
    caption: 'Total distance covered',
    'stat-value': '9,886',
};

/** Every `font` shorthand token, rendered with its own style. */
export function TypeScale() {
    const styles = withPrefix(constants, 'font-').filter((t) =>
        t.value.includes('/'),
    );
    return (
        <ThemeScope theme="dark" title="Plus Jakarta Sans">
            {styles.map((t) => {
                const id = shortName(t.name).replace('font-', '');
                return (
                    <div
                        key={t.name}
                        style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            justifyContent: 'space-between',
                            gap: 16,
                            padding: '0 0 8px',
                            margin: '0 0 10px',
                            borderBottom: '1px solid var(--tintora-line)',
                        }}
                    >
                        <span style={{ font: `var(${t.name})` }}>
                            {SAMPLES[id] ?? 'The quick brown fox'}
                        </span>
                        <span
                            style={{
                                font: 'var(--tintora-font-caption)',
                                color: 'var(--tintora-text-faint)',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {id} · {t.note} · <code style={mono}>{t.name}</code>
                        </span>
                    </div>
                );
            })}
        </ThemeScope>
    );
}

/** font-family and weight tokens. */
export function FontBasics() {
    const basics = [
        ...withPrefix(constants, 'font-family'),
        ...withPrefix(constants, 'font-weight-'),
        ...withPrefix(constants, 'line-height-'),
    ];
    return (
        <table style={docsText}>
            <tbody>
                {basics.map((t) => (
                    <tr key={t.name}>
                        <td>
                            <code>{t.name}</code>
                        </td>
                        <td>
                            <code>{t.value}</code>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

/** `var(--tintora-radius-20)` -> `20px` */
const resolveAlias = (value: string) => {
    const ref = value.match(/^var\((--[\w-]+)\)$/)?.[1];
    return constants.find((c) => c.name === ref)?.value ?? value;
};

export function Radius() {
    const radii = withPrefix(constants, 'radius-');
    return (
        <ThemeScope theme="dark">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                {radii.map((t) => (
                    <div
                        key={t.name}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 6,
                            width: 76,
                        }}
                    >
                        <div
                            style={{
                                width: 52,
                                height: 52,
                                boxSizing: 'border-box',
                                border: '2px solid var(--tintora-text-faint)',
                                borderRadius: `var(${t.name})`,
                            }}
                        />
                        <span style={{ font: 'var(--tintora-font-caption)' }}>
                            {shortName(t.name).replace('radius-', '')}
                        </span>
                        <code style={mono}>{resolveAlias(t.value)}</code>
                    </div>
                ))}
            </div>
        </ThemeScope>
    );
}

const shadowBackground: Record<string, string> = {
    selected: 'var(--tintora-color-accent-deep)',
    primary: 'var(--tintora-color-accent-deep)',
    glass: 'var(--tintora-surface-glass)',
};

function Shadows({ theme }: { theme: Theme }) {
    const order = ['card', 'card-hover', 'selected', 'primary', 'glass'];
    const rank = (t: Token) =>
        order.indexOf(shortName(t.name).replace('shadow-', ''));
    const shadows = [
        ...withPrefix(constants, 'shadow-'),
        ...withPrefix(themed, 'shadow-'),
    ].sort((a, b) => rank(a) - rank(b));
    return (
        <ThemeScope theme={theme} title={theme === 'dark' ? 'Dark' : 'Light'}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28 }}>
                {shadows.map((t) => {
                    const id = shortName(t.name).replace('shadow-', '');
                    return (
                        <div
                            key={t.name}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 10,
                                width: 120,
                            }}
                        >
                            <div
                                style={{
                                    width: 96,
                                    height: 56,
                                    borderRadius: 'var(--tintora-radius-18)',
                                    background:
                                        shadowBackground[id] ??
                                        'var(--tintora-surface-card)',
                                    boxShadow: `var(${t.name})`,
                                }}
                            />
                            <span
                                style={{ font: 'var(--tintora-font-caption)' }}
                            >
                                {id}
                            </span>
                        </div>
                    );
                })}
            </div>
        </ThemeScope>
    );
}

export function Elevation() {
    return (
        <>
            <Shadows theme="dark" />
            <Shadows theme="light" />
        </>
    );
}
