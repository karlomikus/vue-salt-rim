<template>
    {{ formattedDate }}
</template>
<script>
import dayjs from 'dayjs'

export default {
    props: {
        date: {
            type: String,
            default() {
                return dayjs().toString()
            }
        },
        format: {
            type: String,
            default: 'short'
        }
    },
    computed: {
        formattedDate() {
            const date = dayjs(this.date).toDate()

            return this.$d(date, this.format)
        }
    }
}
</script>
