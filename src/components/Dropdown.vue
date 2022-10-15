<template>
    <div class="dropdown-wrapper">
        <slot :toggle-dropdown="toggleDropdown" />
        <div ref="content" class="dropdown-menu" v-show="isShown">
            <slot name="content" />
        </div>
    </div>
</template>
<script>
import { createPopper } from '@popperjs/core';

export default {
    data() {
        return {
            isShown: false,
            popper: null,
        }
    },
    mounted() {
        const btn = this.$el.querySelectorAll('button')[0];

        this.popper = createPopper(btn, this.$refs.content, {
            placement: 'bottom-end',
            modifiers: [{
                name: 'preventOverflow',
                options: {
                    boundary: 'clippingParents'
                }
            }, {
                name: 'offset',
                options: {
                    offset: [0, 5]
                }
            }]
        });
    },
    methods: {
        toggleDropdown() {
            this.isShown = !this.isShown

            this.popper.update();
        }
    }
}
</script>
