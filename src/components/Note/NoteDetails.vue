<template>
    <div class="note">
        <h5 class="note-title">
            <DateFormatter :date="note.created_at" format="long" /> &middot; <a href="#" @click.prevent="deleteNote">{{ $t('remove') }}</a>
        </h5>
        <div class="note-content">{{ note.note }}</div>
    </div>
</template>

<script>
import BarAssistantClient from '@/api/BarAssistantClient'
import DateFormatter from '../DateFormatter.vue'

export default {
    components: {
        DateFormatter,
    },
    props: {
        note: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    emits: ['noteDeleted'],
    methods: {
        deleteNote() {
            this.$confirm(this.$t('note.confirm-delete'), {
                onResolved: (dialog) => {
                    dialog.close()
                    BarAssistantClient.deleteNote(this.note.id).then(() => {
                        this.$toast.default(this.$t('note.delete-success'))
                        this.$emit('noteDeleted')
                    }).catch(e => {
                        this.$toast.error(e.message)
                    })
                }
            })
        }
    }
}
</script>

<style scoped>
.note {
    margin-bottom: 1rem;
    background-color: rgba(255, 255, 255, .3);
    padding: 1rem;
    border-radius: var(--radius-1);
}

.dark-theme .note {
    background-color: rgba(0, 0, 0, .2);
}

.note:last-child {
    margin: 0;
}

.note-title {
    font-size: 0.75rem;
    opacity: 0.65;
}

.note-content {
    font-size: 1rem;
}
</style>
