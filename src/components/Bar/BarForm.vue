<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <PageHeader>
            {{ $t('bars.bar') }}
        </PageHeader>
        <h3 class="form-section-title">{{ $t('information') }}</h3>
        <div class="block-container block-container--padded">
            <div class="form-group">
                <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
                <input id="name" v-model="bar.name" class="form-input" type="text" required @input="skipSlugGenerationFromName == false ? updateSlug($event) : true" @blur="skipSlugGenerationFromName = true">
            </div>
            <div class="form-group">
                <label class="form-label" for="subtitle">{{ $t('subtitle') }}:</label>
                <input id="subtitle" v-model="bar.subtitle" class="form-input" type="text">
            </div>
            <div class="form-group">
                <label class="form-label" for="bar-units">{{ $t('default-units') }}:</label>
                <select id="bar-units" v-model="bar.settings.default_units" class="form-select" required>
                    <option :value="undefined">{{ $t('no-default-units') }}</option>
                    <option v-for="unit in availableUnits" :key="unit.value" :value="unit.value">{{ unit.text }}</option>
                </select>
                <p class="form-input-hint">{{ $t('bar.default-units-hint') }}</p>
            </div>
            <div class="form-group">
                <label class="form-label" for="default-currency">{{ $t('default-currency') }}:</label>
                <input id="default-currency" v-model="bar.settings.default_currency" class="form-input" type="text">
                <p class="form-input-hint">{{ $t('bar.default-currency-hint') }}</p>
            </div>
            <div class="form-group">
                <label class="form-label" for="slug">{{ $t('bar.url') }}:</label>
                <input id="slug" v-model="bar.slug" class="form-input" type="text" @blur="updateSlug">
                <p v-show="urlWithSlug" class="form-input-hint">
                    {{ $t('bar.url-menu-hint') }} {{ $t('bar.url-help', {url: urlWithSlug}) }}
                </p>
            </div>
            <div class="form-group">
                <label class="form-label" for="description">{{ $t('description') }}:</label>
                <textarea id="description" v-model="bar.description" rows="5" class="form-input"></textarea>
            </div>
            <div class="form-group">
                <label class="form-checkbox" for="toggle-invite">
                    <input id="toggle-invite" v-model="enableInvites" type="checkbox" :value="true">
                    <span>{{ $t('bars.enable-invites') }}</span>
                </label>
                <template v-if="!bar.id">
                    <label v-for="option in importOptions" :key="option.value" class="form-checkbox">
                        <input v-model="bar.options" type="checkbox" :value="option.value">
                        <span>{{ $t(option.name) }}</span>
                    </label>
                </template>
            </div>
        </div>
        <h3 class="form-section-title">{{ $t('bars.logo') }}</h3>
        <ImageUpload ref="imagesUpload" :images="bar.images" :max-images="1" />
        <div class="form-actions">
            <RouterLink class="button button--outline" :to="{ name: 'bars' }">{{ $t('cancel') }}</RouterLink>
            <button type="submit" class="button button--dark">{{ $t('save') }}</button>
        </div>
    </form>
</template>
<script>
import { useTitle } from '@/composables/title'
import AppState from '../../AppState'
import OverlayLoader from './../OverlayLoader.vue'
import PageHeader from './../PageHeader.vue'
import slug from 'slug'
import BarAssistantClient from '@/api/BarAssistantClient'
import ImageUpload from '../ImageUpload.vue'
import { barBus } from '@/composables/eventBus'

export default {
    components: {
        OverlayLoader,
        PageHeader,
        ImageUpload,
    },
    data() {
        return {
            isLoading: false,
            skipSlugGenerationFromName: false,
            bar: {
                images: [],
                settings: {
                    default_units: 'ml',
                    default_currency: null,
                },
                options: [
                    'cocktails',
                    'ingredients',
                ]
            },
            enableInvites: true,
            availableUnits: [
                { value: 'ml', text: this.$t('unit.ml-full') },
                { value: 'oz', text: this.$t('unit.oz-full') },
                { value: 'cl', text: this.$t('unit.cl-full') },
            ],
            importOptions: [
                { name: 'bars.import-base-cocktails', value: 'cocktails' },
                { name: 'bars.import-base-ingredients', value: 'ingredients' },
            ]
        }
    },
    computed: {
        urlWithSlug() {
            if (!this.bar.slug) {
                return null
            }

            return `${window.location.origin}/bars/${slug(this.bar.slug)}`
        },
    },
    watch: {
        'bar.options': function (newVal) {
            if (newVal && newVal.includes('cocktails') && !newVal.includes('ingredients')) {
                newVal.push('ingredients')
            }
        }
    },
    created() {
        useTitle(this.$t('bars.bar'))

        const barId = this.$route.query.id || null

        if (barId) {
            this.isLoading = true
            BarAssistantClient.getBar(barId).then(resp => {
                this.isLoading = false
                this.bar = resp.data
                this.enableInvites = resp.data.invite_code != null
            }).catch(e => {
                this.isLoading = false
                this.$toast.error(e.message)
            })
        }
    },
    methods: {
        updateSlug(e) {
            if (this.bar.id) {
                return
            }

            this.bar.slug = slug(e.target.value)
        },
        async submit() {
            let postSlug = null
            if (this.bar.slug) {
                postSlug = slug(this.bar.slug)
            }

            const postData = {
                name: this.bar.name,
                subtitle: this.bar.subtitle,
                description: this.bar.description,
                enable_invites: this.enableInvites,
                slug: postSlug,
                default_units: this.bar.settings.default_units,
                default_currency: this.bar.settings.default_currency,
            };

            const imageResources = await this.$refs.imagesUpload.save().catch(() => {
                this.$toast.error(`${this.$t('imageupload.error')} ${this.$t('imageupload.error-ingredient')}`)
            }) || []

            if (imageResources.length > 0) {
                postData.images = imageResources.map(img => img.id)
            }

            const appState = new AppState()

            this.isLoading = true
            if (this.bar.id) {
                BarAssistantClient.updateBar(this.bar.id, postData).then(resp => {
                    appState.setBar(resp.data)
                    this.isLoading = false
                    this.$toast.default(this.$t('bars.add-success', { name: this.bar.name }))
                    barBus.emit('barUpdated', resp.data)
                    this.$router.push({ name: 'bars' })
                }).catch(e => {
                    this.isLoading = false
                    this.$toast.error(e.message)
                })
            } else {
                postData.options = this.bar.options

                BarAssistantClient.saveBar(postData).then(() => {
                    this.isLoading = false
                    this.$toast.default(this.$t('bars.add-success', { name: this.bar.name }))
                    this.$router.push({ name: 'bars' })
                }).catch(e => {
                    this.isLoading = false
                    this.$toast.error(e.message)
                })
            }
        }
    }
}
</script>
