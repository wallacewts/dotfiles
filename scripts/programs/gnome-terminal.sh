#!/bin/bash

echo "☣️ Installing Gnome Terminal"
sudo apt-get install -y dconf-cli
git clone https://github.com/dracula/gnome-terminal ${HOME}
cd "${HOME}/gnome-terminal"
./install.sh