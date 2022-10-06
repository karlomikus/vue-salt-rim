<template>
  <header class="site-header">
    <div class="header-bar">
      <nav class="header-bar__menu">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/cocktails">Cocktails</RouterLink>
        <RouterLink to="/shelf">My shelf</RouterLink>
      </nav>
      <div class="header-bar__user">
        <RouterLink to="/profile">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 17c3.662 0 6.865 1.575 8.607 3.925l-1.842.871C17.347 20.116 14.847 19 12 19c-2.847 0-5.347 1.116-6.765 2.796l-1.841-.872C5.136 18.574 8.338 17 12 17zm0-15a5 5 0 0 1 5 5v3a5 5 0 0 1-4.783 4.995L12 15a5 5 0 0 1-5-5V7a5 5 0 0 1 4.783-4.995L12 2zm0 2a3 3 0 0 0-2.995 2.824L9 7v3a3 3 0 0 0 5.995.176L15 10V7a3 3 0 0 0-3-3z"/></svg>
        </RouterLink>
      </div>
    </div>
    <h1 class="site-title">SaltRim</h1>
  </header>
</template>

<style scoped>
  .site-header {
    margin-bottom: 30px;
    background-color: rgb(115, 125, 183);
    padding: 10px 0 40px 0;
  }
  .header-bar {
    display: flex;
  }
  .header-bar__menu {
    display: flex;
    margin-left: -10px;
  }
  .header-bar__user {
    margin-left: auto;
  }
  .header-bar__menu a {
    display: block;
    padding: 5px 10px;
    font-size: 1.2rem;
    text-decoration: none;
    color: rgba(255, 255, 255, .8);
  }
  .site-title {
    font-family: var(--font-accent);
    font-weight: 700;
    color: #fff;
  }
</style>
