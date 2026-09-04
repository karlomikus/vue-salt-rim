<template>
    <div class="resource-facts">
        <dl>
            <dt>{{ t("your-rating") }}</dt>
            <dd>
                <div>
                    <Rating :id="cocktail.id" :rating="(cocktail.rating && cocktail.rating.user) ?? 0" type="cocktail" @rated="onRated"></Rating>
                </div>
            </dd>
            <template v-if="cocktail.rating">
                <dt>{{ t("avg-rating") }}</dt>
                <dd>
                    <RouterLink :to="{ name: 'cocktails', query: { 'filter[user_rating_min]': cocktail.rating.average } }">{{ cocktail.rating.average }} ★</RouterLink>
                </dd>
            </template>
            <template v-if="cocktail.public_id">
                <dt>{{ t("public-link") }}</dt>
                <dd>
                    <RouterLink :to="{ name: 'e.cocktail', params: { ulid: cocktail.public_id, slug: cocktail.slug } }" class="external-link" target="_blank"
                        >{{ t("click-here") }} <IconExternal
                    /></RouterLink>
                </dd>
            </template>
            <template v-if="cocktail.source">
                <dt>{{ t("source") }}</dt>
                <dd>
                    <a class="external-link" v-if="isValidUrl(cocktail.source)" :href="cocktail.source" target="_blank">{{ t("website") }} <IconExternal /></a>
                    <span v-else>{{ cocktail.source }}</span>
                </dd>
            </template>
            <template v-if="cocktail.year">
                <dt>{{ t("year") }}</dt>
                <dd><RouterLink :to="{ name: 'cocktails', query: { 'filter[year_min]': cocktail.year, 'filter[year_max]': cocktail.year } }">{{ cocktail.year }}</RouterLink></dd>
            </template>
            <template v-if="cocktail.author">
                <dt>{{ t("author.title") }}</dt>
                <dd><RouterLink :to="{ name: 'cocktails', query: { 'filter[author]': cocktail.author } }">{{ cocktail.author }}</RouterLink></dd>
            </template>
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
        </dl>
    </div>
</template>

<script setup lang="ts">
import type { components } from "@/api/api";
import Rating from "@/components/RatingActions.vue";
import { useI18n } from "vue-i18n";
import IconExternal from "@/components/Icons/IconExternal.vue";

type Cocktail = components["schemas"]["Cocktail"];

const { t } = useI18n();
const props = defineProps<{
    cocktail: Cocktail;
}>();

const emit = defineEmits<{
    (e: "rating-changed", rating: number): void;
}>();

function onRated(rating: number) {
    emit("rating-changed", rating);
}

function isValidUrl(input: string) {
    try {
        new URL(input.startsWith("http") ? input : `https://${input}`);
        return true;
    } catch (err) {
        return false;
    }
}
</script>
