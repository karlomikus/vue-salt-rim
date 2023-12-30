<template>
    <a :href="source" v-if="isLink" target="_blank">{{ $t('source') }}</a>
    <span v-else>{{ $t('source') }}: {{ source }}</span>
</template>

<script>
export default {
    props: {
        source: {
            type: String,
            default: null,
        }
    },
    computed: {
        isLink() {
            let url;

            try {
                url = new URL(this.source);
            } catch (_) {
                return false;
            }

            return url.protocol === "http:" || url.protocol === "https:";
        }
    }
}
</script>
