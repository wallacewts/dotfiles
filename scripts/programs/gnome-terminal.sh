#!/bin/bash

figlet Installing Gnome Terminal | lolcat
sudo apt-get install -y dconf-cli
git clone https://github.com/dracula/gnome-terminal "${HOME}/.gnome-terminal"
cd  "${HOME}/.gnome-terminal"
./install.sh

