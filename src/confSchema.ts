export const harvesterJsonSchema = {
    definitions: {},
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "http://example.com/root.json",
    type: "object",
    title: "Harvester configuration schema",
    required: [
        "nodeName",
        "logStreams",
        "server",
    ],
    properties: {
        nodeName: {
            $id: "#/properties/nodeName",
            type: "string",
            title: "Nodename",
            default: "",
            examples: [
                "web_server",
            ],
            pattern: "^(.*)$",
        },
        logStreams: {
            $id: "#/properties/logStreams",
            type: "object",
            title: "Logger groups",
            minProperties: 1,
            patternProperties: {
                ".*": {
                    type: "array",
                    minItems: 1,
                    uniqueItems: true,
                    items: {
                        anyOf: [
                            {
                                type: "string",
                                examples: [
                                    "/var/log/nginx/access.log",
                                    "/var/log/nginx/error.log",
                                ]
                            },
                            {
                                type: "object",
                                required: [
                                    "name",
                                    "file"
                                ],
                                properties: {
                                    name: {
                                        type: "string"
                                    },
                                    file: {
                                        type: "string"
                                    }
                                },
                                examples: [
                                    {
                                        name: "Obscure log",
                                        file: "/var/log/fjdshf.log"
                                    }
                                ],
                            }
                        ]
                    },
                },
            },
        },
        server: {
            $id: "#/properties/server",
            type: "object",
            title: "Server connection config",
            required: [
                "host",
                "port",
            ],
            properties: {
                host: {
                    $id: "#/properties/server/properties/host",
                    type: "string",
                    title: "IP or hostname of the server",
                    default: "",
                    examples: [
                        "127.0.0.1",
                    ],
                    pattern: "^(.*)$",
                },
                port: {
                    $id: "#/properties/server/properties/port",
                    type: "integer",
                    title: "Port of the server",
                    default: 28777,
                    examples: [
                        28777,
                    ],
                },
            },
        },
    },
};
