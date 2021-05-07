#!/bin/bash

figlet Installing Beekeeper Studi | lolcat

# Install our GPG key
wget --quiet -O - https://deb.beekeeperstudio.io/beekeeper.key | sudo apt-key add -

# add our repo to your apt lists directory
echo "deb https://deb.beekeeperstudio.io stable main" | sudo tee /etc/apt/sources.list.d/beekeeper-studio-app.list

# Update apt and install
sudo apt update
sudo apt install beekeeper-studio