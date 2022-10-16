<script setup>
import SiteAutocomplete from '../components/SiteAutocomplete.vue'
</script>

<template>
  <header class="site-header">
    <div class="header-bar">
      <!-- <button class="toggle-nav" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm6 7h12v2H9v-2zm-6 7h18v2H3v-2z"/></svg>
      </button> -->
      <div class="site-logo">
        <div class="site-logo__image">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M11 19v-5.111L3 5V3h18v2l-8 8.889V19h5v2H6v-2h5zM7.49 7h9.02l1.8-2H5.69l1.8 2z" />
          </svg>
        </div>
        <h1 class="site-logo__title">
          Salt Rim
          <span>Your personal bar assistant</span>
        </h1>
      </div>
      <nav class="header-bar__navigation">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/cocktails">Cocktails</RouterLink>
        <RouterLink to="/ingredients">Ingredients</RouterLink>
        <RouterLink to="/profile">My shelf</RouterLink>
      </nav>
    </div>
    <site-autocomplete />
  </header>
</template>

<style scoped>
.site-header {
  margin-bottom: 30px;
  background-color: var(--color-site-header);
  padding: 20px;
}

.header-bar,
.site-search {
  display: flex;
  max-width: var(--site-width);
  margin: 0 auto;
}

.header-bar__menu {
  display: flex;
  align-items: center;
}

.header-bar__navigation {
  margin-left: auto;
  display: flex;
}

.header-bar__navigation a {
  display: block;
  padding: 5px 10px;
  font-size: 1rem;
  text-decoration: none;
  font-weight: 700;
  color: rgba(255, 255, 255, .8);
}

.header-bar__navigation a:hover,
.header-bar__navigation a:focus,
.header-bar__navigation a:active {
  color: #fff;
}

.site-logo {
  display: flex;
  font-family: var(--font-accent);
  color: #fff;
}

.site-logo__image {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 3px;
}

.site-logo__image svg {
  fill: var(--color-site-header);
  width: 32px;
  height: 32px;
}

.site-logo__title {
  font-weight: 700;
  margin-left: 10px;
  text-shadow: 3px 2px 0 rgba(0, 0, 0, .3);
  line-height: 0.9;
}

.site-logo__title span {
  display: block;
  font-size: 0.8rem;
  text-shadow: none;
  opacity: .7;
}

.toggle-nav {
  border: 0;
  background: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  position: absolute;
  top: 0;
  right: 0;
}

@media (max-width: 750px) {
  .site-logo {
    justify-content: center;
  }
  .header-bar {
    flex-direction: column;
  }
  .header-bar__navigation {
    /* display: none; */
    margin: 20px 0 0 0;
    justify-content: center;
  }
}
</style>
