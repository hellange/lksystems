
# OBSOLETE:
This code worked for the older LKSystems webserver. This does not work for the newer LKSystems webserver and cloud solution.
Refer to [lksystems-cloud](https://github.com/hellange/lksystems-cloud2) instead.

## About

Experimental code to learn more about node, express, rest, typescript based projects and cloud deployment using docker-compose.

## LK Systems

Reads temperature and system settings from LK Systems Webserver.
Stores result periodically in a database.

## Preconditions
Add your lk system credentials in a lk_credentials.env file

## Build and run
1. Install dependencies - `npm install`

After that, after you do changes in the code:

2. Compile (and assets) - `npm run build`
3. Run the app + database - `docker-compose up`. It uses the lk system credentials from a environment file.

## Docker deploy
docker / docker-compose


## Url
Service should now be available on - `http://localhost:3000/api/v1/thermostats` and `http://localhost:3000/static/`

## References

Initial setup of node/typescript based on [blog post](http://mherman.org/blog/2016/11/05/developing-a-restful-api-with-node-and-typescript/#.WB3zyeErJE4).
