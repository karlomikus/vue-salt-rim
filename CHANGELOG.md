# v2.17.2
## Fixes
- Fix substitute ingredient showing null amounts as `1`

# v2.17.1
## Fixes
- Correctly show fraction amount for all units

# v2.17.0
## New
- Added ALLOW_REGISTRATION env variable
    - If set to `false` then registration components actions are disabled

## Changes
- Menu prices are now hidden if they are set to zero
- Removed logo link from menus
- Ingredient amounts are now converted to number before saving
- Ingredient units are not forced to ml before saving anymore

# v2.16.0
## New
- Added ingredient prices
- Added quantity calculator to collections
    - Calculate how many bottles you need
    - Calculate approx. price totals
    - Calculations are saved per-client
- Added JSON+LD share action
- Added Crowdin support

## Fixes
- Fixed HTML entity parsing #191
- Fixed cl to oz conversion

# v2.15.0
## New
- Updated cocktail tag input, you now get existing tag suggestions
- Added Polish language

## Changes
- Ingredient strength no longer required field
- Updated ingredient form layout
- Updated search modal styling

# v2.14.0
## New
- You can now prevent mobile screen from dimming/locking when viewing a recipe
- Added support for complex ingredients

## Changes
- Updated button styling
- Updated ingredient details page

## Fixes
- Fixed wrong filter count
- Fixed not being able to filter by cocktail id

# v2.13.0
## New
- Show total number of active filters on cocktails and ingredients page
- Added approximate volume, calories and alcohol units to cocktail details
- You can now save default bar units, user settings will still overwrite this
- Added support for glass type volume

# v2.12.0
## New
- You can now filter cocktails by ignored ingredients
- You can now filter cocktails by specific ingredients
- Common ingredient amounts are now recommended on amount inputs
- Added "Exports" page to settings
- Added public recipe link to menu if available

# v2.11.0
## New
- Add "Copy XML" share action
- Add duplicate cocktail action

# v2.10.0
## New
- Added API tokens page to settings

## Changes
- Updated loader positions on ingredient page

## Fixes
- Cocktail import information now uses user defined units
- Fixed base ingredient tag showing on all ingredients when importing

# v2.9.0
## New
- Added bar menu managing
- Added public bar menu page

# v2.8.0
## New
- Added cocktail safety info
- Active search refinements are now by default expanded
- Approximate total liquid is now shown in cocktail recipe
- Show label for base ingredients

## Changes
- Cocktails list is now in 2 columns (if possible) on mobile

# v2.7.0
## New
- Shelf has more stats
- Added "Track parent ingredient" option to profile
- Updated collections screen

# v2.6.1
## Fixes
- Added missing loader on rating

# v2.6.0
## New
- Bar Assistant now has a new cloud offering and homepage: [barassistant.app](https://barassistant.app)
- Added bar members count
- Added image cropper
- Detailed info about edit and create timestamps moved to edit forms

## Changes
- Updated links to point to new homepage

# v2.5.0
## New
- Update accent font
- Moved fonts locally
- Ingredient details now have a link to cocktail list with current ingredient filter
- Show currently selected ingredient in ingredient finder

## Fixes
- Fixed issues with generating recipe images (related to font loading)
- Better handling of empty units in cocktail import

# v2.4.0
## New
- Show ingredient category on ingredients grid
- Bars are now grouped by status

## Fixes
- Added missing translations
- Fixed issues with role check when bar is not selected

# v2.3.0
## New
- Importing recipes from URL now shows more data
    - Show ingredient source string
    - Now imports ingredient notes

## Changes
- Dates are now shown in short form

## Fixes
- Added missing translations

# v2.2.1
## Fixes
- Fixed missing settings for moderators

# v2.2.0
## New
- Added new pages: forgot password, reset password, confirm account

## Changes
- Migrated dependency from popperjs to floatingui

# v2.1.2
## Changes
- Removed unused docker vars
- Added demo instance notice

# v2.1.1
## Fixes
- Added missing ingredient optional mark on shared recipes

# v2.1.0
## New
- You can now share specific collections with rest of the bar members
- You can now filter by user public collections
- Added number of cocktails to collections
- Added "Remember me" checkbox to login page
- Added last updated by information to cocktail and ingredient details

## Changes
- Markdown tags are now hidden from ingredient description in ingredient spotlight and ingredient list #88
- Refinements are now collapsable

# v2.0.5
## Fixes
- Fixed missing role string for "Guest"

## Changes
- Swapped edit and view actions in collections view

# v2.0.4
## Fixes
- Fix substitute units conversion #120

# v2.0.3
## Fixes
- Fix meta theme color
- Fix link to shelf ingredients from shelf

# v2.0.2
## Fixes
- Fix missing version info in footer

# v2.0.1
## Fixes
- Add major version tag to docker tags `v2`

# v2.0.0
This release marks support for Bar Assistant v3.0. Check Bar Assistant changelog for more info about new features.

## New
- Added support for multiple bars
- Splitted navigation
- Added an option to delete your profile
- Added current user role checking for actions
- Ingredient selector now supports variable amounts and notes
- On cocktail import page you can now manually match ingredients
- Added "Copy as YAML" to cocktail share
- Added new cocktail refinements
    - By average rating
    - By bar members
    - By members public shelves

## Changes
- Removed `BAR_NAME` env variable
    - Now uses bar name from current selected bar
- Removed `BAR_DESCRIPTION` env variable
    - Now uses bar subtitle from current selected bar
- Small design updates
- Updated import cocktail page
- Adding substitute ingredients is now a seperate action

# v1.20.2
## Fixes
- Fix image size preview in site search
- Fix clear refinements not clearing correctly #111
- Fix searching not resetting pagination #111

# v1.20.1
## Fixes
- Fix an issue with cocktail importing when glass or method was empty #108

# v1.20.0
## New
- Added utensils
- Added more actions to cocktail collections list
- Added garnish info to cocktail print layout

## Fixes
- Improved mapping cocktail method when importing cocktails

# v1.19.0
## New
- Added share shopping list in markdown format
- Added share cocktail in markdown format
- Added Recipe schema.org microdata to public page
- Added importing cocktails from a collection
- Added prev and next cocktail buttons
- Added sorting and filtering cocktails by number of ingredients

## Changes
- Updated ingredient details page
- Moved shopping list share functions to ingredients page

# v1.18.0
## New
- Added sort ingredients by number of cocktails

## Changes
- Ingredients list is now using Bar Assistant API for filtering and searching
    - This changes follows the changes introduced in last version with cocktails filtering

## Fixes
- Added missing collection dialog translations

# v1.17.0
## New
- Added user cocktail collections
    - You can now filter cocktails by collection
    - You can create a new collection from the current cocktail filters on cocktail list
- Added new sorting options to cocktail list
    - Sort by average rating
    - Sort by missing ingredients
    - Sort by date favorited
    - Sort by user rating
    - Sort by ABV
- Added cocktails count to glasses and tags list

## Changes
- Cocktails list is now using Bar Assistant API for filtering and searching
    - This is a bit slower but should solve a lot of issues with syncing state between Instantsearch and Salt Rim
    - New implementation is missing total results per refinement
    - Old implementation is still available at `/cocktails-legacy` URL

## Fixes
- Fixed site search sometimes missing autofocus on search input

# v1.16.1
## Fixes
- Fix cocktail without ingredients blank page #100

# v1.16.0
## New
- Added cocktail details sidebar
    - Added similar cocktails
    - Added ingredient spotlight
- Use custom bar name if set in window titles #94

# v1.15.1
## Fixes
- Fix vue-router/instantsearch URL syncing #95

# v1.15.0
## New
- You can now copy cocktail recipe details
    - As JSON for sharing to other Bar Assistant instances
    - As plain text for general sharing
- Improved cocktail importing
    - Added importing from YAML and JSON formats
- Added support for Meilisearch v1.2
- Allow fractional amounts without leading zeros #91

## Fixes
- Fix site search auto focusing on wrong input
- Fix missing sync between vue router and instantsearch history #87
- Fix unit/amount converting

# v1.14.1
## Fixes
- Fix translation errors #85
- Fix opened dialog back interaction #82
- Fix missing translations on public recipe

# v1.14.0
## New
- Added support for generating and sharing recipe images

# v1.13.0
## New
- Added support for DISABLE_LOGIN=true variable
    - This will disable the need to authenticate to Bar Assistant API instnace
    - Note that Bar Assistant API also needs to have this variable set to true

# v1.12.0
## New
- Supports Bar Assistant version > 2.0.0
- New locale supported: German

## Changes
- Use native color picker when possible
- Updated parent ingredient picker

# v1.11.0
## New
- Added dark theme
- Added light/dark theme switcher
- Added support for cocktail notes

## Fixes
- Fix some cocktail data not updating when switching cocktails #73
- Fix ingredient actions sometimes showing on top of dialogs
- Fix cocktail actions sometimes showing on top of dialogs

# v1.10.0
## New
- New locale supported: French
- Added new stat: Total shelf ingredients

## Fixes
- Removed leftover `console.log`

# v1.9.0
## New
- Added `Shelf ingredients` and `Shopping list ingredients` filtering to ingredients page.
- Added ThumbHash placeholder image while the real images are loading to cocktails page
- Added `DEFAULT_LOCALE` environment variable to override default language
- Added `ANALYTICS_SCRIPT` environment variable to setup opt in analytics tracking

## Fixes
- Added missing error message handling when doing actions on the ingredients in the shelf

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
