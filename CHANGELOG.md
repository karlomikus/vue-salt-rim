# v1.8.0
## New
- Added internationalization
    - Currently supports English (US) and Croatian
    - Checkout `src/locales/` folder if you are intereseted in contributing a new language
- You can now share public link of a cocktail recipe
- You can now change bar name and description, this will update the application logo
- Added print button to print pages
- Added Meilisearch version to footer

## Fixes
- Fixed container overflow on shelf page on smaller screens
- Fixed inconsistencies with unit conversion when adding ingredients

# v1.7.1
## Fixes
- Fix nginx post body size #62

# v1.7.0
## New
- You can now upload multiple cocktail images
    - You can sort images, first one in the list is used for default thumbnail
- Added confirm dialogs
- Selected fluid units are now also used as default when adding ingredients #60

## Changes
- Updated UI styling
- Version now automatically updated from github ref

# v1.6.0

Official docker image moved to `barassistant/salt-rim`.

# v1.5.1
## Fixes
- Fix pagination when there is a lot of data

# v1.5.0
## New
- Added form for cocktail scraping
- Added ingredient variety updating
- Added 404 page

## Changes
- Updated PWA icons
- Docker image now uses nginx for serving the application

## Fixes
- Fixed rating not changing when selecting a different cocktail

# v1.4.1
## Fixes
- Auto-update PWA cache on version change
- Fix sort not updating when cocktail ingredient sort attribute is duplicated or missing

# v1.4.0
## New
- You can now sort cocktail ingredients by dragging and dropping
    - Putting ingredient on first place will mark it as a main ingredient of the cocktail

## Changes
- Updated cocktails list page
    - Now includes more filters: main ingredient, strength, method
- Use theme for instantsearch components
- Updated cocktail page
    - Added more details: calculated ABV, method, average rating
- Move links from shelf to navigation

# v1.3.0
## New
- Updated ingredients page
    - Now includes filters and searching similar to cocktails
    - You can now add ingredients to shopping list directly from the grid
    - Added filters: Category, Origin and Strength
- Added tag management to settings
- Added shopping list page
    - View all items on your shopping list
    - You can now print your shopping list

## Changes
- Updated shelf page
    - Now includes application stats
    - Removed shelf cocktails, favorites and shopping list grid view
    - Added 3 columns with: Latest cocktails, Latests shopping list items and Favorite cocktails
- Refactored behavior of cocktail shelf and favorites filters
- Small styling changes
    - Updated default fonts
    - Expanded default container width
- Updated instantsearch routing handling

## Work In Progress
- Started work on PWA features
    - Still needs a lot of testing

# v1.2.0
## New
- Added cocktail recipe printing
- Added users management
- Check for admin permissions on some actions

## Fixes
- Show user rating instead of average rating in cocktail details
- Correctly handle dropdown click away when multiple dropdowns are present
- Add missing loader on ingredient form

# v1.1.0
## New
- Added cocktail ratings

## Changes
- Updated cocktail filters
    - Show total number of items in refinement
    - Added rating refinement
    - Added shelf cocktails refinement

# v1.0.0
- Fix markdown display issues
- Update footer styling
- Add some help notes to ingredient modal
- Update `sort` attribute on cocktail ingredient on update and save
- Fix canceling ingredient modal not properly resetting ingredient
- Fix ingredient image upload sticking on route change
- Make tags and glass tags clickable

# v0.6.0
- Update site search component
- Add settings page
    - Move profile settings to settings page
    - Add ingredient categories editing
    - Add glass types editing
- Use thumbnail for cocktail list images
- Update cocktail list filters
- Remember selected measurement unit
- Enable markdown for ingredient description
- Fix empty tags handling

# v0.5.0
- Fix colorpicker issues with null values
- Add profile page
- Small changes to styling and design
- Add register page
- Make footer sticky
- Updates to cocktails searching
    - Enabled filtering by glass type
    - Enabled filtering by favorites
    - Show current search refinements

# v0.4.4
- Fix issues related to `script setup`

# v0.4.3
- Fix issues #14, #15
- Update delete response handling
- Add icons to site autocomplete

# v0.4.2
- Improve error handling
- Add dev docker image

# v0.4.1
- Fix missing login request body due to `script setup`

# v0.4.0
- Add more server info on login
- Sync endpoints with BA api

# v0.3.1
- Removed arm-v7 from build

# v0.3.0
## New
- Support adding cocktail ingredient substitutes
- Show ingredient varieties
- Add "cl" as unit of measurement
- New image uploading component
- Add glass types updating

## Misc
- Meilisearch host server is now fetched from user endpoint
- Update cocktail card styling
- Truncate a lot of tags on cocktail card
- Missing cocktail and ingredient images are now local to client
- Add colorpicker to ingredient form

# v0.2.1
- Some fixes for ingredient modal
- Fix image upload container on smaller devices
- Update input styling on smaller devices

# v0.2.0
- Updated cocktail ingredient form
- Layout fixes for smaller devices
- Auth class methods now static
- Add logout button
- Add automated docker build github action
- Optimize docker build with multi stage steps
- Add vue select
- Add cocktail image delete
- Add button focus styling
- Add ingredient page description

# v0.1.0
- Initial release
