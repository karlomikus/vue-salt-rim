<template>
    <div class="resource-search__content__pagination">
        <div class="resource-search__content__pagination__page_info">
            {{ $t('pagination.results', {'on_page_results': meta.to || 0, total_results: meta.total}) }}
        </div>
        <div class="resource-search__content__pagination__links">
            <button type="button" class="button button--outline button--icon" :disabled="currentPage == 1" @click="changePage('prev')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"></path></svg>
            </button>
            {{ $t('pagination.page') }} {{ meta.current_page }}/{{ meta.last_page }}
            <button type="button" class="button button--outline button--icon" :disabled="currentPage == meta.last_page" @click="changePage('next')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M13.1714 12.0007L8.22168 7.05093L9.63589 5.63672L15.9999 12.0007L9.63589 18.3646L8.22168 16.9504L13.1714 12.0007Z"></path></svg>
            </button>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        meta: {
            type: Object,
            default() {
                return {
                    current_page: 1,
                    last_page: 1,
                    to: 0,
                    total: 0
                }
            }
        },
    },
    emits: ['pageChanged'],
    data() {
        return {
            currentPage: this.meta.current_page
        }
    },
    watch: {
        meta(newVal) {
            this.currentPage = newVal.current_page
        }
    },
    methods: {
        changePage(dir) {
            if (dir == 'prev') {
                if (this.currentPage > 1) {
                    this.currentPage--
                }
            }

            if (dir == 'next') {
                if (this.currentPage < this.meta.last_page) {
                    this.currentPage++
                }
            }

            this.$emit('pageChanged', this.currentPage)
        },
    }
}
</script>
