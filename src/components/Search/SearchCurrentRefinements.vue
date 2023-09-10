<template>
    <div>
        <div v-for="refinement in refinements" :key="refinement.id">
            {{ refinement }}
        </div>
    </div>
</template>
<script>
export default {
    props: {
        refinements: {
            type: Array,
            default() {
                return []
            }
        },
        active: {
            type: Array,
            default() {
                return []
            }
        }
    }
}
</script>
