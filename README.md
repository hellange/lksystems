Reads temperature and system settings from LK Systems Webserver.
Stores result periodically in a database.

Initially based on [blog post](http://mherman.org/blog/2016/11/05/developing-a-restful-api-with-node-and-typescript/#.WB3zyeErJE4).

More or less completely rewritten after that.

1. Install dependencies - `npm install`

After that, after you do changes in the code:

2. Compile (and assets)- `npm run build`
3. Run the app + database - `LK_URL=http://<yourid>.lkics.net:<yourport> LK_USERNAME=lk LK_PASSWORD=DTyqD7K4 docker-compose up`. Use the username and password for your lk-systems webserver.
