export default {
    vuetifyOptions: {
        labComponents: false,
        icons: {
            defaultSet: 'mdi' as const,
            sets: [
                {
                    name: 'mdi' as const,
                    component: 'VIcon',
                },
            ],
        },
        defaults: {
            VAppBar: {
                elevation: 0,
            },
            VSheet: {
                elevation: 10,
                width: 300,
                class: 'pa-4',
            },
            VBtn: {
                rounded: 'lg',
                elevation: 0,
                variant: 'plain',
                ripple: false,
            },
            VTextField: {
                rounded: 'lg',
                variant: 'outlined',
                density: 'compact',
                hideDetails: 'auto',
            },
            VCheckbox: {
                rounded: 'lg',
                hideDetails: 'auto',
            },
            VTextarea: {
                rounded: 'lg',
                variant: 'outlined',
            },
            VMenu: {
                // rounded: 'lg',
            },
            VCard: {
                rounded: 'lg',
                ripple: false,
            },
            VFab: {
                rounded: 'lg',
            },
            VSelect: {
                rounded: 'lg',
                hideDetails: true,
            },
        },
        theme: {
            themes: {
                light: {
                    colors: {
                        // Primary
                        'primary': '#005ac2',
                        'on-primary': '#f7f7ff',
                        'primary-container': '#d8e2ff',
                        'on-primary-container': '#004eaa',
                        // Secondary
                        'secondary': '#506076',
                        'on-secondary': '#f7f9ff',
                        'secondary-container': '#d3e4fe',
                        'on-secondary-container': '#435368',
                        // Tertiary (urgency/overdue)
                        'tertiary': '#ba1b24',
                        'on-tertiary': '#fff7f6',
                        'tertiary-container': '#fd4e4d',
                        'on-tertiary-container': '#1f0001',
                        // Error
                        'error': '#9f403d',
                        'on-error': '#fff7f6',
                        'error-container': '#fe8983',
                        'on-error-container': '#752121',
                        // Surface & Background
                        'background': '#f7f9fb',
                        'on-background': '#2a3439',
                        'surface': '#f7f9fb',
                        'on-surface': '#2a3439',
                        'surface-variant': '#d9e4ea',
                        'on-surface-variant': '#566166',
                        'surface-container-lowest': '#ffffff',
                        'surface-container-low': '#f0f4f7',
                        'surface-container': '#e8eff3',
                        'surface-container-high': '#e1e9ee',
                        'surface-container-highest': '#d9e4ea',
                        'surface-dim': '#cfdce3',
                        'surface-bright': '#f7f9fb',
                        'surface-tint': '#005ac2',
                        // Outline
                        'outline': '#717c82',
                        'outline-variant': '#a9b4b9',
                        // Inverse
                        'inverse-primary': '#4d8eff',
                        'inverse-surface': '#0b0f10',
                        'inverse-on-surface': '#9a9d9f',
                    },
                },
                dark: {
                    colors: {
                        'primary': '#adc8ff',
                        'on-primary': '#002e6a',
                        'primary-container': '#1a3f80',
                        'on-primary-container': '#d8e2ff',
                        'secondary': '#b8c8e0',
                        'on-secondary': '#233240',
                        'secondary-container': '#394a5e',
                        'on-secondary-container': '#d3e4fe',
                        'tertiary': '#ff8f8e',
                        'on-tertiary': '#5a0000',
                        'tertiary-container': '#c0373a',
                        'on-tertiary-container': '#ffdad9',
                        'error': '#ffb4ab',
                        'on-error': '#561e1b',
                        'background': '#0e1416',
                        'on-background': '#dde3e7',
                        'surface': '#0e1416',
                        'on-surface': '#dde3e7',
                        'surface-variant': '#2a3439',
                        'on-surface-variant': '#a9b4b9',
                        'surface-container-lowest': '#090d0f',
                        'surface-container-low': '#161c1f',
                        'surface-container': '#1a2124',
                        'surface-container-high': '#242c2f',
                        'surface-container-highest': '#2f383b',
                        'outline': '#717c82',
                        'outline-variant': '#3a4448',
                        'inverse-primary': '#005ac2',
                        'inverse-surface': '#dde3e7',
                        'inverse-on-surface': '#2a3439',
                    },
                },
            },
        },
    },
};
