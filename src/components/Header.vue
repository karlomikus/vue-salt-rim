<script setup>
import SiteAutocomplete from '../components/SiteAutocomplete.vue'
</script>

<template>
  <header class="site-header">
    <div class="header-bar">
      <div class="header-bar__menu">
        <div class="site-logo">
          <div class="site-logo__image">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M11 19v-5.111L3 5V3h18v2l-8 8.889V19h5v2H6v-2h5zM7.49 7h9.02l1.8-2H5.69l1.8 2z"/></svg>
          </div>
          <h1 class="site-logo__title">Salt Rim</h1>
        </div>
      </div>
      <nav class="header-bar__navigation">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/cocktails">Cocktails</RouterLink>
        <RouterLink to="/my-ingredients">My ingredients</RouterLink>
        <RouterLink to="/shelf">User</RouterLink>
        <!-- <RouterLink to="/profile">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 17c3.662 0 6.865 1.575 8.607 3.925l-1.842.871C17.347 20.116 14.847 19 12 19c-2.847 0-5.347 1.116-6.765 2.796l-1.841-.872C5.136 18.574 8.338 17 12 17zm0-15a5 5 0 0 1 5 5v3a5 5 0 0 1-4.783 4.995L12 15a5 5 0 0 1-5-5V7a5 5 0 0 1 4.783-4.995L12 2zm0 2a3 3 0 0 0-2.995 2.824L9 7v3a3 3 0 0 0 5.995.176L15 10V7a3 3 0 0 0-3-3z"/></svg>
        </RouterLink> -->
      </nav>
    </div>
    <site-autocomplete />
  </header>
</template>

<style scoped>
  .site-header {
    margin-bottom: 30px;
    background-color: var(--site-header-bg);
    padding: 20px 0 20px 0;
  }
  .header-bar, .site-search {
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
    margin-right: 10px;
  }
  .site-logo__image {
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 3px;
  }
  .site-logo__image svg {
    fill: var(--site-header-bg);
  }
  .site-logo__title {
    font-weight: 700;
    margin-left: 10px;
  }
</style>
