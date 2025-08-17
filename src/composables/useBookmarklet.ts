import { ref } from "vue";

export interface BookmarkletConfig {
    serverUrl: string;
    authToken: string;
    barId: string;
}

export function useBookmarklet() {
    const isGenerating = ref(false);

    const generateBookmarkletCode = (config: BookmarkletConfig): string => {
        const bookmarkletScript = `
      (function() {
        try {
          const SERVER_URL = '${config.serverUrl}';
          const html_content = document.documentElement.outerHTML;
          const source = window.location.href;

          const payload = {
            source,
            html_content,
          };

          const xhr = new XMLHttpRequest();
          xhr.open('POST', SERVER_URL, true);
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('Authorization', 'Bearer ${config.authToken}');
          xhr.setRequestHeader('Bar-Assistant-Bar-Id', '${config.barId}');

          xhr.onload = function() {
            try {
              const response = JSON.parse(xhr.response);
              navigator.clipboard.writeText(JSON.stringify(response.data.schema)).then(() => {
                alert('Recipe copied to your clipboard. Use JSON import in Bar Assistant to add it.');
              })
            } catch (e) {
                alert('Failed to parse response from server. Please try again later.');
            }
          };

          xhr.onerror = function() {
            alert('An error occurred while sending the request. Please check your network connection and try again.');
          };

          xhr.send(JSON.stringify(payload));

        } catch (error) {
            alert('An unexpected bookmarklet error occurred. Please try again later.');
        }
      })();
    `.trim();

        // Return the bookmarklet URL
        return `javascript:${encodeURIComponent(bookmarkletScript)}`;
    };

    return {
        isGenerating,
        generateBookmarkletCode,
    };
}
