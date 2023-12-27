<template>
    <div v-if="resource.created_user" class="timestamps">
        {{ $t('created') }}: <DateFormatter :date="resource.created_at" format="long" /> &middot; {{ resource.created_user.name }}
        <br>
        <span v-if="resource.updated_at">
            {{ $t('updated') }}: <DateFormatter :date="resource.updated_at" format="long" /> &middot; {{ resource.updated_user.name }}
        </span>
    </div>
</template>

<script>
import DateFormatter from './DateFormatter.vue'

export default {
    components: {
        DateFormatter
    },
    props: {
        resource: {
            type: Object,
            default() {
                return {
                    created_user: {},
                    updated_user: {},
                }
            }
        }
    },
}
</script>
<style scoped>
.timestamps {
    font-size: 0.75rem;
    text-align: left;
    opacity: .7;
    margin-bottom: 0.5rem;
}
</style>
