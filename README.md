## Pantry Pal <hr>

Pantry Pal is an applicaton that will allow you to keep track of all your foods before they expire!  With a simple and intuitive UI, you can always keep track of the current status of your foods!.

## Motivation <hr>

Do you find that you often forget about the food in the back of your fridge or hidden away in your pantry?  I know that this happens to me a lot.  I wanted to make an application that would be simple enough to use and informative enough so that I can always keep track of the foods that I have.

## Tech/Framework Used <hr>

jQuery, Bootstrap, EJS, Node.js, Express, Bcrypt, MySQL, RESTFUL

## Features

1. To visual indicate the state of each food, the icon of that item will change color over time from a green to a red hue.
2. Custom items may be added and a custom expiration date may be specified.  This custom item will only appear for the user that create them.
3. In the inventory page, only custom items may be deleted from the inventory.  This is to ensure that the 'core' foods do not get deleted as they must appear for all users.

## Installation <hr>

1. Clone repo into project folder
2. Run `npm i` to install all node packages
3. Create database by going into db folder and with mysql shell, run: `SOURCE schema.sql;`<br> 
    `SOURCE seeds.sql;`
4. Now that the database has been created, run server with <br>`nodemon server.js`
5. In browser, go to `localhost:3000/` and begin using app.

## How it works <hr>
1. Upon first log in, you will see that the pantry page is empty.  You must go to inventory to add common foods that you buy.
2. In the inventory page, select on all icons that you would like in your pantry.
3. The add to pantry button will updated the groups of icon that will by default be on the home screen.
4. When these icons are first added, they will have a white background.  This indicates that they are in a pending state.  You have no bought any of this item yet.
5. By clicking on the icon, they will change to a green color which indicates that they have just been bought.
6. Overtime, this color will slowly change to a red hue.
7. This red hue indicates that the item will expire soon.
8. You will also see a small `x` in the right top corner of each icon.  Clicking this will remove this icon from the home page and also unselect it from the inventory page.

##  Feel Free to message me with any questions!
