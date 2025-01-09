export class NotificationMinifier {
  /** @type {[RegExp | string, string][]} */
  static #minifyReplaceRules = [
    // Comments
    [/<!--[\s\S]*?-->/g, ''],
    // Whitespaces
    [/\s{2,}/g, ' '],
    [/>\s+</g, '><'],
    // Empty tags
    [/<(\w+)([^>]*)>\s*<\/\1>/g, ''],
    // Abbreviation
    [/đại học chính quy/i, 'ĐHCQ'],
    // Regular patterns
    [
      `<div class="bgtitle">Tin tức - thông báo</div><div style="padding:10px"><a class="title_topicdisplay">`,
      '_@1_',
    ],
    [
      `</a></div><div><div style="margin:5px"><div style="overflow:auto">`,
      '_@2_',
    ],
    [/<\/div><\/div><\/div>/g, '_@3_'],
    [/https:\/\/stneuedu-my.sharepoint.com\//g, '_@4_'],
    [/https:\/\/daihocchinhquy.neu.edu.vn\//g, '_@5_'],
    [/https:\/\/daotao.neu.edu.vn\//g, '_@6_'],
    [/https:\/\/forms.office.com\//g, '_@7_'],
    [/<a href="/g, '_@8_'],
    [/@neu.edu.vn/g, '_@9_'],
  ];

  /** @type {[RegExp | string, string][]} */
  static #unminifyReplaceRules = [
    [
      '_@1_',
      `<div class="bgtitle">Tin tức - thông báo</div><div style="padding:10px"><a class="title_topicdisplay">`,
    ],
    [
      '_@2_',
      `</a></div><div><div style="margin:5px"><div style="overflow:auto">`,
    ],
    [/_@3_/g, `</div></div></div>`],
    [/_@4_/g, `https://stneuedu-my.sharepoint.com/`],
    [/_@5_/g, `https://daihocchinhquy.neu.edu.vn/`],
    [/_@6_/g, `https://daotao.neu.edu.vn/`],
    [/_@7_/g, `https://forms.office.com/`],
    [/_@8_/g, `<a href="`],
    [/_@9_/g, `@neu.edu.vn`],
  ];

  /**
   * Minify notification
   * @param {string} html
   * @returns {string}
   */
  static minify(html) {
    this.#minifyReplaceRules.forEach(
      ([from, to]) => (html = html.replace(from, to))
    );

    html = html.trim();

    return html;
  }

  /**
   * Unminify notification
   * @param {string} content
   * @returns {string}
   */
  static unminify(content) {
    this.#unminifyReplaceRules.forEach(
      ([from, to]) => (content = content.replace(from, to))
    );

    content = content.trim();

    return content;
  }
}
