<template>
    <div v-if="resource.created_user" class="timestamps">
        {{ $t('created') }}: <DateFormatter :date="resource.created_at" format="long" /> &middot; {{ resource.created_user.name }}
        <br>
        <span v-if="resource.updated_user">
            {{ $t('updated') }}: <DateFormatter :date="resource.updated_at" format="long" /> &middot; {{ resource.updated_user.name }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import DateFormatter from './DateFormatter.vue';

interface Resource {
    created_user?: {
        name?: string;
    };
    updated_user?: {
        name?: string;
    };
    created_at?: string;
    updated_at?: string;
}

const props = withDefaults(defineProps<{
    resource?: Resource;
}>(), {
    resource: () => ({
        created_user: {},
        updated_user: {},
    }),
});

const { t } = useI18n();
</script>
<style scoped>
.timestamps {
    font-size: 0.75rem;
    text-align: left;
    opacity: .7;
    margin-bottom: 0.5rem;
}
</style>
