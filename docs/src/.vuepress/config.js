const { description } = require('../../package')

module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: 'APICURON Official Documentation',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: description,

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#4D194D' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['link', { rel: 'icon', type: "image/x-icon",  sizes:"180x180", href:"https://apicuron.org/assets/favicon/apple-touch-icon.png?v=Gv6aQQKvGz" }],
    ['link', { rel: 'icon', type: "image/x-icon",  sizes:"32x32", href:"https://apicuron.org/assets/favicon/favicon-32x32.png?v=Gv6aQQKvGz" }],
    ['link', { rel: 'icon', type: "image/x-icon",  sizes:"194x194", href:"https://apicuron.org/assets/favicon/favicon-194x194.png?v=Gv6aQQKvGz" }],
    ['link', { rel: 'icon', type: "image/x-icon",  sizes:"192x192", href:"https://apicuron.org/assets/favicon/android-chrome-192x192.png?v=Gv6aQQKvGz" }],
    ['link', { rel: 'icon', type: "image/x-icon",  sizes:"16x16", href:"https://apicuron.org/assets/favicon/favicon-16x16.png?v=Gv6aQQKvGz" }]
    
    
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    repo: '',
    editLinks: false,
    docsDir: '',
    editLinkText: '',
    lastUpdated: false,
    nav: [
      {
        text: 'Guide',
        link: '/guide/',
      },
      {
        text: 'Config',
        link: '/config/'
      },
      {
        text: 'VuePress',
        link: 'https://v1.vuepress.vuejs.org'
      }
    ],
    sidebar: {
      '/guide/': [
        {
          title: 'Guide',
          collapsable: false,
          children: [
            '',
            'using-vue',
          ]
        }
      ],
    }
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
  ]
}
