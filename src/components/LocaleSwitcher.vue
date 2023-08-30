<template>
    <Dropdown>
        <template #default="{ toggleDropdown }">
            <a href="#" @click.prevent="toggleDropdown">Change language</a>
        </template>
        <template #content>
            <a v-for="locale in locales" :key="locale" href="#" class="dropdown-menu__item" @click.prevent="$i18n.locale = locale">
                {{ $t('locales.' + locale) }}
            </a>
        </template>
    </Dropdown>
</template>

<script>
import Dropdown from '@/components/SaltRimDropdown.vue'

export default {
    components: {
        Dropdown
    },
    data() {
        return {
            locales: this.$i18n.availableLocales
        }
    }
}
</script>
