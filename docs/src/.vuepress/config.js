const { description } = require("../../package");
module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: "APICURON Documentation",
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: description,

  base: "/docs/",

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ["meta", { name: "theme-color", content: "#4D194D" }],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    [
      "meta",
      { name: "apple-mobile-web-app-status-bar-style", content: "black" },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/x-icon",
        sizes: "180x180",
        href: "https://apicuron.org/assets/favicon/apple-touch-icon.png?v=Gv6aQQKvGz",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/x-icon",
        sizes: "32x32",
        href: "https://apicuron.org/assets/favicon/favicon-32x32.png?v=Gv6aQQKvGz",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/x-icon",
        sizes: "194x194",
        href: "https://apicuron.org/assets/favicon/favicon-194x194.png?v=Gv6aQQKvGz",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/x-icon",
        sizes: "192x192",
        href: "https://apicuron.org/assets/favicon/android-chrome-192x192.png?v=Gv6aQQKvGz",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/x-icon",
        sizes: "16x16",
        href: "https://apicuron.org/assets/favicon/favicon-16x16.png?v=Gv6aQQKvGz",
      },
    ],
  ],

  /**
   * Theme configuration, here is the default theme configuration for VuePress.
   *
   * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
   */
  themeConfig: {
    // TODO: Enable in the future
    // search: true,
    repo: "",
    editLinks: false,
    docsDir: "docs",
    editLinkText: "",
    lastUpdated: false,
    nav: [
      {
        text: "General Guide",
        link: "/main/guide/",
      },
      {
        text: "Developer Documentation",
        link: "/dev/",
      },
      {
        text: "Join Slack",
        link: "https://join.slack.com/t/apicuron/shared_invite/zt-1jir4nfu9-gDItsCVg7f0JoY8_mOht7w",
      },
      {
        text: "API Reference",
        link: "http://dev.apicuron.org/api/",
      },
    ],
    sidebar: {
      "/main/guide/": [
        {
          title: "General Guide",
          collapsable: false,
          children: ["/main/guide/"],
        },
      ],
      "/dev/": [
        ["/dev/", "Intro"],
        "/dev/integration",
        "/dev/widgets",
        "/dev/privacy",
        {
          title: "API",
          collapsable: false,
          children: [
            ["https://apicuron.org/api/", "API reference"],
            [
              "https://apicuron.org/api/#/Partner%20Resources",
              "Partner Resources",
            ],
            ["https://apicuron.org/api/#/Curation%20Terms", "Curation Terms"],
            [
              "https://apicuron.org/api/#/Achievements%20Definition",
              "Curation Terms",
            ],
            ["https://apicuron.org/api/#/Reports", "Reports"],
            ["https://apicuron.org/api/#/Statistics", "Statistics"],
          ],
        },
      ],
    },
  },

  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: ["@vuepress/plugin-back-to-top", "@vuepress/plugin-medium-zoom"],
};
