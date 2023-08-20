<template>
    <div>
        <button type="button" v-for="bar in bars" @click="selectBar(bar)">{{ bar.name }}</button>
        <button type="button" @click.prevent="createBar">Create bar</button>
    </div>
</template>
<script>
import AppState from './../../AppState.js';
import ApiRequests from './../../ApiRequests.js';

export default {
    data() {
        return {
            currentBar: null,
            bars: [],
        }
    },
    mounted() {
        const appState = new AppState();
        if (appState.bar.id) {
            this.currentBar = appState.bar
        }
        this.refreshBars();
    },
    methods: {
        refreshBars() {
            ApiRequests.fetchBars().then(data => {
                this.bars = data
            })
        },
        createBar() {
            ApiRequests.saveBar({
                name: "Test bar"
            }).then(() => {
                this.refreshBars()
            })
        },
        selectBar(bar) {
            const appState = new AppState();
            appState.setBar(bar)
            window.location.reload()
        }
    }
}
</script>
