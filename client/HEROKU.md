## Deploy on HEROKU


1. **run `npm run build`**
1. **go to `dist` folder**
1. **run `git init`**
1. **run `git add .`**
1. **run `git commit -m'initial import' -a`**
1. **run `heroku git:remote --app rxmonitor`**
1. **create file `index.php` containing:**
> `<?php header( 'Location: /index.html' ) ;  ?>`
1. **run `git push heroku master` **


Refers to [How to Deploy a Static Site to Heroku](https://blog.teamtreehouse.com/deploy-static-site-heroku)
