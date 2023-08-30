module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-strongly-recommended',
  ],
  rules: {
    "vue/html-indent": ["warn", 4],
    "vue/max-attributes-per-line": ['off'],
    "vue/multiline-html-element-content-newline": ['off'],
    "vue/html-self-closing": ['off'],
    "vue/singleline-html-element-content-newline": ['off'],
  }
}
