<template>
    <div class="dropdown-wrapper">
        <slot :toggle-dropdown="toggleDropdown" />
        <div ref="content" class="popper">
            <div v-show="isShown" class="dropdown-menu">
                <slot name="content" />
            </div>
        </div>
    </div>
</template>
<script>
import { createPopper } from '@popperjs/core'

export default {
    data() {
        return {
            isShown: false,
            popper: null,
        }
    },
    mounted() {
        const btn = this.$el.querySelector('button')

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
        })

        document.addEventListener('click', e => {
            var dw = btn || null
            if (dw && !dw.contains(e.target)) {
                this.isShown = false
            }
        }, false)
    },
    methods: {
        toggleDropdown() {
            this.isShown = !this.isShown

            this.popper.update()
        }
    }
}
</script>
