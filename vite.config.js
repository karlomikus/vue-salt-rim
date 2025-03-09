import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

const manifest = {
    name: 'Bar Assistant',
    short_name: 'Bar Assistant',
    description: 'Bar assistant is a self hosted application for managing your home bar.',
    theme_color: '#584b75',
    orientation: "portrait",
    icons: [
        {
            "src": 'icons/pwa256.png',
            "sizes": '256x256',
            "type": 'image/png',
            "purpose": "any",
        },
        {
            "src": 'icons/pwa512.png',
            "sizes": '512x512',
            "type": 'image/png',
            "purpose": "any",
        },
        {
            "purpose": "maskable",
            "sizes": "858x858",
            "src": "icons/maskable_icon.png",
            "type": "image/png"
        },
        {
            "purpose": "maskable",
            "sizes": "48x48",
            "src": "icons/maskable_icon_x48.png",
            "type": "image/png"
        },
        {
            "purpose": "maskable",
            "sizes": "128x128",
            "src": "icons/maskable_icon_x128.png",
            "type": "image/png"
        },
        {
            "purpose": "maskable",
            "sizes": "512x512",
            "src": "icons/maskable_icon_x512.png",
            "type": "image/png"
        }
    ]
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue({
        template: {
            compilerOptions: {
                isCustomElement: (tag) => ['swiper-container', 'swiper-slide'].includes(tag),
            }
        }
    }), VitePWA({
        workbox: {
            navigateFallbackDenylist: [/^\/bar/]
        },
        manifest: manifest,
        registerType: 'autoUpdate',
    })],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
