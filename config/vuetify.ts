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
        rounded: 'xl',
      },
      VBtn: {
        rounded: 'xl',
        elevation: 0,
      },
      VTextField: {
        rounded: 'xl',
        variant: 'outlined',
        density: 'compact',
        hideDetails: 'auto',
      },
      VCheckbox: {
        rounded: 'xl',
        hideDetails: 'auto',
      },
      VTextarea: {
        rounded: 'xl',
        variant: 'outlined',
      },
      VList: {
        // variant: 'plain',
      },
      V45: {
        // rounded: 'xl',
        // variant: 'plain',
      },
      VMenu: {
        // rounded: 'xl',
      },
      VCard: {
        rounded: 'xl',
      },
      VFab: {
        rounded: 'xl',
      },
      VSelect: {
        rounded: 'xl',
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
