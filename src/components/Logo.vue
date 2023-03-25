<template>
    <RouterLink to="/" class="site-logo">
        <div class="site-logo__image">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M11 19v-5.111L3 5V3h18v2l-8 8.889V19h5v2H6v-2h5zM7.49 7h9.02l1.8-2H5.69l1.8 2z" />
            </svg>
        </div>
        <h1 class="site-logo__title">
            {{ name }}
            <span v-if="description">{{ description }}</span>
        </h1>
    </RouterLink>
</template>

<script>
export default {
    computed: {
        name() {
            return window.srConfig.BAR_NAME || 'Salt Rim';
        },
        description() {
            return window.srConfig.BAR_DESCRIPTION || 'Your personal bar assistant';
        }
    }
}
</script>
