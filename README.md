FluidFox - Real-time log monitoring in your browser based in [NarrativeScience/Log.io](https://github.com/NarrativeScience/Log.io) 
===
> WARNING: FluidFox its not yet production ready, use it with caution.

# Installation

`npm i -g fluidfox`

And you are ready, execute `fluidfox` to see the help page.


# Running the server

1. Create or edit a json file where your server configuration is going to live.

`> cat server.json`
```json
{
    "port": 28777 // Port where your server is listening for socket connections
}
```

2. Run the server.

`fluidfox server server.json`

# Runing the harvester

1. Create or edit a json file where your harvester configuration is going to live.

`> cat harvester.json`
```json
{
    "nodeName": "application_server",
    "logStreams": {
        "application1": [
            {
                "name": "Custom name",
                "file": "/var/logs/obscure_file_name.log"
            }
        ],
        "nginx": [
            "/var/log/nginx/access.log",
            "/var/log/nginx/error.log"
        ]
    },
    "server": {
        "host": "localhost",
        "port": 28777
    }
}
```

2. Run the harvester.

`fluidfox harvester harvester.json`

Harvester will connect to the server and watch your files, when a file is modified, the new lines will be sended to the server.

# Running the web server

1. Create or edit a json file where your client configuration is going to live.

`> cat web.json`
```json
{
    "port": 8080 // Port where the web server will be accesible
}
```

2. Run the web server.

`fluidfox web web.json`

3. Browse to the IP/domain of the web server and access with the configured port, example http://127.0.0.1/8080