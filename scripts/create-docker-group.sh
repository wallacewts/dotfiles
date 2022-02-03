#!/bin/bash

if [ ! $(getent group docker) ]; then
    sudo groupadd docker
fi

sudo usermod -aG docker $USER

newgrp docker

