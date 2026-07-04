<template>
    <div class="timestamps">
        {{ $t("created") }}: <DateFormatter :date="resource.created_at" format="long" /> &middot; {{ resource.created_user }}
        <template v-if="resource.updated_user">
            <br />
            <span> {{ $t("updated") }}: <DateFormatter v-if="resource.updated_at" :date="resource.updated_at" format="long" /> &middot; {{ resource.updated_user }} </span>
        </template>
    </div>
</template>

<script setup lang="ts">
import DateFormatter from "./DateFormatter.vue";

interface Resource {
    created_user: string;
    updated_user: string | null;
    created_at: string;
    updated_at: string | null;
}

const props = defineProps<{
    resource: Resource;
}>();
</script>
<style scoped>
.timestamps {
    font-size: 0.75rem;
    text-align: left;
    opacity: 0.7;
    margin-bottom: 0.5rem;
}
</style>
