export default {
  vuetifyOptions: {
    labComponents: false,
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
      },
    },
    theme: {
      themes: {
        light: {
          colors: {
            secondary: '#FFFFFF',
          },
        },
        dark: {
          colors: {
            primary: '#FFFFFF',
            secondary: '#000000',
          },
        },
      },
    },
  },
}
