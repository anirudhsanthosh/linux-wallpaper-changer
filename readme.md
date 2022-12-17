

add cron

command : crontab -e

* * * * * env DISPLAY=:0 DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus  /home/darkloard/Desktop/learning/wallpaper/src/change.sh
30 * * * * /home/darkloard/Desktop/learning/wallpaper/src/get.sh


create a .env file 
and add 

### PIXABAY_KEY
variable 


