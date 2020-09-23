## Deploy on HEROKU


1. **run `npm run build`**
1. **go to `dist` folder**
1. **run `git init`**
1. **run `git add .`**
1. **run `git commit -m'initial import' -a`**
1. **run `heroku git:remote --app rxmonitor`**
1. **create file `index.php` containing:**
> `echo '<?php header( 'Location: /index.html' ) ; ?>' > index.php`
1. `touch requirements.txt`
1. **run `git push heroku master` **

## Refers to 

* [How to Deploy a Static Site to Heroku](https://blog.teamtreehouse.com/deploy-static-site-heroku)
* [Stackoverflow](https://stackoverflow.com/a/51931233/521197)

