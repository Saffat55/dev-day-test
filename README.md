# Starter Theme
A barebones starting point for theme development

All of the nitty-gritty stuff is already taken care of, so you can focus on the fun part — building out a beautiful front-end

### Getting Started
The following steps assume you have [Yarn](https://yarnpkg.com/en/docs/install#mac-stable) installed on your machine

1. Open your terminal and navigate to the directory where you want your new project to live

2. Create your new project by running the following command:

    `git clone https://bitbucket.org/pointercreative/starter-theme-webpack && rm -rf starter-theme-webpack/.git`

3. Update the folder name to an appropriate one for your new project by running the following command: `mv starter-theme-webpack folder-name`

    Note: You must replace the `folder-name` portion of the above command with your desired name.

4. Navigate into the folder in your terminal

5. Run `yarn install`

6. Run `yarn setup` to initialize a new theme and generate your `config.yml`. You'll need your store url & api password (Apps > Manage Private Apps)

7. Run `yarn start`

### Commands
`yarn start` - Development watch mode w/ hot module reloading.

`yarn build` - Production build. `dist` folder contains all of your compiled code.

`yarn deploy` - Build & deploy theme. By default this will deploy to the development environment in the `config.yml` file. An alternate environment should be used instead since we're using HMR (see below).

Example: `yarn deploy --env=staging`.

Note: If you are deploying to the live theme you will need to add an additional flag. Example: `yarn deploy --env=production --allow-live`

### Config.yml
The `config.yml` contains your different themes/environemnts. This file will be auto-generated when running `yarn setup` (see above).

For improved local development performance, it's recommended to ignore `.js` files within the development ThemeKit environment (see below example). This is now automatically included.

Since we're using HMR for development (where assets are loaded locally), watching/deploying .js files is unneccessary and can eat into performance. Note that running `yarn deploy` in this case on the development environment will no longer deploy production .js files. You should instead use another ThemeKit environment for deploying such as `staging`.

Example structure:

    development:
        password: password
        theme_id: "theme_id"
        store: store.myshopify.com
        directory: dist/
        ignore_files:
            - config/settings_data.json
            - "*.js"
    staging:
        password: password
        theme_id: "theme_id"
        store: store.myshopify.com
        directory: dist/
        ignore_files:
            - config/settings_data.json
    production:
        password: password
        theme_id: "theme_id"
        store: store.myshopify.com
        directory: dist/
        ignore_files:
            - config/settings_data.json

### SCSS
Global styles should be added to `src/views/layout/theme/theme.scss`

Global variables should be added to `src/styles/helpers/_variables.scss`

Template specific styles should be imported into a matching JS file.

Example:

If you have a `cart.scss` file in the `src/views/templates/cart` directory, you need to import this file into a JS file called `cart.js` in the same directory.

### Grid
You can use a breakpoint class in combination with a number between 1-12 to specify your column width

Here is a list of available breakpoint classes, followed by a markup example

```
all
small
medium-down
medium-up
large
xlarge
```

```
<div class="grid">
    <div class="grid__item medium-up--6">
        <p>Column content</p>
    </div>

    <div class="grid__item medium-up--6">
        <p>Column content</p>
    </div>
</div>
```

### Grid Modifier Classes
`grid--full` - This will make your grid full width and gutterless

`grid--uniform` - This will retain a uniform grid even if grid items are different heights

`grid--table` - This will vertically align grid items

### Helper Classes
`text-center` - This will center your text

`text-right` - This will right align your text

`text-left` - This will left align your text

`clearfix` - This will clear your element

`visually-hidden` - This will hide your element but allow screen readers to detect it

### Fonts
To add custom fonts to your project take the following steps:

1. Add your font family to `/src/assets/fonts/`

2. **@font-face** import your font family in `/src/styles/core/_fonts.scss`

3. Create a global variable for your font in `/src/styles/helpers/_variables.scss`

4. Start using your newly declared font variable

### Icons
Icons added to `/src/assets/svgs/` will automatically generate a new snippet with the prefix `icon-`

To add a new icon to your project take the following steps:

1. Add your icon to `/src/assets/svgs/`

2. Add `{% render 'icon-name' %}` where you want your icon to appear.

### Images
All images are lazy-loaded using the [Lazysizes](https://github.com/aFarkas/lazysizes) plugin

To include a lazy-loaded image take the following steps:

1. Add `{% render 'responsive-image' %}` where you want the image to appear

2. Pass all of your desired variables to the `{% render 'responsive-image %}` snippet

    Example:
    ```
    {% render 'responsive-image' with
        image: section.settings.image,
        max_width: 800,
        max_height: 800
    %}
    ```

`{% render 'responsive-image %}` accepts the following variables:

```
max_width: {Number} Max width of the image container
max_height: {Number} Max height of the image container
image: {Object} Image object
image_class: {String} class name of the <img />
image_attributes: {String}  additional HTML attributes of the <img />
wrapper_class: {String} class name of the <div> wrapper
wrapper_attributes: {String} additional HTML attributes of the <div> wrapper
```

### Background images
To include a lazy-loaded background image take the following steps:

1. Add the class `lazyload` to the element you want to apply the background image to

2. Add `data-bgset="{% render 'responsive-bg-image %}"` to the element

3. Pass your image object to the `{% render 'responsive-bg-image %}` snippet

    Example:
    `data-bgset="{% render 'responsive-bg-image', image: section.settings.image %}"
    `

### Javascript
Javascript should be added to `/src/scripts/`

**Note:** If you use a `<script>` tag within a template always wrap your code in a `DOMContentLoaded` function

Example:
```
<script type="text/javascript">
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Woohoo!');
    });
</script>
```

### Syncing code
If you suspect code changes have been made to the production theme you will have to sync those changes to your `/src/` folder

To sync the code take the following steps:

1. Remove `dist` from the `.gitignore` file

2. Run `yarn build`

3. Run `git add .`

4. Run `git commit -m 'Track dist folder'`

5. Run `git push`

6. Navigate to `/dist/` in your terminal

7. Run `touch config.yml`

8. Run `open config.yml`

9. Add the environment you would like to download from to the newly created `config.yml` file

    Example:

        development:
            password: password
            theme_id: "theme_id"
            store: store.myshopify.com
            ignore_files:
                - config/settings_data.json

10. Run `theme download`

11. Use the built in diff comparison in your editor to see if any files have changed

12. Copy over any changes to your `/src/` folder

13. Re-add `dist` to the `.gitignore` file

14. Navigate to the root of the project in your terminal

15. Run `git rm --cached dist -r`

16. Run `git add .`

17. Run `git commit -m 'Resync with shop'`

18. Run `git push`