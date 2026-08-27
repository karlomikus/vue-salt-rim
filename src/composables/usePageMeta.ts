import { onUnmounted, toValue, watch, type MaybeRefOrGetter } from "vue";

type MetaValue = string | null | undefined;

interface UsePageMetaOptions {
    title?: MaybeRefOrGetter<MetaValue>;
    description?: MaybeRefOrGetter<MetaValue>;
    image?: MaybeRefOrGetter<MetaValue>;
    siteName?: MaybeRefOrGetter<MetaValue>;
}

interface OwnedTag {
    attr: "property" | "name";
    key: string;
}

const OWNED_TAGS: OwnedTag[] = [
    { attr: "property", key: "og:title" },
    { attr: "property", key: "og:description" },
    { attr: "property", key: "og:image" },
    { attr: "property", key: "og:url" },
    { attr: "property", key: "og:type" },
    { attr: "property", key: "og:site_name" },
    { attr: "name", key: "twitter:card" },
    { attr: "name", key: "twitter:title" },
    { attr: "name", key: "twitter:description" },
    { attr: "name", key: "twitter:image" },
];

const TWITTER_CARD = "summary_large_image";

function findMeta(attr: "property" | "name", key: string): HTMLMetaElement | null {
    return document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
}

function upsertMeta(attr: "property" | "name", key: string, content: string): void {
    let el = findMeta(attr, key);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

function readMeta(attr: "property" | "name", key: string): string {
    return findMeta(attr, key)?.getAttribute("content") ?? "";
}

function toAbsoluteUrl(url: string): string {
    if (/^https?:\/\//i.test(url)) {
        return url;
    }

    return `${window.srConfig.API_URL}${url}`;
}

function resolveSource(source: MaybeRefOrGetter<MetaValue> | undefined): string {
    return toValue(source)?.trim() || "";
}

export function usePageMeta(options: UsePageMetaOptions = {}) {
    const defaults: Record<string, string> = {};
    for (const tag of OWNED_TAGS) {
        defaults[tag.key] = readMeta(tag.attr, tag.key);
    }
    const defaultTitle = document.title;

    const apply = () => {
        const title = resolveSource(options.title);
        const description = resolveSource(options.description);
        const image = resolveSource(options.image);
        const siteName = resolveSource(options.siteName);

        const effectiveTitle = title || defaults["og:title"] || defaultTitle;
        const effectiveDescription = description || defaults["og:description"];
        const effectiveImage = image ? toAbsoluteUrl(image) : defaults["og:image"];
        const effectiveSiteName = siteName || defaults["og:site_name"];

        document.title = effectiveTitle;
        upsertMeta("property", "og:title", effectiveTitle);
        upsertMeta("name", "twitter:title", effectiveTitle);
        upsertMeta("property", "og:description", effectiveDescription);
        upsertMeta("name", "twitter:description", effectiveDescription);
        upsertMeta("property", "og:image", effectiveImage);
        upsertMeta("name", "twitter:image", effectiveImage);
        upsertMeta("property", "og:site_name", effectiveSiteName);
        upsertMeta("property", "og:url", window.location.href);
        upsertMeta("property", "og:type", defaults["og:type"] || "website");
        upsertMeta("name", "twitter:card", TWITTER_CARD);
    };

    watch(
        [
            () => toValue(options.title),
            () => toValue(options.description),
            () => toValue(options.image),
            () => toValue(options.siteName),
        ],
        apply,
        { immediate: true },
    );

    onUnmounted(() => {
        document.title = defaultTitle;
        for (const tag of OWNED_TAGS) {
            upsertMeta(tag.attr, tag.key, defaults[tag.key]);
        }
    });
}