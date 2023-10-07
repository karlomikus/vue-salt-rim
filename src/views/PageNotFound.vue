<template>
    <main>
        <div class="not-found">
            <div class="not-found__hero">
                <h1>404</h1>
                <img
                    src="/404.png"
                    alt=""
                >
            </div>
            <p>
                Page not found!
                <br>
                <RouterLink to="/">
                    Go back home
                </RouterLink>
            </p>
        </div>
    </main>
</template>

<style scoped>
.not-found {
  text-align: center;
  margin: 5rem 0;
}

.not-found h1 {
  font-size: 10rem;
  font-weight: var(--fw-bold);
  line-height: 100%;
  opacity: .5;
}

.not-found p {
  font-size: 1.5rem;
  margin-top: 1rem;
}

.not-found__hero {
  position: relative;
}

.not-found__hero img {
  position: absolute;
  max-width: 200px;
  width: 100%;
  left: 0;
  right: 0;
  margin: 0 auto;
  top: 70px;
}
</style>
