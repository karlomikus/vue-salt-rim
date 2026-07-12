<template>
    <div class="cocktail-facts">
        <dl>
            <template v-if="cocktail.source">
                <dt>{{ t("source") }}</dt>
                <dd>
                    <a v-if="isValidUrl(cocktail.source)" :href="cocktail.source" target="_blank">{{ t("website") }}</a>
                    <span v-else>{{ cocktail.source }}</span>
                </dd>
            </template>
            <dt>{{ t("year") }}</dt>
            <dd>{{ cocktail.year }}</dd>
            <dt>{{ t("author") }}</dt>
            <dd>{{ cocktail.author }}</dd>
            <template v-if="cocktail.abv && cocktail.abv > 0">
                <dt>{{ t("ABV") }}</dt>
                <dd>
                    <RouterLink :to="{ name: 'cocktails', query: { 'filter[abv_min]': cocktail.abv } }">{{ cocktail.abv }}%</RouterLink>
                </dd>
            </template>
            <template v-if="cocktail.tags && cocktail.tags.length > 0">
                <dt>{{ t("tag.tags") }}</dt>
                <dd>
                    <div>
                        <template v-for="(tag, index) in cocktail.tags" :key="tag.id">
                            <RouterLink :to="{ name: 'cocktails', query: { 'filter[tag_id]': tag.id } }">{{ tag.name }}</RouterLink>
                            <template v-if="index + 1 !== cocktail.tags.length">, </template>
                        </template>
                    </div>
                </dd>
            </template>
            <template v-if="cocktail.glass">
                <dt>{{ t("glass-type.title") }}</dt>
                <dd>
                    <RouterLink :to="{ name: 'cocktails', query: { 'filter[glass_id]': cocktail.glass.id } }">{{ cocktail.glass.name }}</RouterLink>
                </dd>
            </template>
            <template v-if="cocktail.method">
                <dt>{{ t("method.title") }}</dt>
                <dd>
                    <RouterLink :to="{ name: 'cocktails', query: { 'filter[cocktail_method_id]': cocktail.method.id } }">{{ t("method." + cocktail.method.name) }}</RouterLink>
                </dd>
            </template>
            <template v-if="cocktail.rating">
                <dt>{{ t("avg-rating") }}</dt>
                <dd>
                    <RouterLink :to="{ name: 'cocktails', query: { 'filter[user_rating_min]': cocktail.rating.average } }">{{ cocktail.rating.average }} ★</RouterLink>
                </dd>
            </template>
            <dt>{{ t("your-rating") }}</dt>
            <dd>
                <div>
                    <Rating :id="cocktail.id" :rating="(cocktail.rating && cocktail.rating.user) ?? 0" type="cocktail"></Rating>
                </div>
            </dd>
            <template v-if="cocktail.public_id">
                <dt>{{ t("public-link") }}</dt>
                <dd>
                    <RouterLink :to="{ name: 'e.cocktail', params: { ulid: cocktail.public_id, slug: cocktail.slug } }" target="_blank">{{ t("click-here") }}</RouterLink>
                </dd>
            </template>
        </dl>
    </div>
</template>

<script setup lang="ts">
import type { components } from "@/api/api";
import Rating from "@/components/RatingActions.vue";
import { useI18n } from "vue-i18n";

type Cocktail = components["schemas"]["Cocktail"];

const { t } = useI18n();
const props = defineProps<{
    cocktail: Cocktail;
}>();

function isValidUrl(input: string) {
    try {
        new URL(input.startsWith("http") ? input : `https://${input}`);
        return true;
    } catch (err) {
        return false;
    }
}
</script>

<style scoped>
.cocktail-facts {
    border: 1px solid var(--clr-gray-200);
    font-size: 0.85em;
    border-radius: var(--radius-2);
    margin-bottom: var(--gap-size-3);
    & dl {
        display: grid;
        grid-template-columns: 120px 1fr 120px 1fr;
        @media (max-width: 800px) {
            & {
                grid-template-columns: 120px 1fr;
            }
        }
        & dt, dd {
            padding: 0.25rem 0.5rem;
            display: flex;
            align-items: center;
            border-bottom: 1px solid var(--clr-gray-100);
        }
        & dt {
            font-weight: var(--fw-bold);
            color: var(--clr-gray-600);
            &:after {
                content: ":";
            }
        }
    }
}
</style>
