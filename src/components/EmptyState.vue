<template>
    <div class="empty-state">
        <slot name="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M3.05469 13H5.07065C5.55588 16.3923 8.47329 19 11.9998 19C15.5262 19 18.4436 16.3923 18.9289 13H20.9448C20.4474 17.5 16.6323 21 11.9998 21C7.36721 21 3.55213 17.5 3.05469 13ZM3.05469 11C3.55213 6.50005 7.36721 3 11.9998 3C16.6323 3 20.4474 6.50005 20.9448 11H18.9289C18.4436 7.60771 15.5262 5 11.9998 5C8.47329 5 5.55588 7.60771 5.07065 11H3.05469Z"></path>
            </svg>
        </slot>
        <p>
            <slot></slot>
        </p>
    </div>
</template>
<style>
.empty-state {
    text-align: center;
    padding: 30px;
    background-color: #f4edf2;
    border-radius: var(--radius-2);
    border-bottom: 1px solid #fff;
    box-shadow:
        inset 0px 0.4px 0.5px hsl(var(--shadow-color) / 0.25),
        inset 0px 1.1px 1.2px -0.8px hsl(var(--shadow-color) / 0.25),
        inset 0px 2.6px 2.9px -1.7px hsl(var(--shadow-color) / 0.25),
        inset 0px 6.3px 7.1px -2.5px hsl(var(--shadow-color) / 0.25);
}

.dark-theme .empty-state {
    background-color: rgba(0, 0, 0, .1);
    border-bottom: 1px solid rgba(255, 255, 255, .1);
    box-shadow:
        inset 0px 0.4px 0.5px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 1.1px 1.2px -0.8px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 2.6px 2.9px -1.7px hsl(var(--shadow-color-dark) / 0.25),
        inset 0px 6.3px 7.1px -2.5px hsl(var(--shadow-color-dark) / 0.25);
}

.empty-state svg {
    fill: var(--clr-gray-500);
}
</style>
